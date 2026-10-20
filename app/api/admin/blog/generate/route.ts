import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/ai/generateBlogPost';
import { sanitizeBlogOutput } from '@/lib/ai/sanitizeBlogOutput';
import { withIdempotency } from '@/lib/idempotency';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Check admin auth
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    const idempotencyKey =
      request.headers.get('idempotency-key') ||
      request.headers.get('x-idempotency-key');

    const body = await request.json();
    const { topic, tone, keywords, wordCount, audience, category, model } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const safeTopic = String(topic).slice(0, 500);
    const safeTone = tone ? String(tone).slice(0, 100) : undefined;
    const safeAudience = audience ? String(audience).slice(0, 200) : undefined;
    const safeCategory = category ? String(category).slice(0, 100) : undefined;
    const safeModel = model ? String(model).slice(0, 100) : undefined;
    const safeWordCount =
      typeof wordCount === 'number'
        ? Math.min(Math.max(Math.round(wordCount), 200), 3000)
        : undefined;
    const safeKeywords = Array.isArray(keywords)
      ? keywords.slice(0, 10).map((k: unknown) => String(k).slice(0, 60))
      : undefined;

    const key =
      idempotencyKey ||
      body.idempotency_key ||
      `ai-${safeTopic.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}`;

    const result = await withIdempotency(key, async () => {
      const generated = await generateBlogPost({
        topic: safeTopic,
        tone: safeTone,
        keywords: safeKeywords,
        wordCount: safeWordCount,
        audience: safeAudience,
        category: safeCategory,
        model: safeModel,
      });

      return {
        statusCode: 200,
        data: sanitizeBlogOutput(generated),
      };
    });

    const headers: Record<string, string> = {};
    if (result.isReplay) {
      headers['X-Idempotent-Replay'] = 'true';
    }

    return NextResponse.json(result.data, { status: result.statusCode, headers });
  } catch (err: unknown) {
    const errorObj = err as any;
    if (errorObj?.isConcurrentConflict) {
      return NextResponse.json({ error: errorObj.message }, { status: 409 });
    }
    console.error('[admin/blog/generate] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate blog post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

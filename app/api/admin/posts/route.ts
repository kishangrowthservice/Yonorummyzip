import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAllPosts, createPost } from '@/lib/postsStore';
import { withIdempotency } from '@/lib/idempotency';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get('status') || 'all') as 'all' | 'published' | 'draft';
    const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
    const siteParam = searchParams.get('site') || currentSite;
    const posts = await getAllPosts(statusParam, false, siteParam);
    return NextResponse.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'private, no-cache, stale-while-revalidate=30',
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch posts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
  }

  try {
    const idempotencyKey =
      req.headers.get('idempotency-key') ||
      req.headers.get('x-idempotency-key');

    const body = await req.json();

    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 });
    }

    const key = idempotencyKey || body.idempotency_key || null;

    const result = await withIdempotency(key, async () => {
      const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
      const seoTitle = body.seo_title || body.meta_title || body.title;
      const seoDescription =
        body.seo_description || body.meta_description || body.excerpt || body.title;
      const excerpt = body.excerpt || seoDescription;

      const post = await createPost({
        slug: body.slug,
        title: body.title,
        excerpt,
        content: body.content || '',
        cover_image: body.cover_image || body.cover_image_url || null,
        author: body.author || 'Yono Games Desk',
        category: body.category || 'Yono Games Guides',
        status: body.status || 'draft',
        ai_generated: Boolean(body.ai_generated),
        target_site: currentSite,
        seo_title: seoTitle,
        seo_description: seoDescription,
        tags: body.tags || [],
        published_at:
          body.status === 'published' ? body.published_at || new Date().toISOString() : null,
      });

      try {
        revalidatePath('/blog');
        revalidatePath('/blog/[slug]', 'page');
        revalidatePath('/admin/blog');
        revalidatePath('/');
      } catch {
        // ignore
      }

      return {
        statusCode: 201,
        data: { post },
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
    const msg = err instanceof Error ? err.message : 'Failed to create post';
    const isDuplicateSlug =
      msg.includes('duplicate key') ||
      msg.includes('already exists') ||
      msg.includes('yono_posts_slug_key');
    if (isDuplicateSlug) {
      return NextResponse.json(
        { error: 'An article with this slug already exists. Please choose a different slug.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

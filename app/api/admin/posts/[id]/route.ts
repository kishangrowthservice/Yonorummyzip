import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/postsStore';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
    const post = await getPostById(id, currentSite);
    if (!post) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err: unknown) {
    console.error('[GET /api/admin/posts/[id]] Error:', err);
    const msg = err instanceof Error ? err.message : 'Error fetching post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
    const body = await req.json();

    const normalized = {
      ...body,
      target_site: currentSite,
      cover_image: body.cover_image || body.cover_image_url || undefined,
      seo_title: body.seo_title || body.meta_title || body.title || undefined,
      seo_description: body.seo_description || body.meta_description || body.excerpt || undefined,
      excerpt: body.excerpt || body.seo_description || body.meta_description || undefined,
    };

    const updated = await updatePost(id, normalized, currentSite);
    return NextResponse.json({ post: updated });
  } catch (err: unknown) {
    console.error('[PUT /api/admin/posts/[id]] Error:', err);
    const msg = err instanceof Error ? err.message : 'Error updating post';
    const isNotFound = msg.includes('not found') || msg.includes('unauthorized');
    return NextResponse.json({ error: msg }, { status: isNotFound ? 404 : 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
    const success = await deletePost(id, currentSite);
    if (!success) {
      return NextResponse.json({ error: 'Post not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[DELETE /api/admin/posts/[id]] Error:', err);
    const msg = err instanceof Error ? err.message : 'Error deleting post';
    const isNotFound = msg.includes('not found') || msg.includes('unauthorized');
    return NextResponse.json({ error: msg }, { status: isNotFound ? 404 : 500 });
  }
}

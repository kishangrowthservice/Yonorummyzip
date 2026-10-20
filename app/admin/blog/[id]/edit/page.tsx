import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/postsStore';
import { PostEditor } from '@/app/admin/components/blog/PostEditor';
import type { PostRecord } from '@/lib/validations/post';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
  const post = await getPostById(id, currentSite);

  if (!post) {
    notFound();
  }

  const postRecord: PostRecord = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: Array.isArray(post.content) ? post.content.join('\n\n') : String(post.content || ''),
    meta_description: post.seo_description || post.excerpt || '',
    cover_image_url: post.cover_image || '',
    author: post.author || 'Yono Games Desk',
    category: post.category || 'Yono Games Guides',
    tags: post.tags || [],
    status: post.status === 'published' ? 'published' : 'draft',
    source: (post.source as 'manual' | 'ai' | 'ai-edited') || 'manual',
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at || post.created_at,
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-300">
          <Link
            href="/admin/blog"
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-300 text-slate-800 hover:text-slate-950 hover:bg-slate-50 shadow-xs transition-all shrink-0 no-underline"
            title="Back to Blog Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Edit Blog Post
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 shrink-0">
                Live CMS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-normal">
              Modify article content, cover image, and SEO metadata. Changes persist instantly.
            </p>
          </div>
        </div>

        <PostEditor initialData={postRecord} />
      </div>
    </div>
  );
}

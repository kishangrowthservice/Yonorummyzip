import Link from 'next/link';
import { PlusCircle, Globe, ExternalLink, ArrowLeft } from 'lucide-react';
import { getAllPosts } from '@/lib/postsStore';
import { PostTable } from '@/app/admin/components/blog/PostTable';
import type { PostSummary } from '@/lib/validations/post';

export const dynamic = 'force-dynamic';

export default async function AdminBlogDashboardPage() {
  const currentSite = process.env.SITE_DOMAIN || 'allyonogames99.com';
  const posts = await getAllPosts('all', false, currentSite);

  const postList: PostSummary[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    meta_description: p.seo_description || p.excerpt || '',
    cover_image_url: p.cover_image || '',
    author: p.author || 'Yono Games Desk',
    category: p.category || 'Yono Games Guides',
    tags: p.tags || [],
    status: p.status === 'published' ? 'published' : 'draft',
    source: (p.source as 'manual' | 'ai' | 'ai-edited') || 'manual',
    published_at: p.published_at,
    created_at: p.created_at,
    updated_at: p.updated_at || p.created_at,
  }));

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-300">
          <div className="flex items-center gap-3.5">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-300 text-slate-800 hover:text-slate-950 hover:bg-slate-50 shadow-xs transition-all shrink-0 no-underline"
              title="Back to Apps Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Yono Games Articles
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 shrink-0">
                  Live CMS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-normal">
                Manage, draft, edit, AI-generate, and publish blog articles live on All Yono Games 99.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
            <Link
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 hover:text-indigo-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs no-underline text-center"
            >
              <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Live Blog</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
            </Link>

            <Link
              href="/admin/blog/new"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer no-underline active:scale-[0.98] border-0 text-center"
            >
              <PlusCircle className="w-4 h-4 text-white flex-shrink-0" />
              <span>New Article</span>
            </Link>
          </div>
        </div>

        {/* Main Post Table with Search, Filter Tabs, Delete Modal */}
        <PostTable initialPosts={postList} />
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PostEditor } from '@/app/admin/components/blog/PostEditor';

export default function NewBlogPostPage() {
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
                Create Blog Post
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 shrink-0">
                Yono Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-normal">
              Write manually or generate full structured articles with AI, real-time slug generation, and rich Tiptap editor.
            </p>
          </div>
        </div>

        <PostEditor />
      </div>
    </div>
  );
}

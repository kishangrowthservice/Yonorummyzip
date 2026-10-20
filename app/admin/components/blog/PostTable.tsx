'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Loader2,
  FileText,
  PlusCircle,
  X,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PostSummary } from '@/lib/validations/post';
import { ConfirmDialog } from './ConfirmDialog';

interface PostTableProps {
  initialPosts: PostSummary[];
}

export function PostTable({ initialPosts }: PostTableProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });

  // Calculate counts for filter pills
  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.author && post.author.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ? true : post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  const handleDeleteTrigger = (id: string, title: string) => {
    setConfirmDelete({
      isOpen: true,
      id,
      title,
    });
  };

  const handleConfirmDelete = async () => {
    const { id, title } = confirmDelete;
    if (!id) return;

    setDeletingId(id);
    const toastId = toast.loading('Deleting article...');

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error('Failed to delete post', {
          id: toastId,
          description: data.error,
        });
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted successfully', {
        id: toastId,
        description: `"${title}" has been permanently removed.`,
      });
      setConfirmDelete({ isOpen: false, id: '', title: '' });
    } catch {
      toast.error('Unexpected error deleting post', { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Blog Post?"
        description={`Are you sure you want to permanently delete "${confirmDelete.title}"?`}
        confirmLabel="Delete Post"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', title: '' })}
      />

      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-3xl bg-white border border-slate-300 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'published', 'draft'] as const).map((filter) => {
            const count = counts[filter];
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap border-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, slug, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-8 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
            style={{ borderStyle: 'solid' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 border-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-slate-300 bg-white overflow-hidden shadow-xs">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <FileText className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No articles found</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
              {searchQuery
                ? `No posts matched your search for "${searchQuery}".`
                : 'No posts in this status category.'}
            </p>
            <div className="pt-2">
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer no-underline border-0"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Create First Post</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                    <th className="py-3.5 px-6">Article</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Byline &amp; Tags</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredPosts.map((post) => {
                    const isDeletingThis = deletingId === post.id;
                    const dateStr = post.published_at || post.created_at;
                    const displayDate = dateStr
                      ? new Date(dateStr).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Title & Slug */}
                        <td className="py-4 px-6 max-w-md">
                          <div className="space-y-1">
                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
                            >
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                              <span>/blog/{post.slug}/</span>
                              {post.source === 'ai' || post.source === 'ai-edited' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  AI
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              post.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {post.status === 'published' ? 'Live' : 'Draft'}
                          </span>
                        </td>

                        {/* Byline & Tags */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-700">
                              {post.author || 'Yono Games Desk'}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{displayDate}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Live Preview Button */}
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Preview on live site"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Edit Button */}
                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit article"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteTrigger(post.id, post.title)}
                              disabled={isDeletingThis}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete article"
                            >
                              {isDeletingThis ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPosts.map((post) => {
                const isDeletingThis = deletingId === post.id;
                const dateStr = post.published_at || post.created_at;
                const displayDate = dateStr
                  ? new Date(dateStr).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <div key={post.id} className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
                      >
                        {post.title}
                      </Link>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {post.status === 'published' ? 'Live' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>/blog/{post.slug}/</span>
                      {post.source === 'ai' || post.source === 'ai-edited' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          AI
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{displayDate}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrigger(post.id, post.title)}
                          disabled={isDeletingThis}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          {isDeletingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

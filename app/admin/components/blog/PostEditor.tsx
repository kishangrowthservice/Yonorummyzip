'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import slugify from 'slugify';
import { toast } from 'sonner';
import {
  Save,
  Send,
  Trash2,
  Loader2,
  Lock,
  Unlock,
  Sparkles,
  PenTool,
  Info,
  Eye,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { postSchema, type PostInput, type PostRecord } from '@/lib/validations/post';
import { ImageUpload } from './ImageUpload';
import { TagInput } from './TagInput';
import { AIGeneratorPanel } from './AIGeneratorPanel';
import { ConfirmDialog } from './ConfirmDialog';
import type { GenerateBlogPostOutput } from '@/lib/ai/generateBlogPost';
import { SITE_CONFIG } from '@/lib/blog-config';

function getDraftKey(postId?: string) {
  return `yono-blog-draft-${postId ?? 'new'}`;
}

const TiptapEditor = dynamic(
  () => import('./TiptapEditor').then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[350px] w-full rounded-3xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-slate-400 animate-pulse shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-medium">Loading rich text editor...</span>
      </div>
    ),
  }
);

interface PostEditorProps {
  initialData?: PostRecord | null;
}

export function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [editorMode, setEditorMode] = useState<'manual' | 'ai'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData?.slug));
  const [isAiGenerated, setIsAiGenerated] = useState(
    initialData?.source === 'ai' || initialData?.source === 'ai-edited'
  );
  const [originalAiContent, setOriginalAiContent] = useState<string | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const draftKey = getDraftKey(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      meta_description: initialData?.meta_description || initialData?.excerpt || '',
      cover_image_url:
        initialData?.cover_image_url ||
        initialData?.cover_image ||
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      author: initialData?.author || 'Yono Games Desk',
      category: initialData?.category || 'Yono Games Guides',
      tags: initialData?.tags || ['Yono Games', 'Rummy', 'Teen Patti'],
      status: initialData?.status || 'draft',
      source: initialData?.source || 'manual',
      reading_time_minutes: initialData?.reading_time_minutes || 4,
    },
  });

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const contentValue = watch('content');
  const metaDescriptionValue = watch('meta_description') || '';
  const statusValue = watch('status');

  // Prevent accidental navigation when form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  // Check localStorage draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.title && (!initialData || draft.title !== initialData.title)) {
          setShowDraftBanner(true);
        }
      }
    } catch {
      // ignore
    }
  }, [draftKey, initialData]);

  // Auto-save form contents locally every 15s
  useEffect(() => {
    if (!titleValue && !contentValue) return;
    const interval = setInterval(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            title: titleValue,
            slug: slugValue,
            content: contentValue,
            meta_description: metaDescriptionValue,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [draftKey, titleValue, slugValue, contentValue, metaDescriptionValue]);

  // Auto-slugify title if slug is not explicitly locked
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue('title', newTitle, { shouldValidate: true, shouldDirty: true });

    if (!isSlugCustomized) {
      const generatedSlug = slugify(newTitle, {
        lower: true,
        strict: true,
        trim: true,
      });
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  const handleAiGenerated = (output: GenerateBlogPostOutput) => {
    setValue('title', output.title, { shouldValidate: true, shouldDirty: true });
    setValue('slug', output.slug, { shouldValidate: true, shouldDirty: true });
    setValue('content', output.content, { shouldValidate: true, shouldDirty: true });
    if (output.metaDescription) {
      setValue('meta_description', output.metaDescription, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (output.suggestedTags && output.suggestedTags.length > 0) {
      setValue('tags', output.suggestedTags, { shouldValidate: true, shouldDirty: true });
    }
    setIsAiGenerated(true);
    setOriginalAiContent(output.content);
    setIsSlugCustomized(true);
    setEditorMode('manual');
    setTimeout(() => {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 100);
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (isSubmitting || isDeleting) return;

    setIsSubmitting(true);
    setValue('status', targetStatus);

    const onValid = async (formData: PostInput) => {
      const actionLabel = targetStatus === 'published' ? 'Publishing' : 'Saving draft';
      const toastId = toast.loading(`${actionLabel}...`, {
        description: 'Saving article to database.',
      });

      try {
        let finalSource = formData.source;
        if (isAiGenerated) {
          if (originalAiContent && contentValue !== originalAiContent) {
            finalSource = 'ai-edited';
          } else if (!formData.source || formData.source === 'manual') {
            finalSource = 'ai';
          }
        }

        const payload = {
          ...formData,
          target_site: SITE_CONFIG.domain,
          status: targetStatus,
          source: finalSource,
          ai_generated: isAiGenerated,
          cover_image: formData.cover_image_url,
          seo_title: formData.title,
          seo_description: formData.meta_description || formData.title,
          published_at: targetStatus === 'published' ? new Date().toISOString() : null,
        };

        const url = isEditing && initialData?.id
          ? `/api/admin/posts/${initialData.id}`
          : '/api/admin/posts';
        const method = isEditing && initialData?.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error('Failed to save article', {
            id: toastId,
            description: data.error || 'Server error',
          });
          return;
        }

        toast.success(
          targetStatus === 'published'
            ? 'Article published successfully!'
            : 'Draft saved successfully!',
          {
            id: toastId,
            description:
              targetStatus === 'published'
                ? `Your article is now live on ${SITE_CONFIG.name}.`
                : 'Your changes have been saved to the database.',
          }
        );

        try {
          localStorage.removeItem(draftKey);
        } catch {
          // ignore
        }

        router.push('/admin/blog');
        router.refresh();
      } catch (err: unknown) {
        toast.error('Unexpected error saving article', {
          id: toastId,
          description: err instanceof Error ? err.message : 'Please check connection.',
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const onInvalid = () => {
      setIsSubmitting(false);
      toast.error('Validation Error', {
        description: 'Please verify that title, slug, and content are properly filled.',
      });
    };

    await handleSubmit(onValid, onInvalid)();
  };

  const handleConfirmDelete = async () => {
    if (!initialData?.id || isDeleting) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting article from database...');

    try {
      const response = await fetch(`/api/admin/posts/${initialData.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error('Failed to delete article', {
          id: toastId,
          description: data.error,
        });
        return;
      }

      toast.success('Article deleted successfully', {
        id: toastId,
        description: 'Article permanently removed.',
      });
      setIsConfirmDeleteOpen(false);
      router.push('/admin/blog');
      router.refresh();
    } catch {
      toast.error('Unexpected error deleting article', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-24 sm:pb-8 font-sans">
      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Blog Post?"
        description={`Are you sure you want to delete "${
          titleValue || 'this post'
        }"? This action cannot be undone.`}
        confirmLabel="Delete Post"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900">
              <span className="font-bold">Unsaved draft recovered.</span> You have a locally autosaved version newer than database save.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                try {
                  const raw = localStorage.getItem(draftKey);
                  if (!raw) return;
                  const draft = JSON.parse(raw) as {
                    title?: string;
                    content?: string;
                    meta_description?: string;
                    slug?: string;
                  };
                  if (draft.title) setValue('title', draft.title, { shouldDirty: true });
                  if (draft.slug) setValue('slug', draft.slug, { shouldDirty: true });
                  if (draft.content) setValue('content', draft.content, { shouldDirty: true });
                  if (draft.meta_description)
                    setValue('meta_description', draft.meta_description, { shouldDirty: true });
                  toast.success('Draft restored into editor.');
                } catch {
                  toast.error('Could not restore draft.');
                }
                setShowDraftBanner(false);
              }}
              className="px-4 py-1.5 rounded-2xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(draftKey);
                setShowDraftBanner(false);
              }}
              className="px-4 py-1.5 rounded-2xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      {!isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-300 shadow-xs">
          <div className="inline-flex items-center p-1 bg-white rounded-2xl border border-slate-200 shadow-xs gap-1">
            <button
              type="button"
              onClick={() => setEditorMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
                editorMode === 'manual'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Write Manually
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
                editorMode === 'ai'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate with AI
            </button>
          </div>

          <span className="text-xs font-medium text-slate-700 hidden sm:inline px-3">
            {editorMode === 'ai'
              ? '✨ AI generates structured editorial copy directly into Tiptap editor.'
              : '✍️ Write or paste formatted content directly.'}
          </span>
        </div>
      )}

      {/* AI Assistant Drawer */}
      {editorMode === 'ai' && !isEditing && (
        <AIGeneratorPanel onGenerated={handleAiGenerated} disabled={isSubmitting} />
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-300 bg-white sticky top-2 sm:top-4 z-20 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isEditing ? 'Editing Article' : 'Draft Article'}
          </span>
          <span
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase ${
              statusValue === 'published'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {statusValue === 'published' ? 'Live' : 'Draft'}
          </span>
          {isAiGenerated && (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Sourced
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {slugValue && (
            <Link
              href={`/blog/${slugValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-800 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              Preview Live
            </Link>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline sm:inline">Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting || isDeleting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer shadow-xs text-center"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-700" />
            )}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSubmitting || isDeleting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98] border-0 text-center"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
            <span>Publish Post</span>
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                Post Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-mono text-slate-600 font-semibold">
                {(titleValue || '').length} characters
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. How to Win Teen Patti on Yono Rummy with Pro Discarding"
              value={titleValue || ''}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 focus:border-indigo-600 text-slate-900 text-base sm:text-lg font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
              style={{ borderStyle: 'solid' }}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSlugCustomized(!isSlugCustomized)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 transition-colors cursor-pointer border-0"
              >
                {isSlugCustomized ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Locked Custom Slug
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-indigo-700" />
                    Auto-Generating Slug
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs text-slate-500 font-mono font-semibold select-none">
                /blog/
              </span>
              <input
                type="text"
                placeholder="yono-games-winning-strategy"
                {...register('slug')}
                onChange={(e) => {
                  setIsSlugCustomized(true);
                  const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  setValue('slug', clean, { shouldValidate: true, shouldDirty: true });
                }}
                className="w-full pl-16 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 focus:border-indigo-600 text-xs sm:text-sm text-indigo-800 font-mono font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
                style={{ borderStyle: 'solid' }}
              />
            </div>
            {errors.slug && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.slug.message}</p>
            )}
          </div>

          {/* Rich Tiptap Editor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
              Post Content <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  content={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
            {errors.content && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="p-5 rounded-3xl border border-slate-300 bg-white space-y-2.5 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Cover Image Asset
            </label>
            <Controller
              name="cover_image_url"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          {/* Category Select */}
          <div className="p-5 rounded-3xl border border-slate-300 bg-white space-y-2 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Content Category
            </label>
            <select
              {...register('category')}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all cursor-pointer"
              style={{ borderStyle: 'solid' }}
            >
              <option value="Yono Games Guides">Yono Games Guides</option>
              <option value="Teen Patti & Rummy">Teen Patti &amp; Rummy</option>
              <option value="Bonus & Withdrawals">Bonus &amp; Withdrawals</option>
              <option value="APK Download & Security">APK Download &amp; Security</option>
              <option value="Slot Machine & Arcade">Slot Machine &amp; Arcade</option>
            </select>
          </div>

          {/* Meta Description */}
          <div className="p-5 rounded-3xl border border-slate-300 bg-white space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                SEO Meta Description
              </label>
              <span
                className={`text-xs font-mono font-bold ${
                  metaDescriptionValue.length >= 120 && metaDescriptionValue.length <= 160
                    ? 'text-emerald-700'
                    : metaDescriptionValue.length > 160
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {metaDescriptionValue.length}/160
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Brief summary for search engines (120-160 characters recommended)..."
              {...register('meta_description')}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all resize-none"
              style={{ borderStyle: 'solid' }}
            />
          </div>

          {/* Tags */}
          <div className="p-5 rounded-3xl border border-slate-300 bg-white space-y-2 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Taxonomy &amp; Tags
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagInput
                  tags={field.value || []}
                  onChange={(tags) => field.onChange(tags)}
                />
              )}
            />
          </div>

          {/* Author */}
          <div className="p-5 rounded-3xl border border-slate-300 bg-white space-y-2 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Public Byline
            </label>
            <input
              type="text"
              placeholder="Yono Games Desk"
              {...register('author')}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
              style={{ borderStyle: 'solid' }}
            />
            <p className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
              <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              Public byline displayed to readers on the article page.
            </p>
          </div>

          {/* Live Google SERP Snippet Preview */}
          <div className="p-5 rounded-3xl border border-slate-300 bg-white space-y-2 shadow-xs">
            <div className="flex items-center justify-between pb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Google SERP Preview</span>
              </label>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Google Snippet
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-1.5 font-sans">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                  Y
                </span>
                <span className="text-slate-600 truncate">
                  yonorummyzip.com › blog › {slugValue || 'post-slug'}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-[#1a0dab] hover:underline line-clamp-1 cursor-pointer">
                {titleValue || 'Article Title — Yono Rummy Zip'}
              </h4>
              <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                {metaDescriptionValue ||
                  'Read the latest guide on Yono Games, winning rummy tips, daily bonus strategies and instant UPI withdrawal steps.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

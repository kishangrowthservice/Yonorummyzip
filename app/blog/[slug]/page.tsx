import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '@/lib/postsStore';
import { SITE_CONFIG } from '@/lib/blog-config';
import ArticleContentRenderer from '@/app/components/blog/ArticleContentRenderer';
import TableOfContents from '@/app/components/blog/TableOfContents';
import YonoCtaBox from '@/app/components/blog/YonoCtaBox';
import { Calendar, Clock, ArrowLeft, Share2, Tag, BookOpen, ShieldCheck } from 'lucide-react';
import WinnerNavbar from '@/app/components/WinnerNavbar';
import WinnerFooter from '@/app/components/WinnerFooter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, SITE_CONFIG.domain);

  if (!post) {
    notFound();
  }

  const title = post.seo_title || `${post.title} — ${SITE_CONFIG.name}`;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/blog/${slug}`,
      siteName: SITE_CONFIG.name,
      locale: 'en_IN',
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: [post.author],
      tags: post.tags,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, SITE_CONFIG.domain);

  if (!post) {
    notFound();
  }

  // Fetch recent guides for the "Related Guides" section (strictly for this site)
  const allPosts = await getAllPosts('published', false, SITE_CONFIG.domain);
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  // Structured Data (Article JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image || undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <WinnerNavbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-200  bg-white/60  backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Link href="/" className="hover:text-cyan-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-cyan-500 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-slate-800  font-semibold truncate max-w-[200px] sm:max-w-sm">
              {post.title}
            </span>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-semibold text-cyan-600  hover:text-cyan-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Guides</span>
          </Link>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50  text-indigo-600  border border-indigo-200 ">
              {post.category || 'Guides'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 ">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{post.reading_time_minutes || 4} min read</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 ">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900  leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-slate-600  leading-relaxed font-medium">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200  text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                {post.author[0] || 'Y'}
              </div>
              <span className="font-semibold text-slate-800 ">
                {post.author}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-600 ">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Strategy</span>
            </span>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.cover_image && (
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Layout: TOC + Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          {/* Main Article Body (3 cols) */}
          <main className="lg:col-span-3 space-y-6">
            <ArticleContentRenderer content={post.content} />

            {/* Tags Footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 border-t border-slate-200  space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Article Topics:
                </span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100  border border-slate-200  text-xs font-medium text-slate-700 "
                    >
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar with Table of Contents (1 col) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-20 space-y-6">
              <TableOfContents content={post.content} />

              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Quick Download
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download official Yono apps &amp; claim up to ₹1,500 welcome bonus today.
                </p>
                <Link
                  href="/"
                  className="block w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md transition-all"
                >
                  Download APK Now
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom CTA Banner */}
        <YonoCtaBox className="my-10" />

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-slate-200  space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 ">
                More Gaming Guides
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-cyan-500 hover:underline"
              >
                View All Guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group rounded-2xl border border-slate-200  bg-white  p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                      {related.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900  line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {related.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 pt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{related.reading_time_minutes || 4} min read</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <WinnerFooter />
    </div>
  );
}

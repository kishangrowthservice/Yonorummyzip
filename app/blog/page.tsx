import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/postsStore';
import { SITE_CONFIG } from '@/lib/blog-config';
import { Calendar, Clock, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import YonoCtaBox from '@/app/components/blog/YonoCtaBox';
import WinnerNavbar from '@/app/components/WinnerNavbar';
import WinnerFooter from '@/app/components/WinnerFooter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog & Game Guides — All Yono Games 99',
  description: 'Master all Yono sister apps with pro Rummy tricks, Teen Patti hacks, APK installation guidelines, and instant UPI withdrawal strategies.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog & Game Guides — All Yono Games 99',
    description: 'Master all Yono sister apps with pro Rummy tricks, Teen Patti hacks, and instant cashout tips.',
    url: `${SITE_CONFIG.url}/blog`,
    siteName: 'All Yono Games 99',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/assets/img/logo.png',
        width: 512,
        height: 512,
        alt: 'All Yono Games 99 Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Game Guides — All Yono Games 99',
    description: 'Master all Yono sister apps with pro Rummy tricks, Teen Patti hacks, and instant cashout tips.',
    images: ['/assets/img/logo.png'],
  },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts('published', false, SITE_CONFIG.domain);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'All Yono Games Guides & Blog',
    description: 'Expert tricks, APK download guidelines, bonus strategies, and payout tips for all Yono sister platforms.',
    url: `${SITE_CONFIG.url}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'All Yono Games 99',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/assets/img/logo.png`,
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_CONFIG.url}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_CONFIG.url}/blog`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <WinnerNavbar />
      <main className="flex-1">
        {/* Hero Section */}
      <div className="relative border-b border-slate-200  bg-gradient-to-b from-white via-slate-50 to-slate-100    py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Game Strategy Desk</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Yono Games <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Guides &amp; Blog</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Expert tricks, APK download guidelines, bonus strategies, and payout tips to help you maximize your real cash winnings on all Yono sister platforms.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
            <Link href="/" className="hover:text-cyan-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700  font-semibold">Blog Articles</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400  mr-2 flex-shrink-0">
            Topics:
          </span>
          {SITE_CONFIG.categories.map((cat) => (
            <span
              key={cat.slug}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white  border border-slate-200  text-xs font-semibold text-slate-700  whitespace-nowrap shadow-sm"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </span>
          ))}
        </div>

        {/* Articles Grid */}
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200  bg-white  p-12 text-center space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-cyan-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 ">
              No articles published yet
            </h3>
            <p className="text-xs text-slate-500  max-w-sm mx-auto">
              Our editorial desk is preparing guides. Check back soon for the latest gaming strategies.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col rounded-3xl border border-slate-200  bg-white  overflow-hidden shadow-sm hover:shadow-xl hover:border-cyan-500/40  transition-all duration-300"
              >
                {/* Cover Image */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="aspect-video w-full overflow-hidden bg-slate-100 relative block"
                >
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 text-slate-400">
                      <BookOpen className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-indigo-700 border border-indigo-100/80 shadow-sm">
                      {post.category || 'Guides'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-200/80 shadow-sm">
                      <Clock className="w-3 h-3 text-cyan-500" />
                      <span>{post.reading_time_minutes || 4} min</span>
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 ">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{post.author}</span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block group-hover:text-cyan-500  transition-colors">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-xs text-slate-600  line-clamp-3 leading-relaxed">
                      {post.excerpt || post.seo_description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100  flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(post.tags || []).slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-slate-500 ">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600  hover:gap-1.5 transition-all"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Global CTA Banner */}
        <YonoCtaBox className="my-12" />
      </div>
    </main>
    <WinnerFooter />
  </div>
);
}

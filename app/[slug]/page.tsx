import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';
import { renderAppPage, injectAppsIntoListGrid, applyWinnerLayout } from '@/lib/render-app-page';
import { stripMarkdown } from '@/lib/markdown';
import { CURRENT_SITE_ID } from '@/lib/supabase';
import { getPageData } from '@/lib/pages-data';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allyonogames99.com';

export async function generateStaticParams() {
  try {
    const slugsPath = path.join(process.cwd(), 'app', 'all_slugs.json');
    if (fs.existsSync(slugsPath)) {
      const slugs: string[] = JSON.parse(fs.readFileSync(slugsPath, 'utf8'));
      return slugs.map((slug) => ({ slug }));
    }
  } catch {
    // ignore
  }
  return [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Check Supabase first for active app metadata on this site
  try {
    const { data: app } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .eq('site', CURRENT_SITE_ID)
      .single();

    if (app) {
      const title =
        app.meta_title ||
        `${app.name} (Yono) Apk Download & Get ₹${app.signup_bonus ?? 0} Bonus Free Latest`;
      const description =
        app.meta_description ||
        stripMarkdown(app.short_desc) ||
        `Download ${app.name} APK for Android with ₹${app.signup_bonus ?? 0} welcome bonus.`;
      const image = app.logo_url || '/assets/img/logo.png';

      return {
        title,
        description,
        alternates: {
          canonical: `/${slug}`,
        },
        openGraph: {
          title,
          description,
          url: `${SITE_URL}/${slug}`,
          siteName: 'All Yono Games 99',
          locale: 'en_IN',
          type: 'website',
          images: [
            {
              url: image,
              width: 512,
              height: 512,
              alt: `${app.name} Official Logo`,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image],
        },
      };
    }
  } catch {
    // ignore
  }

  // 2. Fallback to cached pages_data
  const data = getPageData(slug);
  if (data) {
    const isLegalOrInfo = [
      'about',
      'about-us',
      'contact',
      'contact-us',
      'privacy',
      'privacy-policy',
      'terms',
      'terms-and-conditions',
      'terms-of-service',
      'disclaimer',
    ].includes(slug.toLowerCase());

    const title = data.title || `${slug.toUpperCase()} – All Yono Games 99`;
    const description =
      data.description ||
      (isLegalOrInfo
        ? `${title} on All Yono Games 99.`
        : `Download ${slug} APK for Android free bonus and instant UPI cashouts on All Yono Games 99.`);

    return {
      title,
      description,
      alternates: {
        canonical: `/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${slug}`,
        siteName: 'All Yono Games 99',
        locale: 'en_IN',
        type: 'website',
        images: ['/assets/img/logo.png'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/assets/img/logo.png'],
      },
    };
  }

  return {
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const lowerSlug = slug.toLowerCase();

  // 1. If this is the yono-games-list (or all-yono-games) page, inject active apps for this site into the grid
  if (lowerSlug === 'yono-games-list' || lowerSlug === 'all-yono-games') {
    const listPage = getPageData('yono-games-list');
    let body = listPage?.body || '';
    try {
      const { data: dbApps } = await supabaseAdmin
        .from('apps')
        .select('*')
        .eq('status', 'active')
        .eq('site', CURRENT_SITE_ID)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (dbApps && dbApps.length > 0) {
        body = injectAppsIntoListGrid(body, dbApps);
      }
    } catch (err) {
      console.error('Error injecting apps into games list:', err);
    }
    if (body) {
      return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(body) }} />;
    }
  }

  // 2. Check Supabase first: Active apps for this site take priority
  try {
    const { data: app } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .eq('site', CURRENT_SITE_ID)
      .single();

    if (app) {
      const html = renderAppPage(app);
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }
  } catch {
    // continue to fallback
  }

  // 3. Fallback to cached pages_data if it exists
  const pageData = getPageData(slug);
  if (pageData) {
    const isLegalOrInfo = [
      'about',
      'about-us',
      'contact',
      'contact-us',
      'privacy',
      'privacy-policy',
      'terms',
      'terms-and-conditions',
      'terms-of-service',
      'disclaimer',
      'yono-games-list',
      'all-yono-games',
    ].includes(lowerSlug);

    // If informational/legal, render clean page without MobileApplication schema
    if (isLegalOrInfo) {
      return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
    }

    const appSchema = {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: `${pageData.title || slug} APK`,
      operatingSystem: 'Android',
      applicationCategory: 'GameApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.7',
        ratingCount: 1540,
        bestRating: '5',
        worstRating: '1',
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
        <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />
      </>
    );
  }

  // 4. Otherwise, return 404 (handled by app/not-found.tsx)
  notFound();
}

import fs from 'fs';
import { SITE_URL } from '@/lib/site-url';
import path from 'path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';
import { renderAppPage, injectAppsIntoListGrid, applyWinnerLayout } from '@/lib/render-app-page';
import { stripMarkdown } from '@/lib/markdown';
import { CURRENT_SITE_ID } from '@/lib/supabase';
import { getPageData } from '@/lib/pages-data';
import { getStaticGames } from '@/lib/games-catalogue';
import WinnerNavbar from '@/app/components/WinnerNavbar';
import WinnerFooter from '@/app/components/WinnerFooter';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Yono Rummy Zip';

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
  const lowerSlug = slug.toLowerCase();

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
          siteName: SITE_NAME,
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

  // 2. Fallback to cached pages_data if it exists
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
      'yono-games-list',
      'all-yono-games',
    ].includes(lowerSlug);

    const title = data.title || `${slug.toUpperCase()} – ${SITE_NAME}`;
    const description =
      data.description ||
      (isLegalOrInfo
        ? `${title} on ${SITE_NAME}.`
        : `Download ${slug} APK for Android free bonus and instant UPI cashouts on ${SITE_NAME}.`);

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
        siteName: SITE_NAME,
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

  // 3. Fallback to static games catalogue
  const staticGame = getStaticGames().find(
    (g) => g.slug.toLowerCase() === lowerSlug
  );
  if (staticGame) {
    const title = `${staticGame.name} APK Download – Get ₹${staticGame.bonus} Bonus | ${SITE_NAME}`;
    const description = `Download ${staticGame.name} APK for Android with ₹${staticGame.bonus} welcome bonus and ₹${staticGame.minWithdraw} minimum withdrawal on ${SITE_NAME}.`;
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
        siteName: SITE_NAME,
        locale: 'en_IN',
        type: 'website',
        images: [
          {
            url: staticGame.icon,
            width: 512,
            height: 512,
            alt: `${staticGame.name} Official Logo`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [staticGame.icon],
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
        <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body, slug) }} />
      </>
    );
  }

  // 4. Fallback to static games catalogue
  const staticGame = getStaticGames().find(
    (g) => g.slug.toLowerCase() === lowerSlug
  );
  if (staticGame) {
    return (
      <>
        <WinnerNavbar />
        <main style={{ flex: 1 }} className="bg-[#f8f9fa]">
          <div className="winner-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: 768, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
                <img
                  src={staticGame.icon}
                  alt={`${staticGame.name} Logo`}
                  width={130}
                  height={130}
                  style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = '/assets/img/logo.png';
                    }
                  }}
                />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                {staticGame.name} APK Download & Bonus
              </h1>
              <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Download the verified {staticGame.name} APK on {SITE_NAME} to claim your ₹{staticGame.bonus} signup bonus with fast UPI &amp; Bank withdrawals starting at ₹{staticGame.minWithdraw}.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                <span className="winner-text-red" style={{ background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: 999, fontWeight: 700, fontSize: '0.9rem' }}>
                  🎁 Welcome Bonus: ₹{staticGame.bonus}
                </span>
                <span className="winner-text-green" style={{ background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: 999, fontWeight: 700, fontSize: '0.9rem' }}>
                  🏦 Min Withdrawal: ₹{staticGame.minWithdraw}
                </span>
                <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: 999, fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>
                  ⭐ Rating: {staticGame.rating || 4.8}/5.0
                </span>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <a
                  href={staticGame.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="winner-btn-download-black"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', padding: '0.95rem 2.75rem', borderRadius: 999, textDecoration: 'none', fontWeight: 800 }}
                  title={`Download ${staticGame.name} APK Now`}
                >
                  <i className="fas fa-download"></i> Download {staticGame.name} APK
                </a>
              </div>

              {/* Informative details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: '2rem', textAlign: 'left', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  About {staticGame.name} App
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {staticGame.name} is a popular card and mobile earning game designed for Indian players. The app offers fast-paced Rummy, Teen Patti, and Slot tournaments with instant cashout facilities. Players can link their UPI or Bank Account to receive prompt payouts directly.
                </p>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Key Features of {staticGame.name}
                </h4>
                <ul style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.8, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                  <li>🎁 Exclusive ₹{staticGame.bonus} Signup Bonus upon mobile verification</li>
                  <li>⚡ Fast withdrawals via UPI (PhonePe, GPay, Paytm) &amp; IMPS Bank Transfer</li>
                  <li>🛡️ 100% verified APK with safe SSL encryption</li>
                  <li>🎮 Multiple game modes including Points Rummy, Deals Rummy &amp; Slots</li>
                  <li>📱 Lightweight APK compatible with all Android devices (Android 5.0+)</li>
                </ul>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  How to Download &amp; Register
                </h4>
                <ol style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.8, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                  <li>Tap the <strong>Download {staticGame.name} APK</strong> button above to download the file.</li>
                  <li>Enable <em>Install from Unknown Sources</em> in your device security settings if prompted.</li>
                  <li>Install the APK and open {staticGame.name} on your device.</li>
                  <li>Register using your 10-digit mobile number, verify via OTP, and collect your ₹{staticGame.bonus} welcome reward.</li>
                </ol>

                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 16, padding: '1rem 1.25rem', color: '#92400e', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  ⚠️ <strong>Disclaimer:</strong> This app involves real-money gaming and may be habit-forming. Restricted to users aged 18+ only. Play responsibly within your financial limits.
                </div>
              </div>
            </div>
          </div>
        </main>
        <WinnerFooter />
      </>
    );
  }

  // 5. Otherwise, return 404 (handled by app/not-found.tsx)
  notFound();
}

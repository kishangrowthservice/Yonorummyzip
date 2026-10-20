import type { Metadata } from 'next';
import WinnerNavbar from './components/WinnerNavbar';
import WinnerLatestMarquee from './components/WinnerLatestMarquee';
import WinnerTopThree from './components/WinnerTopThree';
import WinnerGameList from './components/WinnerGameList';
import WinnerFreshZone from './components/WinnerFreshZone';
import WinnerSeoSection from './components/WinnerSeoSection';
import WinnerFooter from './components/WinnerFooter';
import FloatingTelegram from './components/FloatingTelegram';
import { getAllMergedGames } from '@/lib/games-catalogue';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonorummyzip.com';

export const metadata: Metadata = {
  title: 'YONO Games | Play & Earn Real Rewards – All Yono Games APK',
  description:
    'Download top online earning games and start winning real rewards today. Experience premium gaming with verified Yono Rummy, Teen Patti & 777 APKs with instant UPI withdrawals.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'YONO Games | Play & Earn Real Rewards – All Yono Games APK',
    description:
      'Download all official Yono Game apps in one place with free signup bonus and instant UPI cashouts.',
    url: SITE_URL,
    siteName: 'Yono Rummy Zip',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/assets/img/logo-rummyzip.svg',
        width: 512,
        height: 512,
        alt: 'Yono Rummy Zip Official Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YONO Games | Play & Earn Real Rewards – All Yono Games APK',
    description:
      'Download all official Yono Game apps in one place with free signup bonus and instant cashout.',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
};

export default async function HomePage() {
  const games = await getAllMergedGames();

  // Schema.org WebSite structured data
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Yono Rummy Zip',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the All Yono Games APK safe to download?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, when downloaded from a verified hub like yonorummyzip.com. Unverified third-party blogs may host modified or outdated files.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Yono signup bonus?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Welcome bonuses vary by game platform (ranging from ₹10 to ₹1,500). Verified hubs list verified promotions with transparent terms.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I withdraw winnings instantly via UPI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, verified Yono Rummy and Yono 777 platforms support fast withdrawals directly to your bank account or UPI ID.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a VPN to play Yono Games?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Yono games are designed specifically for Indian mobile users and can be played smoothly across all domestic cellular networks.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <WinnerNavbar />

      <main style={{ flex: 1 }} className="bg-[#f8f9fa]">
        <div className="winner-container">
          {/* 1. Latest Games Horizontal Marquee Slider */}
          <WinnerLatestMarquee games={games} />

          {/* 2. Top Three Featured Games Grid */}
          <WinnerTopThree games={games} />

          {/* 3. Main Games Vertical List */}
          <WinnerGameList games={games} />

          {/* 4. Fresh Game Zone (Bonus Apps Section) */}
          <WinnerFreshZone games={games} />

          {/* 5. Comprehensive SEO & FAQ Section */}
          <WinnerSeoSection />
        </div>
      </main>

      <WinnerFooter />

      <FloatingTelegram />
    </>
  );
}

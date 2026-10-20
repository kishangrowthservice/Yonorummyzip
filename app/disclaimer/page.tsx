import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allyonogames99.com';

export const metadata: Metadata = {
  title: 'Disclaimer | All Yono Games 99',
  description: 'Read the official Disclaimer for All Yono Games 99. Information regarding game APKs, informational guidance, and 18+ responsible play.',
  alternates: {
    canonical: '/disclaimer',
  },
  openGraph: {
    title: 'Disclaimer | All Yono Games 99',
    description: 'Read the official Disclaimer for All Yono Games 99.',
    url: `${SITE_URL}/disclaimer`,
    siteName: 'All Yono Games 99',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer | All Yono Games 99',
    description: 'Read the official Disclaimer for All Yono Games 99.',
    images: ['/assets/img/logo.png'],
  },
};

export default function DisclaimerPage() {
  const pageData = getPageData('disclaimer');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

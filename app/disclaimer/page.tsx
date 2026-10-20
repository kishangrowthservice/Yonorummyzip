import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonorummyzip.com';

export const metadata: Metadata = {
  title: 'Disclaimer | Yono Rummy Zip',
  description: 'Read the official Disclaimer for Yono Rummy Zip. Information regarding game APKs, informational guidance, and 18+ responsible play.',
  alternates: {
    canonical: '/disclaimer',
  },
  openGraph: {
    title: 'Disclaimer | Yono Rummy Zip',
    description: 'Read the official Disclaimer for Yono Rummy Zip.',
    url: `${SITE_URL}/disclaimer`,
    siteName: 'Yono Rummy Zip',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer | Yono Rummy Zip',
    description: 'Read the official Disclaimer for Yono Rummy Zip.',
    images: ['/assets/img/logo.svg'],
  },
};

export default function DisclaimerPage() {
  const pageData = getPageData('disclaimer');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

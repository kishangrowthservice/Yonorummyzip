import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonorummyzip.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | Yono Rummy Zip',
  description: 'Read the official Privacy Policy of Yono Rummy Zip. Learn how we handle data, player privacy, and user security on our platform.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Yono Rummy Zip',
    description: 'Read the official Privacy Policy of Yono Rummy Zip.',
    url: `${SITE_URL}/privacy`,
    siteName: 'Yono Rummy Zip',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Yono Rummy Zip',
    description: 'Read the official Privacy Policy of Yono Rummy Zip.',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
};

export default function PrivacyPage() {
  const pageData = getPageData('privacy');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

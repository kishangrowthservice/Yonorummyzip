import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allyonogames99.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | All Yono Games 99',
  description: 'Read the official Privacy Policy of All Yono Games 99. Learn how we handle data, player privacy, and user security on our platform.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | All Yono Games 99',
    description: 'Read the official Privacy Policy of All Yono Games 99.',
    url: `${SITE_URL}/privacy-policy`,
    siteName: 'All Yono Games 99',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | All Yono Games 99',
    description: 'Read the official Privacy Policy of All Yono Games 99.',
    images: ['/assets/img/logo.png'],
  },
};

export default function PrivacyPolicyPage() {
  const pageData = getPageData('privacy');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

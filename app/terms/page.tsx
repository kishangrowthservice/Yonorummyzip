import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonorummyzip.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Yono Rummy Zip',
  description: 'Read the official Terms & Conditions for Yono Rummy Zip. Information on user agreements, responsible gaming, and platform usage guidelines.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | Yono Rummy Zip',
    description: 'Read the official Terms & Conditions for Yono Rummy Zip.',
    url: `${SITE_URL}/terms`,
    siteName: 'Yono Rummy Zip',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | Yono Rummy Zip',
    description: 'Read the official Terms & Conditions for Yono Rummy Zip.',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
};

export default function TermsPage() {
  const pageData = getPageData('terms');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

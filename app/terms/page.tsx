import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allyonogames99.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions | All Yono Games 99',
  description: 'Read the official Terms & Conditions for All Yono Games 99. Information on user agreements, responsible gaming, and platform usage guidelines.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | All Yono Games 99',
    description: 'Read the official Terms & Conditions for All Yono Games 99.',
    url: `${SITE_URL}/terms`,
    siteName: 'All Yono Games 99',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | All Yono Games 99',
    description: 'Read the official Terms & Conditions for All Yono Games 99.',
    images: ['/assets/img/logo.png'],
  },
};

export default function TermsPage() {
  const pageData = getPageData('terms');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

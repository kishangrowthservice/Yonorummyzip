import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonorummyzip.com';

export const metadata: Metadata = {
  title: 'Contact Us | Yono Rummy Zip',
  description: 'Contact Yono Rummy Zip. Get support, help with APK downloads, or reach out to our team.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Yono Rummy Zip',
    description: 'Contact Yono Rummy Zip.',
    url: `${SITE_URL}/contact`,
    siteName: 'Yono Rummy Zip',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Yono Rummy Zip',
    description: 'Contact Yono Rummy Zip.',
    images: ['/assets/img/logo.svg'],
  },
};

export default function ContactPage() {
  const pageData = getPageData('contact');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

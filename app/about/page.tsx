import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;


export const metadata: Metadata = {
  title: 'About Us | Yono Rummy Zip',
  description: 'About Yono Rummy Zip – Your trusted hub for downloading verified Yono Games, Rummy APKs, and exciting Teen Patti apps.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Yono Rummy Zip',
    description: 'About Yono Rummy Zip – Your trusted hub for downloading verified Yono Games.',
    url: `${SITE_URL}/about`,
    siteName: 'Yono Rummy Zip',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Yono Rummy Zip',
    description: 'About Yono Rummy Zip – Your trusted hub for downloading verified Yono Games.',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
};

export default function AboutPage() {
  const pageData = getPageData('about');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

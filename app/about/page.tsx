import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allyonogames99.com';

export const metadata: Metadata = {
  title: 'About Us | All Yono Games 99',
  description: 'About All Yono Games 99 – Your trusted hub for downloading verified Yono Games, Rummy APKs, and exciting Teen Patti apps.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | All Yono Games 99',
    description: 'About All Yono Games 99 – Your trusted hub for downloading verified Yono Games.',
    url: `${SITE_URL}/about`,
    siteName: 'All Yono Games 99',
    locale: 'en_IN',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | All Yono Games 99',
    description: 'About All Yono Games 99 – Your trusted hub for downloading verified Yono Games.',
    images: ['/assets/img/logo.png'],
  },
};

export default function AboutPage() {
  const pageData = getPageData('about');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

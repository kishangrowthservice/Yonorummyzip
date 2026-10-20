import type { Metadata } from 'next';
import { getPageData } from '@/lib/pages-data';
import { applyWinnerLayout } from '@/lib/render-app-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Privacy Policy | All Yono Games 99',
  description: 'Read the official Privacy Policy of All Yono Games 99.',
  alternates: {
    canonical: '/privecy',
  },
};

export default function PrivecyPage() {
  const pageData = getPageData('privacy');
  if (!pageData) {
    notFound();
  }
  return <div dangerouslySetInnerHTML={{ __html: applyWinnerLayout(pageData.body) }} />;
}

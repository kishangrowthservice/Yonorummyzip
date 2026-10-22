import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site-url';
import './globals.css';
import ClientScripts from './ClientScripts';
import { ThemeProvider } from './ThemeProvider';
import ToasterClient from './components/ToasterClient';


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Yono Rummy Zip – Download All Yono Games APK Latest',
    template: '%s | Yono Rummy Zip',
  },
  description:
    'Download all official Yono Game apps in one place. Find verified Yono Games like Rummy, 777 & Slots with free signup bonus and instant 2-minute UPI cashouts.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/assets/img/logo-rummyzip.svg',
    shortcut: '/assets/img/logo-rummyzip.svg',
    apple: '/assets/img/logo-rummyzip.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Yono Rummy Zip',
    title: 'Yono Rummy Zip – Download All Yono Games APK Latest',
    description:
      'Download all official Yono Game apps in one place. Find verified Yono Games like Rummy, 777 & Slots with free signup bonus.',
    images: [
      {
        url: '/assets/img/logo-rummyzip.svg',
        width: 512,
        height: 512,
        alt: 'Yono Rummy Zip Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yono Rummy Zip – Download All Yono Games APK Latest',
    description:
      'Download all official Yono Game apps in one place with free signup bonus and instant cashout.',
    images: ['/assets/img/logo-rummyzip.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/img/logo-rummyzip.svg" />
        {/* Enforce Pure Clean White Theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                localStorage.setItem('yono_theme', 'light');
                localStorage.setItem('yono_admin_theme', 'light');
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
              } catch (e) {}
            })();`,
          }}
        />
        {/* DNS Preconnects for Faster Asset Delivery */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          rel="stylesheet"
          media="print"
          // @ts-expect-error Next.js jsx onLoad
          onLoad="this.media='all'"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
          rel="stylesheet"
          media="print"
          // @ts-expect-error Next.js jsx onLoad
          onLoad="this.media='all'"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/winner-theme-v2.css" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media screen and (max-width: 768px) {
                input, select, textarea, .search-input, #liveSearchInput {
                  font-size: 16px !important;
                }
              }
              /* Eliminate 3D inset border bevel across all inputs & form controls */
              input, select, textarea {
                border-style: solid !important;
              }
            `,
          }}
        />
      </head>
      <body className="app-body">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ToasterClient />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          async
        ></script>
        <ClientScripts />
      </body>
    </html>
  );
}

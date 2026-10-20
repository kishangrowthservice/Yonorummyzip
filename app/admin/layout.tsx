// app/admin/layout.tsx
// Admin panel layout — nested under root layout
// NOTE: No <html> or <body> tags here — root layout.tsx handles those

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — All Yono Games 99',
  description: 'Manage apps, content and settings for All Yono Games 99',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Inter font for admin panel */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html, body { margin: 0; padding: 0; font-family: 'Inter', sans-serif !important; max-width: 100vw; overflow-x: hidden; }
        /* Remove underlines across all admin links and sidebar navigation */
        a, a:hover, a:focus, a:active, .nav-link {
          text-decoration: none !important;
        }
        /* Prevent mobile browser auto-zoom on input focus */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
        /* Universal Form Control Normalization: Eliminate 3D inset bevel */
        input, select, textarea {
          border-style: solid !important;
        }
      `}</style>
      {children}
    </>
  );
}

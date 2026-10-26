'use client';

import Link from 'next/link';

export default function WinnerFooter() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Yono Rummy Zip';
  const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'yonorummyzip.com';

  return (
    <footer className="winner-footer">
      <div className="winner-container">
        <div className="winner-footer-grid">
          <div>
            <Link href="/" className="winner-footer-logo">
              {siteDomain}
            </Link>
            <p className="winner-footer-desc">
              Your official portal for downloading verified {siteName} APK, Rummy apps, and exciting card games with instant UPI cashouts and exclusive signup bonuses.
            </p>
          </div>

          <div>
            <h4 className="winner-footer-title">Quick Links</h4>
            <div className="winner-footer-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Gaming Guides & Tricks</Link>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Support & Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="winner-footer-title">Legal & Security</h4>
            <div className="winner-footer-links">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
              <span className="text-xs text-slate-500">
                ⚠️ 18+ Only. Play responsibly. Real-money gaming involves financial risk.
              </span>
            </div>
          </div>
        </div>

        <div className="winner-footer-bottom">
          <p>© {new Date().getFullYear()} {siteDomain} – All Rights Reserved. Not affiliated with SBI.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';

export default function WinnerFooter() {
  return (
    <footer className="winner-footer">
      <div className="winner-container">
        <div className="winner-footer-grid">
          <div>
            <Link href="/" className="winner-footer-logo">
              YonoRummyZip.com
            </Link>
            <p className="winner-footer-desc">
              Your trusted hub for downloading verified Yono Games, Rummy APKs, and exciting Teen Patti apps with instant UPI cashouts and exclusive signup bonuses.
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
          <p>© {new Date().getFullYear()} YonoRummyZip.com – All Rights Reserved. Not affiliated with SBI.</p>
        </div>
      </div>
    </footer>
  );
}

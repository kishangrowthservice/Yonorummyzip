import Link from 'next/link';

export default function WinnerNavbar() {
  return (
    <nav className="winner-navbar">
      <div className="winner-nav-inner">
        <div className="winner-logo-section">
          <Link href="/">
            <img
              src="/assets/img/logo.svg"
              alt="Yono Rummy Zip Logo"
              width={100}
              height={38}
              className="winner-logo-img"
            />
          </Link>
        </div>

        <Link href="/" className="winner-nav-title">
          YonoRummyZip.com
        </Link>

        <div className="winner-telegram-section">
          <a
            href="https://t.me/+all_yono_games_official"
            target="_blank"
            rel="noopener noreferrer"
            className="winner-telegram-icon"
            aria-label="Join Official Telegram"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2l-2 20-6-4-3 4V14L2 10l19-8z" />
              <path d="M21 2L9 14" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}

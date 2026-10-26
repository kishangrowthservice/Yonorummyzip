'use client';

import Link from 'next/link';
import { GameItem } from '@/lib/games-catalogue';

export default function WinnerGameList({ games }: { games: GameItem[] }) {
  if (!games || games.length === 0) {
    return (
      <section className="winner-list-section py-8 text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            🎮
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">New Games Dropping Soon!</h3>
          <p className="text-xs text-slate-500 mb-4">
            Stay tuned! Fresh verified Yono APKs are being added by the admin.
          </p>
          <a
            href="https://t.me/yonorummyzip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition-all"
          >
            Join Official Telegram
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="winner-list-section">
      <div className="winner-game-list">
        {games.map((game) => (
          <div key={`list-${game.slug}`} className="winner-list-item">
            <Link href={`/${game.slug}`} className="winner-list-icon-wrap">
              <img
                src={game.icon || '/assets/img/logo.png'}
                alt={game.name}
                width={70}
                height={70}
                loading="lazy"
                className="winner-list-icon"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true';
                    target.src = '/assets/img/logo.png';
                  }
                }}
              />
            </Link>

            <div className="winner-list-content">
              <Link href={`/${game.slug}`} className="winner-list-title">
                {game.name}
              </Link>
              <div className="winner-bonus-info">
                <span className="winner-text-red">
                  🎁 Welcome Bonus ₹{game.bonus}
                </span>
                <span className="winner-text-green">
                  🏦 Min Withdraw ₹{game.minWithdraw}
                </span>
              </div>
            </div>

            <div className="winner-list-action">
              <a
                href={game.downloadUrl.startsWith('http') ? game.downloadUrl : `/${game.slug}`}
                target={game.downloadUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="winner-btn-download-black"
                title={`Download ${game.name} APK`}
              >
                Download
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                  <circle cx="17" cy="18" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

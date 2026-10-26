'use client';

import Link from 'next/link';
import { GameItem } from '@/lib/games-catalogue';

// Featured Top-3 shown in the highlighted row, in display order:
// Rummy Zip (left) - Boss Rummy (middle) - YN 777 (right)
const FEATURED_ORDER = ['rummy-zip', 'boss-rummy', 'yn777'];

export default function WinnerTopThree({ games }: { games: GameItem[] }) {
  // Select the featured games in FEATURED_ORDER (fallback: isTop flags, then list order)
  const featured = FEATURED_ORDER.map((slug) => games.find((g) => g.slug === slug)).filter(
    (g): g is GameItem => Boolean(g)
  );
  const topThree = featured.length === 3 ? featured : games.filter(g => g.isTop).slice(0, 3);
  const displayThree = topThree.length > 0 ? topThree : games.slice(0, 3);

  if (!displayThree || displayThree.length === 0) return null;

  return (
    <section className="winner-top-three-section">
      <div className="winner-top-three-grid">
        {displayThree.map((game) => (
          <Link
            key={`top-${game.slug}`}
            href={`/${game.slug}`}
            className="winner-top-three-card"
          >
            <div className="winner-top-three-icon-wrap">
              <img
                src={game.icon || '/assets/img/logo.png'}
                alt={game.name}
                width={150}
                height={150}
                loading="lazy"
                className="winner-top-three-icon"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true';
                    target.src = '/assets/img/logo.png';
                  }
                }}
              />
            </div>

            <h3 className="winner-top-three-title">
              {game.name}
            </h3>

            <div className="winner-top-three-btn-green">
              <svg
                width="13"
                height="13"
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
              </svg>
              Download
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

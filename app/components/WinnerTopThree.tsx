import Link from 'next/link';
import { GameItem } from '@/lib/games-catalogue';

export default function WinnerTopThree({ games }: { games: GameItem[] }) {
  // Select 3 top featured games (or fallback to top 3)
  const topThree = games.filter(g => g.isTop).slice(0, 3);
  const displayThree = topThree.length === 3 ? topThree : games.slice(0, 3);

  if (displayThree.length === 0) return null;

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
                src={game.icon}
                alt={game.name}
                width={150}
                height={150}
                loading="lazy"
                className="winner-top-three-icon"
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

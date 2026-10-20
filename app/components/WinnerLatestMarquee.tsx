import Link from 'next/link';
import { GameItem } from '@/lib/games-catalogue';

export default function WinnerLatestMarquee({ games }: { games: GameItem[] }) {
  if (!games || games.length === 0) return null;

  // Take first 15 games and duplicate list for seamless infinite loop
  const displayGames = games.slice(0, 15);
  const trackGames = [...displayGames, ...displayGames];

  return (
    <section className="winner-latest-section">
      <div className="winner-marquee-scroll">
        <div className="winner-marquee-track">
          {trackGames.map((game, idx) => (
            <Link
              key={`${game.slug}-${idx}`}
              href={`/${game.slug}`}
              className="winner-latest-card"
            >
              <div className="winner-latest-icon-wrap">
                <img
                  src={game.icon}
                  alt={game.name}
                  width={130}
                  height={130}
                  loading="lazy"
                  className="winner-latest-icon"
                />
              </div>

              <h3 className="winner-latest-title" title={game.name}>
                {game.name}
              </h3>
              <p className="winner-latest-sub">Latest</p>

              <div className="winner-stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>

              <div className="winner-download-btn-black">
                Download
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

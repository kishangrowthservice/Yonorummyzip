import Link from 'next/link';
import { GameItem } from '@/lib/games-catalogue';

export default function WinnerGameList({ games }: { games: GameItem[] }) {
  if (!games || games.length === 0) return null;

  return (
    <section className="winner-list-section">
      <div className="winner-game-list">
        {games.map((game) => (
          <div key={`list-${game.slug}`} className="winner-list-item">
            <Link href={`/${game.slug}`} className="winner-list-icon-wrap">
              <img
                src={game.icon}
                alt={game.name}
                width={70}
                height={70}
                loading="lazy"
                className="winner-list-icon"
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

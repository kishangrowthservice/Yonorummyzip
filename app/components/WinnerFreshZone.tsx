import Link from 'next/link';
import { GameItem } from '@/lib/games-catalogue';

export default function WinnerFreshZone({ games }: { games: GameItem[] }) {
  if (!games || games.length === 0) return null;

  // Pick top bonus games
  const freshPicks = games.slice(0, 10);
  const trackGames = [...freshPicks, ...freshPicks];

  return (
    <section className="winner-fresh-zone">
      <div className="winner-fresh-badge">FRESH GAME ZONE</div>
      <h2 className="winner-fresh-title">Bonus Apps, Fast Picks</h2>
      <p className="winner-fresh-subtitle">
        New app drops and bonus updates in one clean place.
      </p>

      <div className="winner-fresh-stats">
        <div className="winner-fresh-stat-box">
          <span className="winner-fresh-stat-number">{games.length}</span>
          <span className="winner-fresh-stat-label">Live Apps</span>
        </div>
        <div className="winner-fresh-stat-box">
          <span className="winner-fresh-stat-number">100%</span>
          <span className="winner-fresh-stat-label">Verified</span>
        </div>
      </div>

      <div className="winner-fresh-cards-scroll">
        <div className="winner-fresh-marquee-track">
          {trackGames.map((game, idx) => (
            <Link
              key={`fresh-${game.slug}-${idx}`}
              href={`/${game.slug}`}
              className="winner-fresh-card"
            >
              <div className="winner-fresh-card-top">
                <span className="winner-hot-badge">
                  {idx % 2 === 0 ? 'HOT PICK' : 'FRESH DROP'}
                </span>
              </div>

              <div className="winner-fresh-card-body">
                <div className="winner-fresh-card-info">
                  <h3 className="winner-fresh-card-title">{game.name}</h3>
                  <span className="winner-fresh-bonus-tag">
                    🎁 Bonus ₹{game.bonus}
                  </span>
                  <span className="winner-fresh-withdraw-tag">
                    🏦 Min ₹{game.minWithdraw}
                  </span>
                  <span className="winner-fresh-view-btn">
                    View App
                  </span>
                </div>

                <div className="winner-fresh-icon-wrap">
                  <div className="winner-new-sash">NEW</div>
                  <img
                    src={game.icon}
                    alt={game.name}
                    width={68}
                    height={68}
                    loading="lazy"
                    className="winner-fresh-icon"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

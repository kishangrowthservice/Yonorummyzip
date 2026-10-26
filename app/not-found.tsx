import Link from 'next/link';
import WinnerNavbar from '@/app/components/WinnerNavbar';
import WinnerFooter from '@/app/components/WinnerFooter';
import { supabaseAdmin } from '@/lib/supabase-server';
import { CURRENT_SITE_ID } from '@/lib/supabase';

export const metadata = {
  title: '404 - Page Not Found | Yono Rummy Zip',
  description: 'The page or game you are looking for does not exist on Yono Rummy Zip.',
};

export default async function NotFound() {
  let popularGames: Array<{ name: string; slug: string; bonus: string; logo: string }> = [];
  try {
    const { data: dbApps } = await supabaseAdmin
      .from('apps')
      .select('name, slug, signup_bonus, logo_url')
      .eq('status', 'active')
      .eq('site', CURRENT_SITE_ID)
      .order('sort_order', { ascending: true })
      .limit(4);

    if (dbApps && dbApps.length > 0) {
      popularGames = dbApps.map((a) => ({
        name: a.name,
        slug: a.slug,
        bonus: `₹${a.signup_bonus ?? 0} Bonus`,
        logo: a.logo_url || '/assets/img/logo.png',
      }));
    }
  } catch {
    // ignore
  }

  return (
    <>
      <WinnerNavbar />

      <main className="min-h-[70vh] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-slate-50 text-slate-900 transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Level Not Found · Error 404</span>
          </div>

          <div className="text-7xl sm:text-9xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none leading-none">
            404
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            You&apos;ve Hit a Dead End!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Looks like this route led nowhere. The page or game you&apos;re searching for
            doesn&apos;t exist or was moved. Don&apos;t worry — the game isn&apos;t over!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <i className="fas fa-home" />
              <span>Go to Homepage</span>
            </Link>

            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <i className="fas fa-book-open" />
              <span>Gaming Guides & Tricks</span>
            </Link>
          </div>

          {popularGames.length > 0 && (
            <div className="pt-6 border-t border-slate-200 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                <i className="fas fa-fire text-amber-500" />
                <span>Featured Games Available Now:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {popularGames.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/${game.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-500/50 hover:bg-indigo-50/20 transition-all group"
                    title={`Download ${game.name}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={game.logo}
                        alt={game.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {game.name}
                        </div>
                        <div className="text-[11px] font-semibold text-amber-500">
                          {game.bonus}
                        </div>
                      </div>
                    </div>
                    <i className="fas fa-arrow-right text-xs text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <WinnerFooter />
    </>
  );
}

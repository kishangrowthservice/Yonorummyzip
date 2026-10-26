import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { CURRENT_SITE_ID } from '@/lib/supabase';
import { getStaticGames } from '@/lib/games-catalogue';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const seenSlugs = new Set<string>();
    const apps: Array<{ title: string; slug: string; logo: string; bonus: string }> = [];

    const { data: dbApps } = await supabaseAdmin
      .from('apps')
      .select('id, name, slug, logo_url, signup_bonus, min_withdrawal, download_url')
      .eq('status', 'active')
      .eq('site', CURRENT_SITE_ID)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (dbApps && dbApps.length > 0) {
      for (const app of dbApps) {
        seenSlugs.add(app.slug);
        apps.push({
          title: app.name,
          slug: `/${app.slug}`,
          logo: app.logo_url || '/assets/img/logo.png',
          bonus: `₹${app.signup_bonus ?? 0}`,
        });
      }
    }

    const staticGames = getStaticGames();
    for (const game of staticGames) {
      if (!seenSlugs.has(game.slug)) {
        seenSlugs.add(game.slug);
        apps.push({
          title: game.name,
          slug: `/${game.slug}`,
          logo: game.icon || '/assets/img/logo.png',
          bonus: `₹${game.bonus ?? 0}`,
        });
      }
    }

    return NextResponse.json({ apps });
  } catch (err) {
    console.error('Failed to fetch apps for search:', err);
    return NextResponse.json({ apps: [] }, { status: 500 });
  }
}

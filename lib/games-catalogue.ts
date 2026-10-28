import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase-server';
import { AppRecord, CURRENT_SITE_ID } from './supabase';
import { resolveDownloadUrl } from './safe-url';

export interface GameItem {
  id?: string;
  slug: string;
  name: string;
  icon: string;
  bonus: number;
  minWithdraw: number;
  downloadUrl: string;
  rating?: number;
  isTop?: boolean;
}

let cachedStaticGames: GameItem[] | null = null;

export function getStaticGames(): GameItem[] {
  if (cachedStaticGames) return cachedStaticGames;
  try {
    const filePath = path.join(process.cwd(), 'data', 'games-catalogue.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      cachedStaticGames = JSON.parse(raw);
      return cachedStaticGames || [];
    }
  } catch (err) {
    console.error('Failed to load static games catalogue:', err);
  }
  return [];
}

export async function getAllMergedGames(): Promise<GameItem[]> {
  const result: GameItem[] = [];
  const seenSlugs = new Set<string>();

  // 1. Fetch DB apps first (high priority admin-configured apps)
  try {
    const { data: dbApps } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('status', 'active')
      .in('site', (CURRENT_SITE_ID === 'yonorummyzip' || CURRENT_SITE_ID === 'yonorummnyzip') ? ['yonorummyzip', 'yonorummnyzip'] : [CURRENT_SITE_ID])
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (dbApps && dbApps.length > 0) {
      for (const app of dbApps as AppRecord[]) {
        seenSlugs.add(app.slug);
        const cleanUrl = resolveDownloadUrl(app.download_url, app.slug);
        result.push({
          id: app.id,
          slug: app.slug,
          name: app.name,
          icon: app.logo_url || '/assets/img/logo-rummyzip.svg',
          bonus: app.signup_bonus ?? 51,
          minWithdraw: app.min_withdrawal ?? 100,
          downloadUrl: cleanUrl,
          rating: app.rating || 4.8,
          isTop: app.is_featured || false,
        });
      }
    }
  } catch (err) {
    console.error('Error fetching DB apps:', err);
  }

  // 2. Append static catalogue games that are not already in DB
  const staticList = getStaticGames();
  for (const game of staticList) {
    if (!seenSlugs.has(game.slug)) {
      seenSlugs.add(game.slug);
      result.push(game);
    }
  }

  return result;
}

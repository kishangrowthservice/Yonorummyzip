import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAllPosts } from '@/lib/postsStore';
import { CURRENT_SITE_ID } from '@/lib/supabase';
import { getStaticGames } from '@/lib/games-catalogue';

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Static Core Landing Pages
  sitemapEntries.push(
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/yono-games-list`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    }
  );

  // 2. Standard informational & legal pages
  const corePages = ['about', 'contact', 'privacy-policy', 'terms', 'disclaimer'];
  corePages.forEach((slug) => {
    sitemapEntries.push({
      url: `${BASE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  const knownSlugs = new Set<string>();

  // 3. Static Catalogue Apps
  try {
    const staticGames = getStaticGames();
    for (const g of staticGames) {
      if (g.slug) {
        knownSlugs.add(g.slug);
      }
    }
  } catch (err) {
    console.error('[sitemap] Failed fetching static games:', err);
  }

  // 4. Dynamic Apps from Supabase
  try {
    const { data: dbApps } = await supabaseAdmin
      .from('apps')
      .select('slug, updated_at')
      .eq('status', 'active')
      .eq('site', CURRENT_SITE_ID);

    if (dbApps && dbApps.length > 0) {
      for (const app of dbApps) {
        if (app.slug) {
          knownSlugs.add(app.slug);
        }
      }
    }
  } catch (err) {
    console.error('[sitemap] Failed fetching Supabase apps:', err);
  }

  // Add all app pages
  knownSlugs.forEach((slug) => {
    sitemapEntries.push({
      url: `${BASE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // 5. Dynamic Blog Posts (isolated per site domain)
  try {
    const siteDomain = process.env.SITE_DOMAIN || 'yonorummyzip.com';
    const posts = await getAllPosts('published', false, siteDomain);
    for (const post of posts) {
      if (post.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      }
    }
  } catch (err) {
    console.error('[sitemap] Failed fetching blog posts:', err);
  }

  return sitemapEntries;
}

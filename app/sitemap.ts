import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAllPosts } from '@/lib/postsStore';
import { CURRENT_SITE_ID } from '@/lib/supabase';

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

  // 2. Dynamic Slugs from all_slugs.json
  const knownSlugs = new Set<string>();
  try {
    const slugsPath = path.join(process.cwd(), 'app', 'all_slugs.json');
    if (fs.existsSync(slugsPath)) {
      const raw = fs.readFileSync(slugsPath, 'utf8');
      const staticSlugs: string[] = JSON.parse(raw);
      for (const slug of staticSlugs) {
        if (slug && !slug.includes('/') && slug !== 'index' && slug !== 'yono-games-list') {
          knownSlugs.add(slug);
        }
      }
    }
  } catch (err) {
    console.error('[sitemap] Failed reading static slugs:', err);
  }

  // 3. Dynamic Apps from Supabase
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

  // 4. Dynamic Blog Posts (isolated per site domain)
  try {
    const siteDomain = process.env.SITE_DOMAIN || 'allyonogames99.com';
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

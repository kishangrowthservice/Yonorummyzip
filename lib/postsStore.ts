import fs from 'fs';
import path from 'path';
import type { BlogPost } from './blog-types';
import { supabaseAdmin } from './supabase-server';
import { sanitizeBrandAndDomain, sanitizeBrandArray } from './ai/sanitizeBlogOutput';

const POSTS_JSON_PATH = path.join(process.cwd(), 'data', 'posts.json');

/**
 * Standardize and normalize site domain identifier
 * e.g., "https://yonoallapps.com/" -> "yonoallapps.com"
 * e.g., "www.yonorummyzip.com" -> "yonorummyzip.com"
 */
export function normalizeSiteDomain(site?: string | null): string {
  if (!site || site === 'all') return site || 'all';
  return site
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
}

export function getCurrentSiteDomain(): string {
  return normalizeSiteDomain(process.env.SITE_DOMAIN || 'allyonogames99.com');
}

const listCache: Record<string, { data: BlogPost[]; cachedAt: number }> = {};
const CACHE_TTL_MS = 0; // No cache — always fresh so new posts appear immediately

export function invalidatePostsCache(): void {
  for (const k of Object.keys(listCache)) {
    delete listCache[k];
  }
}

function readLocalPosts(): BlogPost[] {
  try {
    if (fs.existsSync(POSTS_JSON_PATH)) {
      const raw = fs.readFileSync(POSTS_JSON_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[postsStore] Error reading local posts.json:', err);
  }
  return [];
}

function writeLocalPosts(posts: BlogPost[]): void {
  try {
    const dir = path.dirname(POSTS_JSON_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POSTS_JSON_PATH, JSON.stringify(posts, null, 2), 'utf8');
  } catch (err) {
    console.error('[postsStore] Error writing local posts.json:', err);
  }
}

function normalizePost(post: any): BlogPost {
  const content = Array.isArray(post.content)
    ? post.content.map((c: any) => (typeof c === 'string' ? sanitizeBrandAndDomain(c) : c))
    : typeof post.content === 'string'
    ? sanitizeBrandAndDomain(post.content)
    : '';

  return {
    ...post,
    target_site: normalizeSiteDomain(post.target_site || getCurrentSiteDomain()),
    title: sanitizeBrandAndDomain(post.title || ''),
    slug: sanitizeBrandAndDomain(post.slug || ''),
    tags: Array.isArray(post.tags) ? sanitizeBrandArray(post.tags) : [],
    content,
    cover_image: post.cover_image || post.cover_image_url || null,
    seo_title: sanitizeBrandAndDomain(post.seo_title || post.meta_title || post.title || ''),
    seo_description: sanitizeBrandAndDomain(post.seo_description || post.meta_description || post.excerpt || ''),
    excerpt: sanitizeBrandAndDomain(post.excerpt || post.seo_description || post.meta_description || ''),
    author: sanitizeBrandAndDomain(post.author || 'All Yono Games Desk'),
    category: post.category || 'Yono Games Guides',
    status: post.status === 'published' ? 'published' : 'draft',
    source: post.source || 'manual',
    reading_time_minutes: post.reading_time_minutes || 4,
    created_at: post.created_at || new Date().toISOString(),
    updated_at: post.updated_at || post.created_at || new Date().toISOString(),
    published_at: post.published_at || null,
  };
}

/**
 * Fetch all posts — queries Supabase first, falls back gracefully to data/posts.json
 * Defaults strictly to current site domain unless siteFilter is explicitly passed
 */
export async function getAllPosts(
  filter: 'all' | 'published' | 'draft' = 'all',
  includeFullContent = false,
  siteFilter?: string
): Promise<BlogPost[]> {
  const effectiveSite = siteFilter !== undefined ? normalizeSiteDomain(siteFilter) : getCurrentSiteDomain();
  const cacheKey = `${filter}:${includeFullContent ? 'full' : 'summary'}:${effectiveSite}`;
  const now = Date.now();
  const cached = listCache[cacheKey];

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Try Supabase
  try {
    let query = supabaseAdmin
      .from('yono_posts')
      .select(includeFullContent ? '*' : 'id,slug,title,excerpt,cover_image,author,category,status,source,seo_title,seo_description,tags,reading_time_minutes,target_site,published_at,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    if (effectiveSite !== 'all') {
      query = query.eq('target_site', effectiveSite);
    }

    const { data, error } = await query;
    if (!error && data) {
      let posts = data.map(normalizePost);
      if (effectiveSite !== 'all') {
        posts = posts.filter((p) => normalizeSiteDomain(p.target_site) === effectiveSite);
      }
      listCache[cacheKey] = { data: posts, cachedAt: now };
      return posts;
    }
  } catch {
    // Supabase table may not exist yet, fallback below
  }

  // 2. Fallback to local posts.json
  const local = readLocalPosts().map(normalizePost);
  let filtered = local;
  if (filter !== 'all') {
    filtered = filtered.filter((p) => p.status === filter);
  }
  if (effectiveSite !== 'all') {
    filtered = filtered.filter((p) => normalizeSiteDomain(p.target_site) === effectiveSite);
  }

  listCache[cacheKey] = { data: filtered, cachedAt: now };
  return filtered;
}

export async function getPostBySlug(
  slug: string,
  siteFilter?: string
): Promise<BlogPost | null> {
  const effectiveSite = siteFilter !== undefined ? normalizeSiteDomain(siteFilter) : getCurrentSiteDomain();

  // 1. Try Supabase
  try {
    let query = supabaseAdmin
      .from('yono_posts')
      .select('*')
      .eq('slug', slug);

    if (effectiveSite !== 'all') {
      query = query.eq('target_site', effectiveSite);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      const post = normalizePost(data);
      if (effectiveSite === 'all' || normalizeSiteDomain(post.target_site) === effectiveSite) {
        return post;
      }
    }
  } catch {
    // fallback
  }

  // 2. Fallback to local posts.json
  const local = readLocalPosts();
  const match = local.find(
    (p) => p.slug === slug && (effectiveSite === 'all' || normalizeSiteDomain(p.target_site) === effectiveSite)
  );
  return match ? normalizePost(match) : null;
}

export async function getPostById(
  id: string,
  siteFilter?: string
): Promise<BlogPost | null> {
  const effectiveSite = siteFilter !== undefined ? normalizeSiteDomain(siteFilter) : getCurrentSiteDomain();

  // 1. Try Supabase
  try {
    let query = supabaseAdmin
      .from('yono_posts')
      .select('*')
      .eq('id', id);

    if (effectiveSite !== 'all') {
      query = query.eq('target_site', effectiveSite);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      const post = normalizePost(data);
      if (effectiveSite === 'all' || normalizeSiteDomain(post.target_site) === effectiveSite) {
        return post;
      }
    }
  } catch {
    // fallback
  }

  const local = readLocalPosts();
  const match = local.find(
    (p) => p.id === id && (effectiveSite === 'all' || normalizeSiteDomain(p.target_site) === effectiveSite)
  );
  return match ? normalizePost(match) : null;
}

export async function createPost(
  data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>,
  siteFilter?: string
): Promise<BlogPost> {
  const currentSite = normalizeSiteDomain(siteFilter || data.target_site || getCurrentSiteDomain());
  const now = new Date().toISOString();
  const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const fullText = Array.isArray(data.content) ? data.content.join(' ') : String(data.content || '');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const newPost: BlogPost = normalizePost({
    ...data,
    id,
    target_site: currentSite,
    reading_time_minutes: readingTime,
    created_at: now,
    updated_at: now,
    published_at: data.status === 'published' ? data.published_at || now : null,
  });

  invalidatePostsCache();

  // Try Supabase first — throw on error so API layer returns proper status
  if (supabaseAdmin) {
    const { error: supaError } = await supabaseAdmin.from('yono_posts').insert([newPost]);
    if (supaError) {
      console.error('[postsStore] Supabase insert error:', supaError);
      if (supaError.code === 'PGRST205' || supaError.message?.includes('schema cache')) {
        throw new Error(
          "Database table 'yono_posts' does not exist in Supabase. Please run supabase/blog_schema.sql in your Supabase SQL Editor."
        );
      }
      // Check for duplicate slug specifically
      if (supaError.code === '23505' || supaError.message?.includes('duplicate')) {
        throw new Error('An article with this slug already exists. Please choose a different slug.');
      }
      throw new Error(supaError.message || 'Supabase insert failed');
    }
  }

  // Sync local file as secondary backup (may fail on read-only filesystems — safe to ignore)
  try {
    const local = readLocalPosts();
    local.unshift(newPost);
    writeLocalPosts(local);
  } catch {
    // read-only filesystem on Vercel — safe to ignore, Supabase is source of truth
  }

  return newPost;
}

export async function updatePost(
  id: string,
  updates: Partial<BlogPost>,
  siteFilter?: string
): Promise<BlogPost> {
  const existing = await getPostById(id, siteFilter);
  if (!existing) throw new Error(`Post with id ${id} not found or unauthorized for this portal`);

  const now = new Date().toISOString();
  let publishedAt = updates.published_at ?? existing.published_at;
  if (updates.status === 'published' && !publishedAt) {
    publishedAt = now;
  }

  let readingTime = existing.reading_time_minutes;
  if (updates.content) {
    const fullText = Array.isArray(updates.content) ? updates.content.join(' ') : String(updates.content);
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  const targetSite = updates.target_site ? normalizeSiteDomain(updates.target_site) : existing.target_site;

  const updated: BlogPost = normalizePost({
    ...existing,
    ...updates,
    id: existing.id,
    target_site: targetSite,
    created_at: existing.created_at,
    reading_time_minutes: readingTime,
    published_at: publishedAt,
    updated_at: now,
  });

  invalidatePostsCache();

  if (supabaseAdmin) {
    const { error: supaError } = await supabaseAdmin
      .from('yono_posts')
      .update(updated)
      .eq('id', id);
    if (supaError) {
      console.error('[postsStore] Supabase update error:', supaError);
      if (supaError.code === 'PGRST205' || supaError.message?.includes('schema cache')) {
        throw new Error(
          "Database table 'yono_posts' does not exist in Supabase. Please run supabase/blog_schema.sql in your Supabase SQL Editor."
        );
      }
      throw new Error(supaError.message || 'Supabase update failed');
    }
  }

  // Sync local file as secondary backup
  try {
    const local = readLocalPosts();
    const index = local.findIndex((p) => p.id === id);
    if (index !== -1) {
      local[index] = updated;
    } else {
      local.unshift(updated);
    }
    writeLocalPosts(local);
  } catch {
    // read-only filesystem — safe to ignore
  }

  return updated;
}

export async function deletePost(id: string, siteFilter?: string): Promise<boolean> {
  const existing = await getPostById(id, siteFilter);
  if (!existing) throw new Error(`Post with id ${id} not found or unauthorized for this portal`);

  invalidatePostsCache();

  try {
    await supabaseAdmin.from('yono_posts').delete().eq('id', id);
  } catch (err) {
    console.warn('[postsStore] Supabase delete skipped, persisting locally:', err);
  }

  const local = readLocalPosts();
  const next = local.filter((p) => p.id !== id);
  writeLocalPosts(next);

  return true;
}

export async function publishPost(id: string, siteFilter?: string): Promise<BlogPost> {
  return updatePost(id, {
    status: 'published',
    published_at: new Date().toISOString(),
  }, siteFilter);
}

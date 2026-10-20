/**
 * Shared utility helpers for AI blog generation.
 * Extracted here to avoid circular imports between aiBlogGenerator.ts
 * and the new src/lib/ai/ sub-modules.
 */

/**
 * Curated high-resolution gaming, rummy, casino, and sports cover images (Unsplash).
 */
export const CURATED_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', // Gaming setup / controller
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80', // Casino roulette / games
  'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80', // Poker chips & cards
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', // Digital finance & instant UPI
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80', // Esports & gaming screen
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Modern glowing gradient
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80', // Digital gaming neon
  'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80', // Cards and luck
];

export function selectRandomCoverImage(): string {
  const index = Math.floor(Math.random() * CURATED_COVER_IMAGES.length);
  return CURATED_COVER_IMAGES[index];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function optimizeSeoSlug(rawSlug: string, focusKeyword: string): string {
  const clean = slugify(rawSlug);
  if (clean.length > 0 && clean.length <= 50) return clean;
  const kwSlug = slugify(focusKeyword);
  return kwSlug || clean.substring(0, 50).replace(/-+$/, '');
}

// Canonical site URL for YonoRummyZip.com.
// Production once shipped a misspelled domain (yonorummnyzip.com) via the
// NEXT_PUBLIC_SITE_URL env var, which poisoned the sitemap, robots.txt and
// every canonical/OG URL. To make that impossible, the env value is only
// honoured when its hostname is exactly the real domain; anything else
// falls back to the canonical URL.
export const SITE_URL = ((): string => {
  const fallback = 'https://yonorummyzip.com';
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return fallback;
  try {
    const parsed = new URL(raw);
    if (parsed.hostname === 'yonorummyzip.com') {
      return `${parsed.protocol}//${parsed.hostname}`;
    }
  } catch {
    /* ignore malformed env values */
  }
  return fallback;
})();

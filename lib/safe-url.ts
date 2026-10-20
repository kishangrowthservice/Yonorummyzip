// lib/safe-url.ts
// Guards against legacy domains or competitor leaks in download URLs

const FORBIDDEN_DOMAINS = [
  'yonogameszone.com',
  'yonogameszone',
  'yonoallapps.com',
];

export function isSafeDownloadUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#' || trimmed === '/') return false;
  const lower = trimmed.toLowerCase();
  return !FORBIDDEN_DOMAINS.some((domain) => lower.includes(domain));
}

export function resolveDownloadUrl(rawUrl: string | undefined | null, fallbackSlug: string): string {
  if (isSafeDownloadUrl(rawUrl)) {
    return rawUrl!.trim();
  }
  return fallbackSlug.startsWith('/') ? fallbackSlug : `/${fallbackSlug}`;
}

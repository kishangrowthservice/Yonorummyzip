/**
 * Automated Brand & Domain Sanitizer for AI Blog Generation.
 *
 * Guarantees that no legacy domains, competitor URLs, or deprecated branding
 * ever leak into generated articles, titles, slugs, excerpts, or tags.
 */

export function sanitizeBrandAndDomain(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return text
    // 1. Specific Email addresses & contact info (must run before generic domain regex)
    .replace(/[a-zA-Z0-9._%+-]+@(?:www\.)?yonogameszone\.com/gi, 'support@yonorummyzip.com')
    .replace(/yonogameszone@gmail\.com/gi, 'support@yonorummyzip.com')

    // 2. Social / Telegram handles
    .replace(/t\.me\/yonogameszone/gi, 't.me/yonorummyzip')
    .replace(/@yonogameszone/gi, '@yonorummyzip')

    // 3. CDN / image URLs
    .replace(/https?:\/\/(?:www\.)?cdn\.yonogameszone\.com/gi, 'https://yonorummyzip.com')
    .replace(/(?:www\.)?cdn\.yonogameszone\.com/gi, 'yonorummyzip.com')

    // 4. Full domain URLs
    .replace(/https?:\/\/(?:www\.)?yonogameszone\.com\/?/gi, 'https://yonorummyzip.com/')
    .replace(/(?:www\.)?yonogameszone\.com/gi, 'yonorummyzip.com')
    .replace(/yonogameszone\.com/gi, 'yonorummyzip.com')

    // 5. Brand name variations
    .replace(/\bYono\s+Games\s+Zone\b/gi, 'Yono Rummy Zip')
    .replace(/\byono_games_zone\b/gi, 'yono_rummy_zip')
    .replace(/\bYonoGamesZone\b/g, 'YonoRummyZip')
    .replace(/\byonogameszone\b/g, 'yonorummyzip')
    .replace(/\bYONOGAMESZONE\b/g, 'YONORUMMYZIP');
}

export function sanitizeBrandArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item) => (typeof item === 'string' ? sanitizeBrandAndDomain(item) : item));
}

export function sanitizeBlogOutput<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const result: any = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string') {
      result[key] = sanitizeBrandAndDomain(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        typeof item === 'string' ? sanitizeBrandAndDomain(item) : item
      );
    } else if (val && typeof val === 'object') {
      result[key] = sanitizeBlogOutput(val);
    }
  }

  return result;
}

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
    .replace(/[a-zA-Z0-9._%+-]+@(?:www\.)?yonogameszone\.com/gi, 'support@allyonogames99.com')
    .replace(/yonogameszone@gmail\.com/gi, 'support@allyonogames99.com')

    // 2. Social / Telegram handles
    .replace(/t\.me\/yonogameszone/gi, 't.me/+all_yono_games_official')
    .replace(/@yonogameszone/gi, '@all_yono_games_official')

    // 3. CDN / image URLs
    .replace(/https?:\/\/(?:www\.)?cdn\.yonogameszone\.com/gi, 'https://allyonogames99.com')
    .replace(/(?:www\.)?cdn\.yonogameszone\.com/gi, 'allyonogames99.com')

    // 4. Full domain URLs
    .replace(/https?:\/\/(?:www\.)?yonogameszone\.com\/?/gi, 'https://allyonogames99.com/')
    .replace(/(?:www\.)?yonogameszone\.com/gi, 'allyonogames99.com')
    .replace(/yonogameszone\.com/gi, 'allyonogames99.com')

    // 5. Brand name variations
    .replace(/\bYono\s+Games\s+Zone\b/gi, 'All Yono Games 99')
    .replace(/\byono_games_zone\b/gi, 'all_yono_games_99')
    .replace(/\bYonoGamesZone\b/g, 'AllYonoGames99')
    .replace(/\byonogameszone\b/g, 'allyonogames99')
    .replace(/\bYONOGAMESZONE\b/g, 'ALLYONOGAMES99');
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

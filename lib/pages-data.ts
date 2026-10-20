import fs from 'fs';
import path from 'path';
import rawPagesData from '@/app/pages_data.json';

export interface PageEntry {
  title?: string;
  description?: string;
  body: string;
}

let cachedPagesData: Record<string, PageEntry> | null = null;

export function getPagesData(): Record<string, PageEntry> {
  if (cachedPagesData) {
    return cachedPagesData;
  }
  if (rawPagesData && typeof rawPagesData === 'object' && Object.keys(rawPagesData).length > 0) {
    cachedPagesData = rawPagesData as unknown as Record<string, PageEntry>;
    return cachedPagesData;
  }
  try {
    const filePath = path.join(process.cwd(), 'app', 'pages_data.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      cachedPagesData = JSON.parse(raw);
      return cachedPagesData!;
    }
  } catch (err) {
    console.error('[pages-data] Failed to read pages_data.json:', err);
  }
  return {};
}

// Canonical aliases map so routes render directly at their requested paths without redirection
const SLUG_ALIASES: Record<string, string> = {
  'privacy-policy': 'privacy',
  'privacy': 'privacy',
  'privecy': 'privacy',
  'privecy-policy': 'privacy',
  'privacy-police': 'privacy',
  'privacy-policy.html': 'privacy',
  'privacy.html': 'privacy',
  'about-us': 'about',
  'about': 'about',
  'about.html': 'about',
  'contact-us': 'contact',
  'contact': 'contact',
  'contact.html': 'contact',
  'terms-and-conditions': 'terms',
  'terms-of-service': 'terms',
  'terms': 'terms',
  'terms.html': 'terms',
  'disclaimer': 'disclaimer',
  'disclaimer.html': 'disclaimer',
  'all-yono-games': 'yono-games-list',
};

export function getPageData(slug: string): PageEntry | null {
  const all = getPagesData();
  const lowerSlug = slug.toLowerCase();
  if (all[lowerSlug]) {
    return all[lowerSlug];
  }
  const aliasTarget = SLUG_ALIASES[lowerSlug];
  if (aliasTarget && all[aliasTarget]) {
    return all[aliasTarget];
  }
  return null;
}


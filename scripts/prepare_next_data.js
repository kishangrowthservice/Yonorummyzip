const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'new_pages_raw');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

const pagesData = {};
const gameSlugs = new Set();

// First pass: collect all known slugs
for (const file of files) {
  const s = file.replace('.html', '');
  if (s !== 'index') {
    gameSlugs.add(s);
  }
}

const knownSlugsList = Array.from(gameSlugs);

for (const file of files) {
  const slug = file.replace('.html', '');
  let html = fs.readFileSync(path.join(pagesDir, file), 'utf8');

  // Extract title
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Yono Game Zone – Download Yono Games Apps';

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1] : '';

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;

  // Clean inline executable scripts (keep SEO schema application/ld+json)
  body = body.replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, '');

  // Normalize image and asset paths
  body = body.replace(/src=["']\/?uploads\//g, 'src="/uploads/');
  body = body.replace(/href=["']\/?uploads\//g, 'href="/uploads/');
  body = body.replace(/src=["']\/?assets\//g, 'src="/assets/');
  body = body.replace(/href=["']\/?assets\//g, 'href="/assets/');
  body = body.replace(/loading=["']lazy["']/gi, 'loading="eager"');

  // Replace absolute internal links: https://www.yonogameszone.com/slug -> /slug
  body = body.replace(/https:\/\/(www\.)?yonogameszone\.com\//g, '/');
  body = body.replace(/https:\/\/(www\.)?yonogameszone\.com(?=["'\s>])/g, '/');

  // Normalize relative root / home links
  body = body.replace(/href=["']\.\/?["']/g, 'href="/"');

  // Ensure all internal slugs start with leading slash '/'
  for (const s of knownSlugsList) {
    // Match href="slug" or href='slug' exactly
    const reg = new RegExp(`href=["']${s}["']`, 'g');
    body = body.replace(reg, `href="/${s}"`);
  }

  // Remove ALL external referral redirects: replace with href="#" and remove target="_blank"
  // Any href starting with http:// or https:// remaining in body
  body = body.replace(/href=["']https?:\/\/[^"'>]+["']/gi, 'href="#"');
  body = body.replace(/target=["']_blank["']/gi, '');

  // Safeguard dummy contact details
  body = body.replace(/contact@yonogameszone\.com/gi, 'support@example.com');
  body = body.replace(/admin@yonogameszone\.com/gi, 'support@example.com');
  body = body.replace(/\+91\s*[6-9]\d{9}/g, '+91 98765 43210');

  pagesData[slug] = {
    slug,
    title,
    description,
    body
  };
}

fs.writeFileSync(path.join(__dirname, '..', 'app', 'pages_data.json'), JSON.stringify(pagesData));
fs.writeFileSync(path.join(__dirname, '..', 'app', 'all_slugs.json'), JSON.stringify(knownSlugsList, null, 2));

console.log(`Processed ${Object.keys(pagesData).length} pages.`);
console.log(`Saved ${knownSlugsList.length} slugs to all_slugs.json.`);

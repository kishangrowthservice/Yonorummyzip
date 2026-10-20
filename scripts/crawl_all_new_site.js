const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const urls = JSON.parse(fs.readFileSync('new_ref_all_urls.json', 'utf8'));

const pagesDir = path.join(__dirname, '..', 'new_pages_raw');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(pagesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080 });

  const allImages = new Set();
  const pageMap = [];

  console.log(`Starting crawl of ${urls.length} pages...`);

  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    let slug = u.replace('https://www.yonogameszone.com', '').replace(/^\/+|\/+$/g, '');
    if (!slug) slug = 'index';

    console.log(`[${i + 1}/${urls.length}] Crawling ${u} -> ${slug}...`);

    try {
      await page.goto(u, { waitUntil: 'networkidle2', timeout: 35000 });
      const html = await page.content();
      const title = await page.title();

      // Extract all image srcs
      const imgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img[src]')).map(img => img.getAttribute('src'));
      });
      imgs.forEach(src => {
        if (src && !src.startsWith('data:') && !src.includes('googletagmanager')) {
          allImages.add(src);
        }
      });

      fs.writeFileSync(path.join(pagesDir, `${slug}.html`), html);

      pageMap.push({
        url: u,
        slug: slug,
        title: title,
        file: `${slug}.html`
      });
    } catch (err) {
      console.error(`Failed ${u}: ${err.message}`);
    }
  }

  fs.writeFileSync('new_pages_index.json', JSON.stringify(pageMap, null, 2));
  console.log(`Saved ${pageMap.length} pages.`);
  console.log(`Found ${allImages.size} unique image assets. Downloading images...`);

  // Download all unique images
  let downloadedCount = 0;
  for (const imgSrc of allImages) {
    let fullUrl = imgSrc;
    if (imgSrc.startsWith('/')) {
      fullUrl = 'https://www.yonogameszone.com' + imgSrc;
    } else if (!imgSrc.startsWith('http')) {
      fullUrl = 'https://www.yonogameszone.com/' + imgSrc;
    }

    const filename = path.basename(new URL(fullUrl).pathname);
    let targetFolder = uploadsDir;
    if (fullUrl.includes('/assets/')) {
      targetFolder = path.join(__dirname, '..', 'public', 'assets', 'img');
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const targetPath = path.join(targetFolder, filename);
    if (!fs.existsSync(targetPath)) {
      try {
        const b64 = await page.evaluate(async (url) => {
          const res = await fetch(url);
          if (!res.ok) return null;
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }, fullUrl);

        if (b64 && b64.includes(',')) {
          const buf = Buffer.from(b64.split(',')[1], 'base64');
          fs.writeFileSync(targetPath, buf);
          downloadedCount++;
        }
      } catch (e) {
        console.warn(`Could not download image ${fullUrl}: ${e.message}`);
      }
    }
  }

  console.log(`Downloaded ${downloadedCount} new images to public.`);
  await browser.close();
  console.log('Crawl finished successfully!');
}

run();

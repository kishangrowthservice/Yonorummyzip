const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const slugs = [
  'money-rummy',
  'yono-game-download',
  'yono-game-withdrawal',
  'yono-game-real-or-fake',
  'yono-777-apk',
  'yono-arcade-app'
];

const pagesDir = path.join(__dirname, '..', 'new_pages_raw');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

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

  for (const slug of slugs) {
    const url = `https://www.yonogameszone.com/${slug}`;
    console.log(`Crawling ${url}...`);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
      console.log(`Status for ${slug}:`, resp ? resp.status() : 'null');
      const html = await page.content();
      fs.writeFileSync(path.join(pagesDir, `${slug}.html`), html);

      const imgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img[src]')).map(img => img.getAttribute('src'));
      });
      imgs.forEach(src => {
        if (src && !src.startsWith('data:') && !src.includes('googletagmanager')) {
          allImages.add(src);
        }
      });
    } catch (err) {
      console.error(`Error crawling ${slug}:`, err.message);
    }
  }

  console.log(`Downloading ${allImages.size} images...`);
  for (const imgSrc of allImages) {
    let fullUrl = imgSrc;
    if (imgSrc.startsWith('/')) {
      fullUrl = 'https://www.yonogameszone.com' + imgSrc;
    } else if (!imgSrc.startsWith('http')) {
      fullUrl = 'https://www.yonogameszone.com/' + imgSrc;
    }

    const filename = path.basename(new URL(fullUrl).pathname);
    const targetPath = path.join(uploadsDir, filename);

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
          console.log(`Downloaded image ${filename}`);
        }
      } catch (e) {
        console.warn(`Could not download image ${fullUrl}:`, e.message);
      }
    }
  }

  await browser.close();
  console.log('Finished crawling missing pages!');
}

run().catch(console.error);

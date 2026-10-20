const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const slugs = JSON.parse(fs.readFileSync('app/all_slugs.json', 'utf8'));

async function runAudit() {
  console.log(`Starting comprehensive audit of homepage + ${slugs.length} subpages...`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const auditResults = {
    totalPagesTested: 0,
    passedPages: 0,
    failedPages: [],
    failedAssetUrls: [],
    consoleErrors: [],
    brokenImages: []
  };

  page.on('response', (response) => {
    if (response.status() >= 400) {
      auditResults.failedAssetUrls.push({
        pageUrl: page.url(),
        assetUrl: response.url(),
        status: response.status()
      });
    }
  });

  page.on('pageerror', (err) => {
    auditResults.consoleErrors.push({
      pageUrl: page.url(),
      error: err.message
    });
  });

  const testList = [''].concat(slugs);

  for (let i = 0; i < testList.length; i++) {
    const s = testList[i];
    const path = s ? `/${s}` : '/';
    const fullUrl = `http://localhost:3000${path}`;

    if (i % 10 === 0 || i === testList.length - 1) {
      console.log(`[${i + 1}/${testList.length}] Auditing ${path}...`);
    }

    try {
      const resp = await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 25000 });
      auditResults.totalPagesTested++;

      if (!resp || resp.status() >= 400) {
        auditResults.failedPages.push({ path, status: resp ? resp.status() : 'no-resp' });
        continue;
      }

      // Check all images on this page
      const badImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const bad = [];
        for (const img of imgs) {
          if (!img.complete || img.naturalWidth === 0) {
            bad.push({
              src: img.src,
              alt: img.alt || ''
            });
          }
        }
        return bad;
      });

      if (badImages.length > 0) {
        auditResults.brokenImages.push({
          page: path,
          images: badImages
        });
      } else {
        auditResults.passedPages++;
      }
    } catch (e) {
      auditResults.failedPages.push({ path, error: e.message });
    }
  }

  await browser.close();

  fs.writeFileSync('audit_report.json', JSON.stringify(auditResults, null, 2));

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Total Pages Tested: ${auditResults.totalPagesTested}`);
  console.log(`Passed (100% Clean): ${auditResults.passedPages}`);
  console.log(`Failed Pages Count: ${auditResults.failedPages.length}`);
  console.log(`Failed Asset Requests (4xx/5xx): ${auditResults.failedAssetUrls.length}`);
  console.log(`Broken Images Detected: ${auditResults.brokenImages.length}`);
  console.log(`Console Errors: ${auditResults.consoleErrors.length}`);
  console.log('===============================================\n');

  if (auditResults.failedPages.length > 0) {
    console.log('Failed pages detail:', JSON.stringify(auditResults.failedPages, null, 2));
  }
  if (auditResults.failedAssetUrls.length > 0) {
    console.log('Failed assets sample:', JSON.stringify(auditResults.failedAssetUrls.slice(0, 5), null, 2));
  }
  if (auditResults.brokenImages.length > 0) {
    console.log('Broken images detail:', JSON.stringify(auditResults.brokenImages, null, 2));
  }
}

runAudit().catch(console.error);

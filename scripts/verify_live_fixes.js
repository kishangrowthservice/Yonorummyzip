const puppeteer = require('puppeteer-core');

async function verifyLiveFixes() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const failedRequests = [];
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  // 1. Check live /money-rummy
  console.log('Navigating to live https://yono-games-one.vercel.app/money-rummy...');
  const resMoney = await page.goto('https://yono-games-one.vercel.app/money-rummy', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  console.log('Money Rummy live status:', resMoney.status());
  await page.screenshot({ path: 'vercel_live_money_rummy.png' });

  // 2. Check live Homepage
  console.log('Navigating to live https://yono-games-one.vercel.app...');
  const resHome = await page.goto('https://yono-games-one.vercel.app', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  console.log('Home live status:', resHome.status());

  // Check download links on homepage
  const sampleDownloadHrefs = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a.btn-download-list, a.btn-primary'));
    return links.slice(0, 5).map(l => l.getAttribute('href'));
  });
  console.log('Sample download links on live homepage:', sampleDownloadHrefs);

  // Test live theme toggle
  console.log('Testing live theme toggle...');
  const themeInitial = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.click('#themeToggle');
  await new Promise(r => setTimeout(r, 600));
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`Live theme toggle: ${themeInitial} -> ${themeAfter}`);
  await page.screenshot({ path: 'vercel_live_light_mode.png' });

  // 3. Test mobile viewport on live
  console.log('Testing live mobile viewport...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://yono-games-one.vercel.app', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'vercel_live_mobile_home.png' });

  await page.click('.navbar-toggler');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'vercel_live_mobile_menu.png' });

  console.log('Total failed requests:', failedRequests.length);
  if (failedRequests.length > 0) {
    console.log('Failed requests:', failedRequests);
  }

  await browser.close();
  console.log('Live verification finished successfully!');
}

verifyLiveFixes().catch(console.error);

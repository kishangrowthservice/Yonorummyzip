const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testLive() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const failedRequests = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  console.log('Navigating to https://yono-games-one.vercel.app...');
  await page.goto('https://yono-games-one.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });

  await page.screenshot({ path: 'vercel_live_yonogameszone_viewport.png' });
  await page.screenshot({ path: 'vercel_live_yonogameszone_fullpage.png', fullPage: true });

  console.log('Testing subpage /101-z...');
  await page.goto('https://yono-games-one.vercel.app/101-z', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'vercel_live_subpage_101z.png' });

  console.log('Failed requests count:', failedRequests.length);
  if (failedRequests.length > 0) {
    console.log('Failed requests:', JSON.stringify(failedRequests.slice(0, 10), null, 2));
  }

  await browser.close();
  console.log('Done verification!');
}

testLive().catch(console.error);

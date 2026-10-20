const puppeteer = require('puppeteer-core');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. 360px (Standard compact mobile)
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_360_home.png' });

  await page.goto('http://localhost:3001/money-rummy', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_360_detail.png' });

  // 2. 390px (iPhone 14)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_390_home.png' });

  await page.goto('http://localhost:3001/money-rummy', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_390_detail.png' });

  await page.goto('http://localhost:3001/yono-games-list', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_390_list.png' });

  await page.goto('http://localhost:3001/about', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_390_about.png' });

  // 3. 768px (Tablet)
  await page.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_768_home.png' });

  await page.goto('http://localhost:3001/money-rummy', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_mobile_768_detail.png' });

  await browser.close();
  console.log('All responsive tests completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

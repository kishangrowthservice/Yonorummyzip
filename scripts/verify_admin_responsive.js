const puppeteer = require('puppeteer-core');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Testing Admin Login at 360px...');
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3001/admin/login', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'test_admin_login_360.png' });

  // Perform login
  console.log('Logging in with admin credentials...');
  await page.type('input[type="email"]', 'admin@yonogames.com');
  await page.type('input[type="password"]', 'AdminPassword123!');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
  ]);

  await new Promise(r => setTimeout(r, 2000));

  // 1. Admin Dashboard at 360px
  console.log('Testing Admin Dashboard at 360px...');
  await page.goto('http://localhost:3001/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_admin_dashboard_360.png' });

  // Open Sidebar Menu
  console.log('Testing Admin Sidebar Mobile Drawer at 360px...');
  const menuBtn = await page.$('button[aria-label="Toggle sidebar"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'test_admin_sidebar_360.png' });
    // Close sidebar
    const closeBtn = await page.$('button[aria-label="Close sidebar"]');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // Open Add App Modal
  console.log('Testing Add App Modal at 360px...');
  const addAppBtn = await page.$('header button:last-child');
  if (addAppBtn) {
    await addAppBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'test_admin_modal_360.png' });
    // Close modal
    const closeModalBtn = await page.$('button[aria-label="Close modal"]');
    if (closeModalBtn) await closeModalBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // 2. Admin Blog Dashboard at 360px
  console.log('Testing Admin Blog Dashboard at 360px...');
  await page.goto('http://localhost:3001/admin/blog', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_admin_blog_360.png' });

  // 3. Admin Dashboard at 390px (iPhone 14)
  console.log('Testing Admin Dashboard at 390px...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3001/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_admin_dashboard_390.png' });

  // 4. Admin Dashboard at 768px (Tablet)
  console.log('Testing Admin Dashboard at 768px...');
  await page.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3001/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_admin_dashboard_768.png' });

  await browser.close();
  console.log('All admin responsive tests finished successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

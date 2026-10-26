import fs from 'fs';
import path from 'path';
import { AppRecord } from './supabase';
import { formatMarkdown, stripMarkdown } from './markdown';
import { resolveDownloadUrl } from './safe-url';

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

import { getPageData } from './pages-data';

export function getLayoutSnippets() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Yono Rummy Zip';
  const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'yonorummyzip.com';

  const navbar = `
    <nav class="winner-navbar">
      <div class="winner-nav-inner">
        <div class="winner-logo-section">
          <a href="/">
            <img src="/assets/img/logo-rummyzip.svg" alt="${siteName} Logo" width="76" height="76" class="winner-logo-img" onerror="this.onerror=null;this.src='/assets/img/logo.png';">
          </a>
        </div>
        <a href="/" class="winner-nav-title">${siteDomain}</a>
        <div class="winner-telegram-section">
          <a href="https://t.me/yonorummyzip" target="_blank" rel="noopener noreferrer" class="winner-telegram-icon" aria-label="Join Official Telegram">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2l-2 20-6-4-3 4V14L2 10l19-8z"></path>
              <path d="M21 2L9 14"></path>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  `;

  const footer = `
    <footer class="winner-footer">
      <div class="winner-container">
        <div class="winner-footer-grid">
          <div>
            <a href="/" class="winner-footer-logo">${siteDomain}</a>
            <p class="winner-footer-desc">
              Your official portal for downloading verified ${siteName} APK, Rummy apps, and exciting card games with instant UPI cashouts and exclusive signup bonuses.
            </p>
          </div>
          <div>
            <h4 class="winner-footer-title">Quick Links</h4>
            <div class="winner-footer-links">
              <a href="/">Home</a>
              <a href="/blog">Gaming Guides & Tricks</a>
              <a href="/about">About Us</a>
              <a href="/contact">Support & Contact</a>
            </div>
          </div>
          <div>
            <h4 class="winner-footer-title">Legal & Security</h4>
            <div class="winner-footer-links">
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms">Terms & Conditions</a>
              <span style="font-size: 12px; color: #64748b;">
                ⚠️ 18+ Only. Play responsibly. Real-money gaming involves financial risk.
              </span>
            </div>
          </div>
        </div>
        <div class="winner-footer-bottom">
          <p>© ${new Date().getFullYear()} ${siteDomain} – All Rights Reserved. Not affiliated with SBI.</p>
        </div>
      </div>
    </footer>
  `;

  return { navbar, footer };
}

export function applyWinnerLayout(html: string, slug?: string): string {
  const { navbar, footer } = getLayoutSnippets();
  let result = html;

  if (slug) {
    try {
      const cataloguePath = path.join(process.cwd(), 'data', 'games-catalogue.json');
      if (fs.existsSync(cataloguePath)) {
        const cat = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
        const found = cat.find((g: any) => g.slug?.toLowerCase() === slug.toLowerCase());
        if (found && found.downloadUrl) {
          result = result.replace(
            /<a\s+href="#"\s+class="btn btn-primary([^"]*)">/g,
            `<a href="${found.downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary$1">`
          );
        }
      }
    } catch {
      // ignore
    }
  }

  const navStart = result.indexOf('<nav');
  const navEnd = result.indexOf('</nav>');
  if (navStart !== -1 && navEnd !== -1) {
    result = navbar + result.slice(navEnd + 6);
  } else {
    result = navbar + result;
  }

  const footerStart = result.indexOf('<footer');
  if (footerStart !== -1) {
    result = result.slice(0, footerStart) + footer;
  } else {
    result = result + footer;
  }

  return result;
}

export function renderAppPage(app: AppRecord): string {
  const { navbar, footer } = getLayoutSnippets();

  const safeName = escapeHtml(app.name);
  const bonus = app.signup_bonus ?? 0;
  const minW = app.min_withdrawal ?? 100;
  const rating = (app.rating || 4.5).toFixed(1);
  const logo = app.logo_url || '/assets/img/logo.png';
  const rawDownloadUrl = app.download_url || '#';
  const downloadUrl = resolveDownloadUrl(rawDownloadUrl, app.slug);
  const category = escapeHtml((app.category || 'yono games').toUpperCase());
  const rawDesc =
    app.short_desc ||
    app.description ||
    `**${app.name}** is an exciting online card and gaming app for Android. Download the official APK to enjoy high-speed payouts, instant withdrawals, and an exclusive ₹${bonus} welcome bonus directly on your mobile.`;
  const formattedDesc = formatMarkdown(rawDesc);

  let screenshotsHtml = '';
  if (app.screenshot_urls && app.screenshot_urls.length > 0) {
    const items = app.screenshot_urls
      .map(
        (url, i) => `
        <div class="flex-shrink-0 w-64 sm:w-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-md">
          <img src="${url}" alt="${safeName} screenshot ${i + 1}" class="w-full h-auto object-cover" loading="lazy" onerror="this.parentElement.style.display='none';">
        </div>
      `
      )
      .join('\n');

    screenshotsHtml = `
      <div class="mt-8">
        <h4 class="text-base sm:text-lg font-bold text-slate-900 mb-3">${safeName} Screenshots</h4>
        <div class="flex items-center gap-4 overflow-x-auto pb-4 snap-x">
          ${items}
        </div>
      </div>
    `;
  }

  let bannerHtml = '';
  if (app.banner_url) {
    bannerHtml = `
      <div class="mt-6 mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-80">
        <img src="${app.banner_url}" alt="${safeName} Banner" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none';">
      </div>
    `;
  }

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: `${safeName} APK`,
    operatingSystem: 'Android',
    applicationCategory: 'GameApplication',
    downloadUrl: downloadUrl !== '#' ? downloadUrl : undefined,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      ratingCount: 1540,
      bestRating: '5',
      worstRating: '1',
    },
  });

  const main = `
  <script type="application/ld+json">
    ${schemaJson}
  </script>
  <main class="min-h-screen py-3 sm:py-8 px-2 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24 md:pb-12 text-slate-900 transition-colors">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
      <a href="/" class="hover:text-indigo-600 transition-colors flex items-center gap-1">
        <i class="fas fa-home"></i> Home
      </a>
      <span>/</span>
      <a href="/yono-games-list" class="hover:text-indigo-600 transition-colors">
        All Games
      </a>
      <span>/</span>
      <span class="text-slate-900 font-semibold truncate max-w-[200px]">${safeName}</span>
    </nav>

    <!-- 2 Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
      <!-- Left: App Card & CTA -->
      <div class="lg:col-span-4 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 text-center shadow-sm">
        <img src="${logo}" alt="${safeName} logo" width="176" height="176" fetchpriority="high" class="w-28 h-28 sm:w-44 sm:h-44 rounded-2xl sm:rounded-3xl mx-auto object-cover shadow-lg border border-slate-200" onerror="this.onerror=null;this.src='/assets/img/logo.png';">

        <h1 class="text-base sm:text-xl font-extrabold text-slate-900 mt-3 sm:mt-4 mb-1">
          ${safeName} APK Download
        </h1>
        <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          ${category}
        </p>

        <div class="flex items-center justify-center gap-1 text-amber-400 text-sm font-bold mb-4 sm:mb-5">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star-half-alt"></i>
          <span class="text-slate-700 ml-1.5">${rating}/5.0</span>
        </div>

        <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-full text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all">
          <i class="fas fa-download"></i>
          <span>Download App Now</span>
        </a>
      </div>

      <!-- Right: Quick Info & About -->
      <div class="lg:col-span-8 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div class="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div class="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 mb-0.5">Welcome Bonus</div>
            <div class="text-sm sm:text-xl font-extrabold text-emerald-700">₹${bonus}</div>
          </div>
          <div class="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div class="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 mb-0.5">Min Withdraw</div>
            <div class="text-base sm:text-xl font-extrabold text-amber-700">₹${minW}</div>
          </div>
          <div class="p-3 sm:p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-800 mb-0.5">Safety Status</div>
            <div class="text-base sm:text-xl font-extrabold text-sky-700">Verified</div>
          </div>
        </div>

        <!-- About Section -->
        <div class="pt-1">
          <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <span class="w-1.5 h-5 rounded-full bg-indigo-600 inline-block"></span>
            <h2 class="text-base sm:text-lg font-extrabold text-slate-900">
              About ${safeName} App
            </h2>
          </div>
          <div class="app-description-content text-slate-700 leading-relaxed">
            ${formattedDesc}
          </div>
        </div>

        ${bannerHtml}
        ${screenshotsHtml}

        <!-- CTA Box -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 text-center">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 mb-1">Ready to Play ${safeName}?</h3>
          <p class="text-xs sm:text-sm text-slate-500 mb-4">Claim ₹${bonus} welcome bonus and start playing today!</p>
          <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/25 active:scale-95 transition-all">
            <i class="fas fa-download"></i> Download APK Now
          </a>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Floating Bottom CTA Bar -->
    <div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-4 shadow-2xl flex items-center justify-between gap-3 md:hidden">
      <div class="flex items-center gap-3 min-w-0">
        <img src="${logo}" alt="${safeName}" width="48" height="48" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow border border-slate-200" onerror="this.onerror=null;this.src='/assets/img/logo.png';">
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-900 truncate">${safeName}</div>
          <div class="text-[11px] font-bold text-emerald-600">Bonus: ₹${bonus}</div>
        </div>
      </div>
      <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 shadow-md active:scale-95 flex-shrink-0 transition-all flex items-center gap-1.5">
        <i class="fas fa-download"></i> Download
      </a>
    </div>
  </main>
  `;

  return (navbar || '') + main + (footer || '');
}

export function injectAppsIntoHomePage(originalHtml: string, apps: AppRecord[]): string {
  if (!apps || apps.length === 0) return originalHtml;

  const marker = '<div class="row g-3">';
  const idx = originalHtml.indexOf(marker);
  if (idx === -1) return originalHtml;

  const newApps = apps.filter((app) => !originalHtml.includes(`/${app.slug}"`));
  if (newApps.length === 0) return originalHtml;

  const cardsHtml = newApps
    .map(
      (app) => `
    <div class="col-lg-4 col-md-6 col-12 game-item" data-title="${escapeHtml(app.name)}">
      <div class="game-list-card">
        <div class="game-rank" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; font-weight: bold;">NEW</div>
        <img src="${app.logo_url || '/assets/img/logo.png'}" alt="${escapeHtml(app.name)} Logo" class="game-list-logo" style="object-fit: cover; border-radius: 18px;" onerror="this.onerror=null;this.src='/assets/img/logo.png';">
        <div class="game-list-content">
          <h4 class="game-list-title text-truncate">
            <a href="/${app.slug}" style="color: inherit; text-decoration: none;" title="Download ${escapeHtml(app.name)} APK">
              ${escapeHtml(app.name)}
            </a>
          </h4>
          <div class="game-list-info">
            <div class="game-info-item">
              <i class="fas fa-gift text-info me-1"></i> Bonus: <span class="info-value ms-1">₹${app.signup_bonus ?? 0}</span>
            </div>
            <div class="game-info-item">
              <i class="fas fa-wallet text-warning me-1"></i> Min: <span class="info-value ms-1">₹${app.min_withdrawal ?? 100}</span>
            </div>
          </div>
        </div>
        <a href="/${app.slug}" class="btn btn-download-list" title="Download ${escapeHtml(app.name)} APK Now">
          Download APK
        </a>
      </div>
    </div>
  `
    )
    .join('\n');

  return (
    originalHtml.slice(0, idx + marker.length) +
    '\n' +
    cardsHtml +
    originalHtml.slice(idx + marker.length)
  );
}

export function injectAppsIntoListGrid(originalHtml: string, apps: AppRecord[]): string {
  if (!apps || apps.length === 0) return originalHtml;

  const marker = '<div class="row g-4" id="gamesGrid">';
  const idx = originalHtml.indexOf(marker);
  if (idx === -1) return originalHtml;

  const newApps = apps.filter((app) => !originalHtml.includes(`/${app.slug}"`));
  if (newApps.length === 0) return originalHtml;

  const cardsHtml = newApps
    .map(
      (app) => `
    <div class="col-lg-3 col-md-6 col-6 game-item" data-title="${escapeHtml(app.name)}">
      <div class="game-grid-card">
        <img src="${app.logo_url || '/assets/img/logo.png'}" alt="${escapeHtml(app.name)} logo" class="game-grid-logo" style="object-fit: cover; border-radius: 18px;" onerror="this.onerror=null;this.src='/assets/img/logo.png';">
        <h4 class="game-grid-title text-truncate">${escapeHtml(app.name)}</h4>
        <div class="game-info">
          <div class="game-info-row">
            <span>Sign Up Bonus</span>
            <span class="game-info-value text-info">₹${app.signup_bonus ?? 0}</span>
          </div>
          <div class="game-info-row">
            <span>Min Withdrawal</span>
            <span class="game-info-value text-warning">₹${app.min_withdrawal ?? 100}</span>
          </div>
        </div>
        <a href="/${app.slug}" class="btn btn-download-grid">
          Download Now
        </a>
      </div>
    </div>
  `
    )
    .join('\n');

  return (
    originalHtml.slice(0, idx + marker.length) +
    '\n' +
    cardsHtml +
    originalHtml.slice(idx + marker.length)
  );
}

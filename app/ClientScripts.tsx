'use client';

import { useEffect } from 'react';

const gamesData = [
  {"title":"101 Z","slug":"/101-z","logo":"EYicHLobVWmxnsT.jpeg","bonus":"₹10"},
  {"title":"567SLOTS","slug":"/567slots","logo":"nZVcjtSDkvI9lhe.png","bonus":"-"},
  {"title":"777 Game","slug":"/777-game","logo":"cVxqHwEWtpMQO5X.jpg","bonus":"₹7"},
  {"title":"789Jackpots","slug":"/789jackpots","logo":"rhfxXKI0PM8EARw.jpg","bonus":"₹100"},
  {"title":"ABC Rummy","slug":"/abc-rummy","logo":"8tHg92aOcTGsNiL.jpeg","bonus":"₹100"},
  {"title":"Bingo101","slug":"/bingo101","logo":"L7u2dT1HqXgUvtZ.png","bonus":"₹6"},
  {"title":"Boss Rummy","slug":"/boss-rummy","logo":"mFxAWnKOM46LGHd.webp","bonus":"₹66"},
  {"title":"Club INR","slug":"/club-inr","logo":"rD0qNiLdEGPbuyJ.webp","bonus":"₹3"},
  {"title":"Dhan Game","slug":"/dhan-game-download","logo":"36ebab901b24a7.webp","bonus":"₹777"},
  {"title":"diva777","slug":"/diva777","logo":"yrIHZK3Rsvip6fe.webp","bonus":"₹108"},
  {"title":"Diwa Win","slug":"/diwa-win","logo":"e33bdebb984efe.jpg","bonus":"₹300"},
  {"title":"Diwavip Game","slug":"/diwavip-game","logo":"0214499041dcb9.jpg","bonus":"₹108"},
  {"title":"EVER777","slug":"/ever777","logo":"KWI60xdwa2MEVvi.webp","bonus":"₹7"},
  {"title":"GameRummy","slug":"/gamerummy","logo":"ye7MiZ83npBUlF9.webp","bonus":"-"},
  {"title":"Gogo Rummy","slug":"/gogo-rummy","logo":"MXES31ZKaJkg6mc.png","bonus":"₹11"},
  {"title":"Gold Rummy","slug":"/gold-rummy","logo":"d60cd91817da33.webp","bonus":"₹399"},
  {"title":"GOOD SLOTS","slug":"/good-slots","logo":"gCZW0jFt6pb5SY4.jpeg","bonus":"-"},
  {"title":"Hi Rummy","slug":"/hi-rummy","logo":"EWU5gIF2udH69Lq.jpg","bonus":"-"},
  {"title":"Hindi777","slug":"/hindi777","logo":"ltMqUL3G4Sjh1nH.png","bonus":"-"},
  {"title":"IND Club","slug":"/ind-club","logo":"lCJ9D25f3BkcZzq.jpeg","bonus":"₹13"},
  {"title":"IndRummy","slug":"/indrummy","logo":"5v3B1tyY2d8plIb.webp","bonus":"-"},
  {"title":"Indslots","slug":"/indslots","logo":"kcZyBQViuOPECg4.webp","bonus":"₹15+"},
  {"title":"INR Rummy","slug":"/inr-rummy","logo":"9XsSzQ5AvhiW0PU.webp","bonus":"₹3"},
  {"title":"Jaiho 777","slug":"/jaiho-777","logo":"6Vo0ufC58DZqGMF.png","bonus":"₹7"},
  {"title":"Jaiho 91","slug":"/jaiho-91","logo":"79d183e41f74d6.png","bonus":"₹100"},
  {"title":"Jaiho Arcade","slug":"/jaiho-arcade","logo":"u3A14JYwnCRPLGv.png","bonus":"₹10"},
  {"title":"Jaiho Win","slug":"/jaiho-win","logo":"ZwNq7UAd6Bo0ty2.webp","bonus":"₹10"},
  {"title":"JaiHoRummy","slug":"/jaihorummy","logo":"eMatqwJEI2uDQzi.jpg","bonus":"₹9-89"},
  {"title":"JaihoSlots","slug":"/jaihoslots","logo":"sbqMOauPrFNpQ86.jpeg","bonus":"₹66"},
  {"title":"JoyRummy","slug":"/joyrummy","logo":"Th2eOkaZHXS8CY5.jpg","bonus":"₹300"},
  {"title":"Love Rummy","slug":"/love-rummy-apk","logo":"69bbc7380c78cd.webp","bonus":"₹500"},
  {"title":"Maha Games","slug":"/maha-games","logo":"DR2PIrTZFJC8g3E.webp","bonus":"₹5"},
  {"title":"Maxrummy","slug":"/maxrummy","logo":"65d8d415d20622.png","bonus":"₹200"},
  {"title":"MBMBET","slug":"/mbmbet","logo":"XYNETRnZ8L7UuFm.jpeg","bonus":"₹20"},
  {"title":"Money Rummy","slug":"/money-rummy","logo":"0ee2a1b7e46047.webp","bonus":"₹99"},
  {"title":"MQMBAT","slug":"/mqmbat","logo":"0adflkxJgZs5qnM.png","bonus":"-"},
  {"title":"Neta.Vip","slug":"/neta-vip","logo":"yQ2PLSmbBlcJC5G.jpeg","bonus":"₹4"},
  {"title":"OKRUMMY","slug":"/okrummy","logo":"Mypse1xXkRKcrv7.png","bonus":"₹199"},
  {"title":"Rumble Rummy","slug":"/rumble-rummy","logo":"viojX60NI3CwMBO.jpg","bonus":"₹5"},
  {"title":"Rummy77","slug":"/rummy77","logo":"nRXTmHUVxvNbe2F.png","bonus":"₹5"},
  {"title":"Rummy888","slug":"/rummy888","logo":"yhUn1fYLMS5FeWb.webp","bonus":"₹4"},
  {"title":"RUMMY91","slug":"/rummy91","logo":"qOYX1tTJ7lgm3HQ.png","bonus":"₹5-39"},
  {"title":"RummyLudo","slug":"/rummyludo","logo":"ux9mtr6LgzyV8h1.jpg","bonus":"-"},
  {"title":"Saga Slots","slug":"/saga-slots","logo":"Q0xdfH3L57nTyA9.webp","bonus":"₹7"},
  {"title":"Slots Spin","slug":"/slots-spin","logo":"50pjWKYZyBfXl6k.webp","bonus":"₹10"},
  {"title":"Slots Winner","slug":"/slots-winner","logo":"bgracwlIh5AL1jD.jpeg","bonus":"₹18-100"},
  {"title":"Spin Crush","slug":"/spin-crush","logo":"Z1uBS5l9mHsWvVd.png","bonus":"₹50"},
  {"title":"Spin Gold","slug":"/spin-gold","logo":"0rbiDkqspTJ4hvM.webp","bonus":"₹7"},
  {"title":"Spin Winnner","slug":"/spin-winnner-apk-download","logo":"4789423015899a.png","bonus":"3000"},
  {"title":"Spin101","slug":"/spin101","logo":"KDIuUZa72tACmsE.webp","bonus":"₹50"},
  {"title":"SPIN777","slug":"/spin777","logo":"ZuSvOH2YBQkePdj.webp","bonus":"₹12"},
  {"title":"Top Rummy","slug":"/top-rummy","logo":"3fAQ5JXHvWB8EKp.png","bonus":"₹8"},
  {"title":"Win Rummy","slug":"/win-rummy-apk-download","logo":"5d8cfc8179f9a9.webp","bonus":"₹199"},
  {"title":"Yes Spin","slug":"/yes-spin","logo":"SfPRBM9WKIQzVZi.jpg","bonus":"₹119"},
  {"title":"YN777","slug":"/yn777","logo":"NDrAL9zT48pXlc7.jpeg","bonus":"₹13"},
  {"title":"Yono Games","slug":"/yono-games","logo":"ziDyJAOEqgacCh6.png","bonus":"₹50"},
  {"title":"yono rummy","slug":"/yono-rummy","logo":"KIuNTF2OsacBVEg.jpeg","bonus":"₹13+"},
  {"title":"yono slots","slug":"/yono-slots","logo":"aQX97KqbcZemn3C.png","bonus":"₹11"},
  {"title":"YONO777","slug":"/yono777","logo":"7k1I9KZrXVydznH.webp","bonus":"₹15"},
  {"title":"YonoVIP","slug":"/yonovip","logo":"6a93cdcb06d871.png","bonus":"₹10"}
];

export default function ClientScripts() {
  useEffect(() => {
    // 1. Theme Setup — Strictly White / Light Theme Only
    const root = document.documentElement;
    const applyTheme = () => {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('yono_theme', 'light');
        localStorage.setItem('yono_admin_theme', 'light');
        localStorage.setItem('theme', 'light');
      } catch {}
    };

    applyTheme();

    // Hide any legacy toggle elements from DOM
    const hideToggles = () => {
      document.querySelectorAll('.theme-toggle, #themeToggle, .mobile-header-theme-toggle, [data-action="toggle-theme"]').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
    };
    hideToggles();

    // Theme and toggle cleanup on mount
    applyTheme();
    hideToggles();

    // 2. Mobile Navbar Toggler & Backdrop Handling
    const navToggler = document.querySelector('.navbar-toggler') as HTMLElement | null;
    const navCollapse = document.getElementById('navbarNav');
    if (navToggler && navCollapse) {
      const toggleMenu = () => {
        const isOpen = navCollapse.classList.toggle('show');
        navToggler.classList.toggle('is-active', isOpen);
        navToggler.setAttribute('aria-expanded', String(isOpen));
        const icon = navToggler.querySelector('i');
        if (icon) {
          icon.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
        }
      };

      const closeMenu = () => {
        if (navCollapse.classList.contains('show')) {
          navCollapse.classList.remove('show');
          navToggler.classList.remove('is-active');
          navToggler.setAttribute('aria-expanded', 'false');
          const icon = navToggler.querySelector('i');
          if (icon) {
            icon.className = 'ri-menu-line';
          }
        }
      };

      navToggler.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      };

      navCollapse.querySelectorAll('.nav-link, .btn').forEach((item) => {
        item.addEventListener('click', () => {
          closeMenu();
        });
      });

      // Close when clicking outside navbar
      const handleOutsideClick = (e: MouseEvent) => {
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.contains(e.target as Node)) {
          closeMenu();
        }
      };

      // Close on escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeMenu();
      };

      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    // 3. Prevent external redirects on download/empty links
    const emptyLinks = document.querySelectorAll('a[href="#"], a[href=""]');
    emptyLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        // If it's a dummy download link or telegram placeholder, don't jump to top of page
        e.preventDefault();
      });
    });

    // 4. Live Search logic with debouncing
    const searchInput = document.getElementById('liveSearchInput') as HTMLInputElement | null;
    const resultsContainer = document.getElementById('liveSearchResults');

    if (searchInput && resultsContainer) {
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const handleInput = function (this: HTMLInputElement) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = this.value.toLowerCase().trim();
          if (query.length < 1) {
            resultsContainer.classList.remove('show');
            return;
          }

          const filtered = gamesData.filter((g) => g.title.toLowerCase().includes(query));

          if (filtered.length > 0) {
            resultsContainer.innerHTML = filtered
              .map(
                (g) => `
                <a href="${g.slug}" class="search-result-item">
                  <img src="/uploads/${g.logo}" alt="${g.title}" class="result-logo" width="40" height="40">
                  <div class="result-info">
                    <p class="result-title">${g.title}</p>
                    <p class="result-meta">Bonus: ${g.bonus}</p>
                    <p class="result-version">Version: Latest</p>
                  </div>
                </a>
              `
              )
              .join('');
            resultsContainer.classList.add('show');
          } else {
            resultsContainer.innerHTML =
              '<div class="no-results">No games found matching your search.</div>';
            resultsContainer.classList.add('show');
          }
        }, 120);
      };

      searchInput.addEventListener('input', handleInput);

      searchInput.addEventListener('focus', function (this: HTMLInputElement) {
        if (this.value.trim().length > 0) {
          resultsContainer.classList.add('show');
        }
      });

      const handleDocumentClick = (e: MouseEvent) => {
        if (!searchInput.contains(e.target as Node) && !resultsContainer.contains(e.target as Node)) {
          resultsContainer.classList.remove('show');
        }
      };
      document.addEventListener('click', handleDocumentClick);
    }

    // 5. Back to Top Logic
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      const handleScroll = () => {
        if (window.scrollY > 300) {
          backToTopBtn.style.display = 'flex';
        } else {
          backToTopBtn.style.display = 'none';
        }
      };
      window.addEventListener('scroll', handleScroll);
      backToTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // 6. FAQ Accordion Click Handler
    const accordionButtons = document.querySelectorAll('.ygz-accordion .accordion-button');
    accordionButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSelector = btn.getAttribute('data-bs-target');
        if (!targetSelector) return;
        const target = document.querySelector(targetSelector);
        if (!target) return;

        const isCurrentlyOpen = target.classList.contains('show');
        const parent = target.closest('.accordion');
        if (parent) {
          parent.querySelectorAll('.accordion-collapse').forEach((c) => c.classList.remove('show'));
          parent.querySelectorAll('.accordion-button').forEach((b) => {
            b.classList.add('collapsed');
            b.setAttribute('aria-expanded', 'false');
          });
        }

        if (!isCurrentlyOpen) {
          target.classList.add('show');
          btn.classList.remove('collapsed');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }, []);

  return null;
}

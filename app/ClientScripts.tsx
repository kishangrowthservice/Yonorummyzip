'use client';

import { useEffect } from 'react';

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

    // 4. Live Search logic with debouncing & dynamic apps loading
    const searchInput = document.getElementById('liveSearchInput') as HTMLInputElement | null;
    const resultsContainer = document.getElementById('liveSearchResults');

    if (searchInput && resultsContainer) {
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      let dynamicGames: Array<{ title: string; slug: string; logo: string; bonus: string }> = [];

      // Pre-fetch dynamic apps for the current site
      fetch('/api/apps')
        .then((res) => res.json())
        .then((json) => {
          if (json && Array.isArray(json.apps)) {
            dynamicGames = json.apps;
          }
        })
        .catch(() => {});

      const handleInput = function (this: HTMLInputElement) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = this.value.toLowerCase().trim();
          if (query.length < 1) {
            resultsContainer.classList.remove('show');
            return;
          }

          const filtered = dynamicGames.filter((g) => g.title.toLowerCase().includes(query));

          if (filtered.length > 0) {
            resultsContainer.innerHTML = filtered
              .map(
                (g) => `
                <a href="${g.slug}" class="search-result-item">
                  <img src="${g.logo}" alt="${g.title}" class="result-logo" width="40" height="40" onerror="this.onerror=null;this.src='/assets/img/logo.png';">
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

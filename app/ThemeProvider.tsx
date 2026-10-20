'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = useCallback((t: Theme = 'light') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');

    try {
      localStorage.setItem('yono_theme', 'light');
      localStorage.setItem('yono_admin_theme', 'light');
      localStorage.setItem('theme', 'light');
    } catch {}
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState('light');
    applyThemeToDOM('light');
  }, [applyThemeToDOM]);

  const toggleTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  useEffect(() => {
    applyThemeToDOM('light');
    setMounted(true);
    setMounted(true);

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme && customEvent.detail.theme !== theme) {
        setThemeState(customEvent.detail.theme);
        applyThemeToDOM(customEvent.detail.theme);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'yono_theme' || e.key === 'theme' || e.key === 'yono_admin_theme') {
        const val = (e.newValue === 'light' ? 'light' : 'dark') as Theme;
        setThemeState(val);
        applyThemeToDOM(val);
      }
    };

    window.addEventListener('yono-theme-change', handleCustomChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('yono-theme-change', handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [applyThemeToDOM, theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

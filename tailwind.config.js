/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark_disabled"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          bg: '#000000',
          card: '#0d0d0f',
          surface: '#161619',
          border: '#232328',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px -3px rgba(99, 102, 241, 0.4)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.4)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

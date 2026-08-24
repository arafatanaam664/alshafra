/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        latin: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f6f1e7',
          100: '#efe8da',
          200: '#e0d4bf',
          300: '#c9b79a',
          400: '#a89072',
          500: '#7a6248',
          600: '#9a3412',
          700: '#7c2d12',
          800: '#3f3428',
          900: '#1b1814',
        },
        ink: {
          700: '#3f3a36',
          800: '#2a2520',
          900: '#1b1814',
          950: '#120f0c',
        },
        iris: {
          300: '#f0c7a0',
          400: '#d97706',
          500: '#b45309',
          600: '#9a3412',
        },
        ember: {
          400: '#d97706',
          500: '#b45309',
        },
        gold: {
          50: '#f6f1e7',
          100: '#efe8da',
          200: '#e0d4bf',
          300: '#c9b79a',
          400: '#d97706',
          500: '#b45309',
          600: '#9a3412',
          700: '#7c2d12',
          800: '#5c2410',
          900: '#3f1a0c',
        },
        sand: {
          50: '#f6f1e7',
          100: '#efe8da',
          200: '#e0d4bf',
          300: '#c9b79a',
          400: '#a89072',
          500: '#7a6248',
        },
        sea: {
          700: '#1d4e52',
          800: '#163c3f',
        },
      },
      boxShadow: {
        soft: '0 10px 28px -18px rgba(154, 52, 18, 0.45)',
        card: '0 1px 2px rgba(27,24,20,0.04), 0 16px 36px -24px rgba(27,24,20,0.35)',
        glow: '0 0 0 1px rgba(27,24,20,0.04)',
      },
      letterSpacing: {
        brand: '0.14em',
      },
      maxWidth: {
        reading: '42rem',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Readex Pro"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        latin: ['Syne', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f3f4f8',
          100: '#e7e9f2',
          200: '#cfd3e4',
          300: '#a7aecb',
          400: '#7b84ad',
          500: '#5c6494',
          600: '#5b4dff',
          700: '#4338ca',
          800: '#1a2040',
          900: '#0b1020',
        },
        ink: {
          700: '#1c2340',
          800: '#12182c',
          900: '#0b1020',
          950: '#07080d',
        },
        iris: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7c5cff',
          600: '#5b4dff',
        },
        ember: {
          400: '#fb923c',
          500: '#f97316',
        },
        gold: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sand: {
          50: '#f7f6f3',
          100: '#eeece6',
          200: '#ddd9cf',
          300: '#c4bfb2',
          400: '#a39d8e',
          500: '#877f6e',
        },
      },
      boxShadow: {
        soft: '0 8px 32px -12px rgba(91, 77, 255, 0.35)',
        card: '0 1px 2px rgba(11,16,32,0.04), 0 18px 40px -24px rgba(11,16,32,0.28)',
        glow: '0 0 80px rgba(124, 92, 255, 0.28)',
      },
      letterSpacing: {
        brand: '0.18em',
      },
    },
  },
  plugins: [],
};

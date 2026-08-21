/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Reem Kufi"', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#0b6e4f',
          700: '#065f46',
          800: '#064e3b',
          900: '#022c22',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#d4a017',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        sand: {
          50: '#faf7f2',
          100: '#f4ede0',
          200: '#e9dcc4',
          300: '#dcc6a3',
          400: '#c9aa7c',
          500: '#b8905e',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(11, 110, 79, 0.15)',
        card: '0 1px 3px rgba(0,0,0,0.04), 0 10px 30px -12px rgba(11, 110, 79, 0.18)',
      },
    },
  },
  plugins: [],
};

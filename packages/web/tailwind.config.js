/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cddacd',
          300: '#a8bfa8',
          400: '#7d9c7d',
          500: '#5c7f5c',
          600: '#476547',
          700: '#3a513a',
          800: '#314231',
          900: '#29372a',
          950: '#131d14',
        },
      },
    },
  },
  plugins: [],
};

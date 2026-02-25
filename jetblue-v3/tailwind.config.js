/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jb-navy': '#00205b',
        'jb-navy-dark': '#002855',
        'jb-blue': '#0033a0',
        'jb-royal': '#0033a0',
        'jb-light-blue': '#00B2E2',
        'jb-orange': '#F7941D',
        'jb-gray': '#f6f6f6',
        'jb-charcoal': '#000000',
        'jb-border': '#d3d3d3',
      },
      fontFamily: {
        'sans': ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

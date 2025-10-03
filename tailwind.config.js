/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'card-bg': '#211a28',
        'input-bg': '#2d2639',
        'accent': '#8a63d2',
        'placeholder': '#a89bb6',
        'border': '#4a415a',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
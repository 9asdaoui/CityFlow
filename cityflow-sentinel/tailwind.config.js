/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold-300': '#fff4a3',
        'gold-400': '#ffef75',
        'gold-500': '#FFE44B',
      }
    },
  },
  plugins: [],
}

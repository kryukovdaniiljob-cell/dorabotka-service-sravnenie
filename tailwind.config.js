/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Фирменная палитра Anthropic
        ink: '#141413',       // основной текст / тёмный фон
        paper: '#faf9f5',     // светлый фон
        sand: '#e8e6dc',      // тонкие подложки / границы
        stone: '#b0aea5',     // вторичные элементы
        accent: {
          DEFAULT: '#d97757', // оранжевый — основной акцент
          dark: '#c15f3f',    // ховер
        },
        blue: '#6a9bcc',      // вторичный акцент
        green: '#788c5d',     // третичный акцент
        // совместимость со старыми классами
        brand: {
          DEFAULT: '#d97757',
          dark: '#c15f3f',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Arial', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

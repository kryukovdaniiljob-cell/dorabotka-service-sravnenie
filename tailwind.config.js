/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Тёмная «редакционно-аналитическая» палитра (референс Oliver Wyman Forum).
        // База строго монохромная; цвет — только функциональный акцент.
        ink: '#eef1f5',         // основной текст (теперь светлый)
        shaft: '#0c0d10',       // шапка — чуть темнее страницы
        paper: '#101010',       // фон страницы (почти чёрный)
        surface: '#17181b',     // карточки / панели
        surface2: '#202227',    // инпуты / приподнятые блоки
        sand: '#2c2f36',        // тонкие границы / разделители
        stone: '#9aa0a6',       // вторичный текст
        accent: {
          DEFAULT: '#c8dc00',   // лайм — бренд-акцент / фокус / действия
          dark: '#aebf00',
        },
        // категорийные акценты данных
        blue: '#06c9f4',
        cyan: '#06c9f4',        // блок «Рекуператор» / характеристика установки
        orange: '#ff8902',      // блок «Нагреватель» / характеристика сети / предупреждения
        green: '#26cf73',       // наличие на складе / рабочая точка / «ОК»
        // совместимость со старыми классами
        brand: { DEFAULT: '#c8dc00', dark: '#aebf00' },
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
        body: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
        wordmark: ['Oswald', 'Arial Narrow', 'sans-serif'],
      },
      boxShadow: {
        // плоскость: глубину создаём тонкими линиями, а не тенями
        card: 'none',
      },
    },
  },
  plugins: [],
};

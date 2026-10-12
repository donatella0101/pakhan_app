/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        player: {
          d: '#22c55e',      // Салатовый / ярко-зелёный для Данила
          dGlow: 'rgba(34, 197, 94, 0.4)',
          m: '#38bdf8',      // Небесно-голубой для Друга
          mGlow: 'rgba(56, 189, 248, 0.4)',
        },
        dark: {
          950: '#090a0d',
          900: '#0f1115',
          800: '#17191e',
          700: '#23262d',
          600: '#2f333c'
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        dark: {
          900: '#0d0f12',
          800: '#151921',
          700: '#1f2533',
          600: '#2d3548'
        }
      }
    },
  },
  plugins: [],
}

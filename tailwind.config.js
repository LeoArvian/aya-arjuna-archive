/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Konfigurasi Dinamis menggunakan CSS Variables
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
          light: 'rgb(var(--primary-light) / <alpha-value>)',
        },
        dark: {
          bg: 'rgb(var(--bg-color) / <alpha-value>)', // Background ikut berubah
          surface: '#1A1A1A', 
          border: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
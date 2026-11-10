/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sonabel: {
          dark: '#0B2545',      // Official Dark Navy Blue
          header: '#002B49',    // Deep Header Blue
          accent: '#134074',    // Slate Blue accent
          gold: '#FDB813',      // Official SONABEL Yellow
          goldHover: '#E0A10B', // Darker yellow for hover
          red: '#E31B23',       // SONABEL Red spark
          green: '#00A859',     // SONABEL Green spark
          bg: '#EEF4F8',        // Clean Light background
          card: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}

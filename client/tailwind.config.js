/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel Pink & Purple palette
        'cream': '#FFF5F8',
        'cream-dark': '#FFE8EE',
        'elegant-black': '#2D2438',
        'elegant-gray': '#6B5B7A',
        'elegant-light': '#A89BB5',
        'lavender-soft': '#E8D5F0',
        'mint-soft': '#F0E6F5',
        'blush-soft': '#FFE0E8',
        // Pastel accents
        'pastel-pink': '#FFB6C1',
        'pastel-purple': '#D4A5E8',
        'pastel-lavender': '#E6E0FA',
        'pastel-rose': '#F8BBD9',
        // Legacy colors updated for pastel theme
        'primary-craft': '#9B6BB3',
        'secondary-craft': '#FFD6E0',
        'accent-craft': '#C9A8D8',
        'paper-white': '#FFF5F8',
        'ink-black': '#2D2438',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'subtle-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elegant palette
        'cream': '#f5f3ef',
        'cream-dark': '#ebe8e2',
        'elegant-black': '#1a1a1a',
        'elegant-gray': '#6b6b6b',
        'elegant-light': '#9a9a9a',
        'lavender-soft': '#e8e4f0',
        'mint-soft': '#d4e8e0',
        'blush-soft': '#f5e6e8',
        // Keep some legacy colors for compatibility
        'primary-craft': '#1a1a1a',
        'secondary-craft': '#e8e4f0',
        'accent-craft': '#d4e8e0',
        'paper-white': '#f5f3ef',
        'ink-black': '#1a1a1a',
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

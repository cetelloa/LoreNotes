/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-craft': '#FF6B9D',
        'secondary-craft': '#FEC180',
        'accent-craft': '#A8E6CF',
        'craft-purple': '#C9A0DC',
        'craft-blue': '#84C7D0',
        'paper-white': '#FFFEF7',
        'ink-black': '#2D3142',
        'craft-gray': '#BFC0C0',
        'wood-brown': '#A67B5B',
      },
      fontFamily: {
        heading: ['Fredoka', 'Comic Sans MS', 'cursive'],
        handwriting: ['Caveat', 'Dancing Script', 'cursive'],
        body: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
      }
    },
  },
  plugins: [],
}

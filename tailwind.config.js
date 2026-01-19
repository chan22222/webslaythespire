/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', '"DotGothic16"', 'monospace'],
      },
      colors: {
        // 게임 테마 색상
        'game-bg': '#1a1a2e',
        'game-panel': '#16213e',
        'game-accent': '#e94560',
        'game-gold': '#ffd700',
        'card-attack': '#ff6b6b',
        'card-skill': '#4ecdc4',
        'card-power': '#ffe66d',
        'hp-bar': '#e74c3c',
        'block-bar': '#3498db',
        'energy': '#f39c12',
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(233, 69, 96, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(233, 69, 96, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}

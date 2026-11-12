/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.{html,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cricket: {
          dark: '#080c16',
          card: '#0f172a',
          cardLight: '#1e293b',
          gold: '#f59e0b',
          goldLight: '#fbbf24',
          goldDark: '#b45309',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(245, 158, 11, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Impact', 'Teko', 'Cabinet Grotesk', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'gavel': 'gavelBang 0.5s ease-out forwards',
        'glow': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        gavelBang: {
          '0%': { transform: 'rotate(-45deg)' },
          '60%': { transform: 'rotate(15deg)' },
          '80%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        }
      }
    },
  },
  plugins: [],
}

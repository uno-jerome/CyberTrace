/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#020617', // slate-950
          card: 'rgba(15, 23, 42, 0.8)', // slate-900/80
          border: 'rgba(30, 41, 59, 0.8)', // slate-800/80
          accent: '#6366f1', // indigo-500
          glow: '#4f46e5', // indigo-600
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

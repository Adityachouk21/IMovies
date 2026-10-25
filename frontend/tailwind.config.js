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
        cinema: {
          950: '#07090e',
          900: '#0c1017',
          850: '#111722',
          800: '#172030',
          700: '#212c42',
          600: '#324263',
          red: '#e50914',
          'red-hover': '#f40612',
          accent: '#8b5cf6',
          gold: '#f59e0b',
          silver: '#94a3b8',
          success: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
}

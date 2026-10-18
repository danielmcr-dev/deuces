/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d1f',
          900: '#0a1630',
          800: '#10203f',
          700: '#182c52',
          600: '#233a66',
          500: '#3a5285',
        },
        ball: {
          DEFAULT: '#d4f53c',
          400: '#dcf765',
          500: '#d4f53c',
          600: '#b8d92a',
        },
        surface: {
          hard: '#3b82f6',
          clay: '#e2703a',
          grass: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

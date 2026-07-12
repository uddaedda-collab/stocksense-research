import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#3391ff',
          600: '#1c72f0',
          700: '#155bd1',
          800: '#174ca8',
          900: '#194284',
          950: '#122a54',
        },
        surface: {
          light: '#ffffff',
          dark: '#0b1220',
        },
        gain: '#16a34a',
        loss: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;

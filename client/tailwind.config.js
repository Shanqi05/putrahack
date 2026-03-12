/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#064E3B',  // Deep Emerald
          main: '#10B981',  // Primary Green
          accent: '#BEF264', // Lime Accent
        }
      },
      backgroundImage: {
        'nature-gradient': 'linear-gradient(135deg, #064E3B 0%, #065F46 45%, #10B981 100%)',
      },
      animation: {
        slideUp: 'slideUp 0.6s ease-out forwards',
        fadeIn: 'fadeIn 1s ease-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          'from': {
            opacity: '0',
          },
          'to': {
            opacity: '1',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(2deg)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.8)',
          },
        },
      },
    },
  },
  plugins: [],
}
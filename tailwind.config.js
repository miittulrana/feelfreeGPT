/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f7ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        },
        boxShadow: {
          'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
          'strong': '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-out',
          'slide-up': 'slideUp 0.4s ease-out',
          'bounce-delay': 'bounce 1s infinite ease-in-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        },
        backdropBlur: {
          'xs': '2px',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '112': '28rem',
          '128': '32rem',
        },
        maxHeight: {
          '112': '28rem',
          '128': '32rem',
        },
        minHeight: {
          '16': '4rem',
        },
        zIndex: {
          '60': '60',
          '70': '70',
        },
        transitionDuration: {
          '400': '400ms',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.25rem',
          '3xl': '1.5rem',
        },
      },
    },
    plugins: [
      function({ addBase, theme }) {
        addBase({
          'html': { fontSize: '16px' },
          'body': {
            backgroundColor: theme('colors.gray.50'),
            color: theme('colors.gray.900'),
          },
        });
      },
      function({ addUtilities, theme }) {
        const newUtilities = {
          '.text-shadow': {
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
          '.text-shadow-sm': {
            textShadow: '0 1px 2px rgba(0,0,0,0.05)',
          },
          '.shadow-card': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        };
        addUtilities(newUtilities);
      },
    ],
    variants: {
      extend: {
        opacity: ['disabled'],
        cursor: ['disabled'],
        backgroundColor: ['active', 'disabled'],
        transform: ['hover', 'focus'],
        scale: ['active', 'group-hover'],
        translate: ['group-hover'],
      },
    },
  }
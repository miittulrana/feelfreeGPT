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
          dark: '#1C1C1C',    // --primary-dark
          darker: '#141414',   // --primary-darker
        },
        accent: {
          orange: {
            DEFAULT: '#FFAE84',  // --accent-orange
            hover: '#FFB994',    // --accent-orange-hover
          },
          turquoise: '#A7D8DE',  // --accent-turquoise
        },
        text: {
          primary: '#CCCCCC',    // --text-primary
          secondary: '#888888',   // --text-secondary
          bright: '#FFFFFF',     // --text-bright
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',  // --border-color
        }
      },
      spacing: {
        xs: '4px',      // --space-xs
        sm: '8px',      // --space-sm
        md: '16px',     // --space-md
        lg: '24px',     // --space-lg
        xl: '32px',     // --space-xl
        '4.5': '1.125rem',  // 18px
        '22': '5.5rem',     // 88px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
      },
      borderRadius: {
        sm: '6px',       // --radius-sm
        md: '12px',      // --radius-md
        lg: '16px',      // --radius-lg
        full: '9999px',  // --radius-full
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.3)',     // --shadow-sm
        md: '0 4px 8px rgba(0, 0, 0, 0.4)',     // --shadow-md
        lg: '0 8px 16px rgba(0, 0, 0, 0.5)',    // --shadow-lg
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      height: {
        header: '64px',  // --header-height
      },
      maxWidth: {
        container: '1200px',    // --max-width
        chat: '880px',         // --chat-max-width
        '28': '7rem',          // 112px
        '32': '8rem',          // 128px
      },
      minHeight: {
        '4': '1rem',    // 16px
      },
      zIndex: {
        60: '60',
        70: '70',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
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
      transitionDuration: {
        400: '400ms',
      }
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        'html': {
          fontSize: '16px',
          fontSmoothing: 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        'body': {
          backgroundColor: '#1C1C1C',
          color: '#CCCCCC',
          minHeight: '100vh',
          lineHeight: '1.5',
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
      };
      addUtilities(newUtilities);
    },
    function({ addComponents, theme }) {
      addComponents({
        '.loading-spinner': {
          'width': '2rem',
          'height': '2rem',
          'border': '3px solid',
          'border-color': theme('colors.accent.orange.DEFAULT'),
          'border-top-color': 'transparent',
          'border-radius': '50%',
          'animation': 'spin 1s linear infinite',
        },
        '.auth-input': {
          'background-color': theme('colors.primary.dark'),
          'border': `1px solid ${theme('colors.border.DEFAULT')}`,
          'border-radius': theme('borderRadius.lg'),
          'padding': `${theme('spacing.md')} ${theme('spacing.lg')}`,
          'color': theme('colors.text.bright'),
          'width': '100%',
          'transition': 'all 0.2s ease',
          '&:focus': {
            'border-color': theme('colors.accent.orange.DEFAULT'),
            'box-shadow': `0 0 0 2px ${theme('colors.accent.orange.DEFAULT')}10`,
            'outline': 'none',
          },
        },
      });
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
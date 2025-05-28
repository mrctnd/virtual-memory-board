/*
 * DARK MODE UPDATE: Added toggleable dark mode support
 * - Enabled 'class' strategy for dark mode
 * - Extended color palette for dark mode compatibility
 * - Maintained all existing color tokens and design system
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {      colors: {
        primary: {
          DEFAULT: '#A594F9', // Main purple
          light: '#CDC1FF', // Lighter purple
          dark: '#8B7CF6', // Darker shade of main purple
        },
        accent: {
          DEFAULT: '#E5D9F2', // Light lavender
          light: '#F5EFFF', // Very light purple
          dark: '#CDC1FF', // Medium purple
        },
        background: {
          DEFAULT: '#FDFCFF', // Very light purple tint for light mode
          dark: '#1A0F2E', // Very dark purple for dark mode
        },
        surface: {
          DEFAULT: '#FFFFFF', // white for light mode
          dark: '#2D1B3D', // Dark purple for dark mode
        },
        text: {
          primary: '#3D2A5C', // Dark purple for text in light mode
          secondary: '#A594F9', // Main purple for secondary text in light mode
          muted: '#8E7CC3', // Muted purple in light mode
        },
        purple: {
          50: '#F5EFFF',
          100: '#E5D9F2',
          200: '#CDC1FF',
          300: '#B8A9FF',
          400: '#A594F9',
          500: '#8B7CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#2D1B3D',
          950: '#1A0F2E', // Even darker for backgrounds
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'zoom-in': 'zoomIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}
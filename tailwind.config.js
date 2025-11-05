/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#f6f2e8',
          100: '#ede6d7',
          150: '#e4dccb',
          200: '#dcd2bf'
        },
        cocoa: {
          600: '#3d362e',
          700: '#2f2b26',
          900: '#1f1b17'
        },
        taupe: {
          200: '#dad2c2',
          300: '#cfc2af',
          400: '#b8ab98',
          500: '#9c8f7f'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Nunito Sans', 'Segoe UI', 'Arial', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        tile: '0 6px 18px rgba(47, 43, 38, 0.08)'
      }
    }
  },
  plugins: []
}

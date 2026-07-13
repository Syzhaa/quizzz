/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          pink: '#D11D8B',
          blue: '#00C2FF',
          yellow: '#FFD600',
          teal: '#00BFA5',
          gray: '#F8FAFC',
        }
      }
    }
  },
  safelist: [
    'text-brand-pink',
    'text-brand-blue',
    'text-brand-yellow',
    'text-brand-teal'
  ],
  plugins: [],
}

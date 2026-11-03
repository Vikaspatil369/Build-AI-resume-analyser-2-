/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We will define a very professional premium SaaS dark-mode/light-mode hybrid color palette
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bce2fe',
          300: '#7cc8fd',
          400: '#35abfb',
          500: '#0c90eb',
          600: '#0071c8',
          700: '#015aa2',
          800: '#064d85',
          900: '#0b416e',
          950: '#072949',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      transitionProperty: {
        'all': 'all',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        slateMist: '#d9e2ec',
        dune: '#f6f1e8',
        coral: '#f97316',
        teal: '#0f766e',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(7, 17, 31, 0.18)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 1px 1px, rgba(15, 118, 110, 0.18) 1px, transparent 0)',
      },
      fontFamily: {
        display: ['"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        body: ['"Inter"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


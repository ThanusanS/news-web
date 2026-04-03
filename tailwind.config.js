/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#B5122B',
        accent2: '#F97316',
        navy: '#14324D',
      },
      fontFamily: {
        head: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: theme('colors.gray.700'),
            a: { color: theme('colors.accent') },
            h2: { fontFamily: 'Playfair Display, serif', fontWeight: '700' },
            h3: { fontFamily: 'Playfair Display, serif', fontWeight: '700' },
          },
        },
      }),
    },
  },
  plugins: [],
};

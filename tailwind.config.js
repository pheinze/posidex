/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './src/lib/components/**/*.svelte',
    './src/routes/**/*.svelte',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [],
}
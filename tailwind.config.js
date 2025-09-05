/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './src/lib/components/**/*.svelte',
    './src/routes/**/*.svelte',
  ],
  theme: {
    extend: {
      colors: {
        success: 'var(--success-color)',
        danger: 'var(--danger-color)',
        warning: 'var(--warning-color)',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
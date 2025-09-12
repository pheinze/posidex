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
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'accent': 'var(--accent-color)',
        'accent-hover': 'var(--accent-color-hover)',
        'success': 'var(--success-color)',
        'danger': 'var(--danger-color)',
        'warning': 'var(--warning-color)',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
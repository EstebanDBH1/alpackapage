/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAF9F5',
          surface: '#F0EAE1',
          text: '#1D1B18',
          accent: '#C96A3C',
          'accent-hover': '#AF5A30',
          'accent-light': '#F7EDE5',
          muted: '#8B7E74',
          border: '#E3DCD3',
          dark: '#1A1410',
          'dark-surface': '#221E1A',
          red: '#ED1C24',
          'red-hover': '#C8161D',
        },
        background: 'oklch(0.15 0.005 60 / <alpha-value>)',
        foreground: 'oklch(0.93 0.02 85 / <alpha-value>)',
        card: 'oklch(0.18 0.006 60 / <alpha-value>)',
        primary: 'oklch(0.86 0.09 90 / <alpha-value>)',
        'primary-foreground': 'oklch(0.15 0.005 60 / <alpha-value>)',
        secondary: 'oklch(0.22 0.008 60 / <alpha-value>)',
        muted: 'oklch(0.22 0.008 60 / <alpha-value>)',
        'muted-foreground': 'oklch(0.62 0.02 80 / <alpha-value>)',
        accent: 'oklch(0.72 0.16 40 / <alpha-value>)',
        border: 'oklch(0.28 0.008 60 / <alpha-value>)',
        input: 'oklch(0.28 0.008 60 / <alpha-value>)',
        ring: 'oklch(0.86 0.09 90 / <alpha-value>)',
      },
      fontFamily: {
        // Toda la app usa Geist Mono; /ebook define su propia tipografía
        // inline (Space Grotesk) y no pasa por estos alias.
        sans: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        display: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        space: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

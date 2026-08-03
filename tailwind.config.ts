// file: tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic, monochrome — driven by CSS variables in globals.css so
        // light/dark just swap variable values, no color logic in markup.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: 'hsl(var(--surface))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        border: 'hsl(var(--border))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem', // 72px
      },
      keyframes: {
        'drawer-in': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'drawer-out': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(100%)' } },
        'overlay-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'overlay-out': { from: { opacity: '1' }, to: { opacity: '0' } },
      },
      animation: {
        'drawer-in': 'drawer-in 180ms cubic-bezier(0.32, 0.72, 0, 1)',
        'drawer-out': 'drawer-out 150ms cubic-bezier(0.32, 0.72, 0, 1)',
        'overlay-in': 'overlay-in 150ms ease-out',
        'overlay-out': 'overlay-out 120ms ease-in',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
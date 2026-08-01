import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        bg: '#ffffff',
        fg: '#111111',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
};

export default config;

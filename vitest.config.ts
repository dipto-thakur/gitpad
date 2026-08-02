import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, 'test/server-only-noop.ts'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
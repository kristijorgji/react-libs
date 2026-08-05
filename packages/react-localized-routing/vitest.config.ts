import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['./tests/setup.ts'],
  },
});

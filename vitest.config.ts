import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    environment: 'node',
    globals: true,
    reporters: ['default'],
    // Silence noisy Prisma sourcemap warnings
    onConsoleLog(log) {
      if (log.includes('Failed to load source map')) return false;
    },
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      provider: 'v8',
      // Only measure our app code; exclude generated/runtime stuff
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/generated/**',
        'node_modules/**',
        '.next/**',
        'coverage/**',
        '**/*.test.*',
        'src/app/**',
      ],
    },
  },
});

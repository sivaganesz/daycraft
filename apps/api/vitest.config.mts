import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
  // NestJS needs decorator metadata, which Vitest's default compiler doesn't emit; SWC does.
  plugins: [swc.vite({ module: { type: 'es6' } })],
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // For GitHub Pages: use repo name as base path
  // For custom domain or other hosting: set base to '/'
  base: process.env.NODE_ENV === 'production' ? '/freesound-api-react-ts/' : '/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    server: {
      deps: {
        inline: [/^react-router/, /^react-router-dom/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      all: false,
      include: ['src/**/*.{ts,tsx}'],
    },
  },
})

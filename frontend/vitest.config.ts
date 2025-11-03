import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'], // optional but recommended
    deps: {
      inline: ['jsdom', 'parse5', 'nwsapi'], // 👈 fix ESM require issue
    },
  },
})

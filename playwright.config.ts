import { defineConfig } from '@playwright/test'

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL,
  },
  reporter: [['list']],
})

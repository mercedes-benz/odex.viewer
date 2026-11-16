// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry once on CI for diagnostics; do not retry locally. */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI, limit to 2 threads locally */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    contextOptions: { reducedMotion: 'reduce' },

    /* Collect trace when test fails. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'upload PDX',
      testMatch: /pdx\.upload\.ts/,
      teardown: 'cleanup PDX',
    },
    {
      name: 'cleanup PDX',
      testMatch: /pdx\.teardown\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['upload PDX'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['upload PDX'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['upload PDX'],
    },
  ],

  /* Build pages, create and serve static export before starting the tests */
  webServer: [
    {
      cwd: './../server',
      command:
        "node -e \"require('node:fs').mkdirSync('../viewer/test-results', { recursive: true })\" && python -u -m diag_server.openapi_server > ../viewer/test-results/backend.log 2>&1",
      url: 'http://localhost:8080/v1/diagnostic-data-sets',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build && npm run serve-static',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 120 * 1000,
    },
  ],
})

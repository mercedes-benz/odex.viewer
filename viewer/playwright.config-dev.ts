// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig, devices } from '@playwright/test'

import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,

  use: {
    ...baseConfig.use,
    trace: 'retain-on-first-failure',
  },

  /* Use only chromium for dev testing */
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
  ],

  /* Run dev server before starting the tests */
  webServer: [
    {
      cwd: './../server',
      command: 'python -m diag_server.openapi_server',
      url: 'http://localhost:8080',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
    },
  ],
})

// SPDX-License-Identifier: AGPL-3.0-only
/* eslint-disable no-console */

import { test as teardown, expect } from '@playwright/test'

teardown('clean PDX data', async ({ page }) => {
  await page.goto('/')

  // Delete PDX from server by clearing the diagnostic data sets list
  await expect(
    page.getByRole('button', { name: 'Clear all loaded data sets' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear all loaded data sets' }).click()

  // Check that diagnostic data sets table is empty
  await expect(
    page.getByRole('gridcell', { name: 'No loaded diagnostic data sets found' })
  ).toBeVisible()
})

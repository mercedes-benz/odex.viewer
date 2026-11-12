// SPDX-License-Identifier: AGPL-3.0-only

import { test as teardown, expect } from '@playwright/test'

teardown('clean PDX data', async ({ page }) => {
  await page.goto('/')
  await expect(
    page
      .getByRole('grid', { name: 'Loaded diagnostic data sets table' })
      .getByRole('link', { name: 'somersault.pdx', exact: true })
  ).toBeVisible()

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

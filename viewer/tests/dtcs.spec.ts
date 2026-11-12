// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check DTCs page - view all diagnostic trouble codes', async ({
  page,
}) => {
  await page.goto('/dtcs')

  // Check the headline
  await expect(
    page.getByText('List of all Diagnostic Trouble Codes of all loaded ODX-Ds')
  ).toBeVisible()

  // Wait for data to load by waiting for the overview table to contain rows
  const dtcTable = page.getByLabel('Diagnostic trouble code table')

  await expect(dtcTable).toBeVisible()
  await expect(dtcTable.getByRole('row').nth(1)).toBeVisible()
  // Check that the table contains the expected number of rows (1 header row + 2 data rows)
  await expect(dtcTable.getByRole('row')).toHaveCount(3)
})

test('Check DTCs page - view specific diagnostic trouble code', async ({
  page,
}) => {
  await page.goto('/dtcs')

  // Wait for data to load
  const dtcTable = page.getByLabel('Diagnostic trouble code table')

  await expect(dtcTable).toBeVisible()

  // Get the first DTC link in the table body and click it
  const firstDtcLink = dtcTable.getByRole('link').first()

  await expect(firstDtcLink).toBeVisible()
  await firstDtcLink.click()

  // Check the main title
  await expect(
    page.getByRole('heading', { name: 'Diagnostic Trouble Code' })
  ).toBeVisible()

  // Check the Metadata section subtitle is visible
  await expect(page.getByText('Metadata')).toBeVisible()

  // Check the metadata table is visible
  await expect(
    page.getByLabel('Diagnostic Trouble Code metadata table')
  ).toBeVisible()
})

test('Check DTCs page - column selection', async ({ page }) => {
  await page.goto('/dtcs')

  const dtcTable = page.getByLabel('Diagnostic trouble code table')

  await expect(dtcTable).toBeVisible()

  await page.getByTestId('dtcs-columns-dropdown-button').click()

  await expect(
    page.getByTestId('dtcs-columns-dropdown-entry').first()
  ).toBeVisible()
  // The overview table has 14 total columns
  await expect(page.getByTestId('dtcs-columns-dropdown-entry')).toHaveCount(14)
})

test('Check DTCs page - LEVEL filter', async ({ page }) => {
  await page.goto('/dtcs')

  const dtcTable = page.getByLabel('Diagnostic trouble code table')

  await expect(dtcTable).toBeVisible()

  // LEVEL column is in the default visible set
  await page.getByTestId('filter-LEVEL-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-LEVEL-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "7" value in the dropdown (matches 1 of 2 items)
  await page.getByTestId('filter-LEVEL-menu-entry-7').click()

  await expect(
    page.getByText('1 of total 2 diagnostic trouble codes')
  ).toBeVisible()
})

test('Check DTCs page - row count text is visible', async ({ page }) => {
  await page.goto('/dtcs')

  const dtcTable = page.getByLabel('Diagnostic trouble code table')

  await expect(dtcTable).toBeVisible()

  await expect(
    page.getByText('2 of total 2 diagnostic trouble codes')
  ).toBeVisible()
})

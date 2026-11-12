// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check state charts page - view all state charts', async ({ page }) => {
  await page.goto('/state-charts')

  // Check the main title (exact match to avoid collision with h2 subtitle)
  await expect(
    page.getByRole('heading', { name: 'State Charts', exact: true }).first()
  ).toBeVisible()

  // Check the subtitle
  await expect(
    page.getByText('List of all State Charts of all loaded ODX-Ds')
  ).toBeVisible()

  // Wait for data to load by waiting for the state chart table to appear
  const stateChartTable = page.getByLabel('State chart table')

  await expect(stateChartTable).toBeVisible()

  // Check that at least one state chart entry is visible
  await expect(stateChartTable.getByRole('row').nth(1)).toBeVisible()
  // Check that the table contains the expected number of rows (1 header row + 2 data rows)
  await expect(stateChartTable.getByRole('row')).toHaveCount(3)
})

test('Check state charts page - view specific state chart', async ({
  page,
}) => {
  await page.goto('/state-charts')

  // Wait for data to load
  const stateChartTable = page.getByLabel('State chart table')

  await expect(stateChartTable).toBeVisible()

  // Navigate to a specific state chart by clicking the first link in the table
  const firstStateChartLink = stateChartTable.getByRole('link').first()

  await expect(firstStateChartLink).toBeVisible()
  await firstStateChartLink.click()

  // Check the main title h1 (exact: true + h1 to avoid collision with accordion heading)
  await expect(
    page.locator('h1').filter({ hasText: 'State Chart' })
  ).toBeVisible()

  // Check that the State Chart accordion section is visible
  await expect(page.getByRole('button', { name: 'State Chart' })).toBeVisible()

  // Check that the Metadata accordion section is visible
  await expect(page.getByRole('button', { name: 'Metadata' })).toBeVisible()

  // Check that the States accordion section is visible
  await expect(
    page.getByRole('button', { name: 'States', exact: true })
  ).toBeVisible()

  // Check that the States Transitions accordion section is visible
  await expect(
    page.getByRole('button', { name: 'States Transitions' })
  ).toBeVisible()
})

test('Check state charts page - CONTAINER filter', async ({ page }) => {
  await page.goto('/state-charts')

  const stateChartTable = page.getByLabel('State chart table')

  await expect(stateChartTable).toBeVisible()

  await page.getByTestId('filter-CONTAINER-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-CONTAINER-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "somersault.pdx" value in the dropdown (matches 2 of 2 items)
  await page.getByTestId('filter-CONTAINER-menu-entry-somersault.pdx').click()
  await expect(
    page.getByTestId('filter-CONTAINER-menu-entry-somersault.pdx')
  ).toHaveAttribute('aria-checked', 'true')

  // Check that the table contains the expected number of rows (1 header row + 2 data rows)
  await expect(stateChartTable.getByRole('row')).toHaveCount(3)
})

test('Check state charts page - USED_IN_VARIANTS filter', async ({ page }) => {
  await page.goto('/state-charts')

  const stateChartTable = page.getByLabel('State chart table')

  await expect(stateChartTable).toBeVisible()

  await page.getByTestId('filter-USED_IN_VARIANTS-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-USED_IN_VARIANTS-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "somersault_lazy" value in the dropdown (matches 2 of 2 items)
  await page
    .getByTestId('filter-USED_IN_VARIANTS-menu-entry-somersault_lazy')
    .click()
  await expect(
    page.getByTestId('filter-USED_IN_VARIANTS-menu-entry-somersault_lazy')
  ).toHaveAttribute('aria-checked', 'true')

  // Check that the table contains the expected number of rows (1 header row + 2 data rows)
  await expect(stateChartTable.getByRole('row')).toHaveCount(3)
})

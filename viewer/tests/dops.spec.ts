// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check DOPs page - view all data object properties', async ({ page }) => {
  await page.goto('/dops')

  // Check the headline
  await expect(
    page.getByText('List of all Data Object Properties of all loaded ODX-Ds')
  ).toBeVisible()

  // Wait for data to load by waiting for the overview table to contain rows
  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()
  await expect(dopTable.getByRole('row').nth(1)).toBeVisible()
  expect(await dopTable.getByRole('row').all()).toHaveLength(27)
})

test('Check DOPs page - view specific data object property', async ({
  page,
}) => {
  await page.goto('/dops')

  // Wait for data to load
  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()

  // Get the first DOP link in the table body and click it
  const firstDopLink = dopTable.getByRole('link').first()

  await expect(firstDopLink).toBeVisible()
  await firstDopLink.click()

  // Check the main title
  await expect(
    page.getByRole('heading', { name: 'Data Object Property' })
  ).toBeVisible()

  // Check the Metadata section subtitle is visible
  await expect(page.getByText('Metadata')).toBeVisible()
})

test('Check DOPs page - column selection', async ({ page }) => {
  await page.goto('/dops')

  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()

  await page.getByTestId('dops-columns-dropdown-button').click()

  await expect(
    page.getByTestId('dops-columns-dropdown-entry').first()
  ).toBeVisible()
  // The overview table has 32 total columns which can be toggled on/off in the column selection dropdown
  expect(
    await page.getByTestId('dops-columns-dropdown-entry').all()
  ).toHaveLength(32)
})

test('Check DOPs page - TYPE filter', async ({ page }) => {
  await page.goto('/dops')

  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()

  // TYPE column (class_name key) is in the default visible set
  await page.getByTestId('filter-TYPE-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-TYPE-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "Structure" value in the dropdown (matches 3 of 26 items)
  await page
    .getByTestId('filter-TYPE-menu-entry-Structure')
    .click({ force: true })

  await expect(
    page.getByText('3 of total 26 data object properties')
  ).toBeVisible()
})

test('Check DOPs page - row count text is visible', async ({ page }) => {
  await page.goto('/dops')

  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()

  await expect(
    page.getByText('26 of total 26 data object properties')
  ).toBeVisible()
})

test('Check DOPs page - COMPU METHOD filter', async ({ page }) => {
  await page.goto('/dops')

  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()

  // COMPU METHOD column (compu_method key) is in the default visible set
  await page.getByTestId('filter-COMPU METHOD-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-COMPU METHOD-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "TEXTTABLE" value in the dropdown (matches 2 of 26 items)
  await page
    .getByTestId('filter-COMPU METHOD-menu-entry-TEXTTABLE')
    .click({ force: true })

  await expect(
    page.getByText('2 of total 26 data object properties')
  ).toBeVisible()
})

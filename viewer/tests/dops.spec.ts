// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check DtcDop page - searchable DTC details in Compact Summary', async ({
  page,
}) => {
  await page.goto('/dops')
  await page.getByRole('link', { name: 'dtc_dop_all', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'Data Object Property', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'dtc_dop_all', exact: true })
  ).toBeVisible()

  const details = page.getByRole('region', { name: 'DTC details', exact: true })
  const table = details.getByLabel('DTC details table', { exact: true })
  const search = details.getByRole('textbox', { name: 'Search DTC details' })

  await expect(table).toBeVisible()
  await expect(table.getByRole('columnheader')).toHaveText([
    'TROUBLE CODE',
    'DISPLAY CODE',
    'SHORT NAME',
    'LONG NAME',
    'TEXT',
    'DESCRIPTION',
    'LEVEL',
    'TEMPORARY',
  ])
  await expect(table.getByRole('row')).toHaveCount(3)
  await expect(table.getByText('4097 [0x1001]')).toBeVisible()
  await expect(table.getByText('4098 [0x1002]')).toBeVisible()
  await expect(
    page
      .getByText('Compact Summary', { exact: true })
      .locator('..')
      .locator('section')
      .first()
  ).toHaveAttribute('aria-label', 'DTC details')
  await expect(
    details.locator('..').getByText('CompuMethod Category:', { exact: true })
  ).toBeVisible()

  await search.fill('p1001')
  await expect(table.getByRole('row')).toHaveCount(2)
  await expect(table.getByText('DTC_1001', { exact: true })).toBeVisible()
  await expect(table.getByText('DTC_1002', { exact: true })).toHaveCount(0)
  await search.fill('energy level')
  await expect(table.getByText('B1002', { exact: true })).toBeVisible()
  await search.fill('0x1001')
  await expect(table.getByText('P1001', { exact: true })).toBeVisible()
  await search.fill('7')
  await expect(table.getByText('B1002', { exact: true })).toBeVisible()
  await search.fill('no matching DTC')
  await expect(table.getByText('No DTCs found')).toBeVisible()
  await search.fill('')
  await expect(table.getByRole('row')).toHaveCount(3)
})

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
  expect(await dopTable.getByRole('row').all()).toHaveLength(37)
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

test('Check complex DOP details - compact structure summary', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 720 })
  await page.goto('/dops')

  const dopLink = page.getByRole('link', {
    name: 'DTCAndStatusRecords',
    exact: true,
  })

  await expect(dopLink).toBeVisible()
  await dopLink.click()

  const summary = page.getByRole('region', {
    name: 'DOP structure summary',
  })

  await expect(summary).toBeVisible()
  await expect(summary).toContainText('Structure hierarchy')
  await expect(summary).toContainText('DTCRecord')

  const dtcTable = summary.getByRole('table', { name: /DTCs in/ })

  await expect(dtcTable).toBeVisible()
  const tableFits = await dtcTable.evaluate(
    (table) => table.scrollWidth <= table.clientWidth + 1
  )

  expect(tableFits).toBe(true)

  const layout = await summary.evaluate((element) => ({
    textAlign: getComputedStyle(element).textAlign,
    hasHorizontalOverflow: Array.from(element.querySelectorAll('*')).some(
      (child) => child.scrollWidth > child.clientWidth + 1
    ),
  }))

  expect(layout.textAlign).toBe('left')
  expect(layout.hasHorizontalOverflow).toBe(false)
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

  // Select the "Structure" value in the dropdown (matches 4 of 36 items)
  await page
    .getByTestId('filter-TYPE-menu-entry-Structure')
    .click({ force: true })

  await expect(
    page.getByText('4 of total 36 data object properties')
  ).toBeVisible()
})

test('Check DOPs page - row count text is visible', async ({ page }) => {
  await page.goto('/dops')

  const dopTable = page.getByLabel('Data object property table')

  await expect(dopTable).toBeVisible()

  await expect(
    page.getByText('36 of total 36 data object properties')
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

  // Select the "TEXTTABLE" value in the dropdown (matches 10 of 36 items)
  await page
    .getByTestId('filter-COMPU METHOD-menu-entry-TEXTTABLE')
    .click({ force: true })

  await expect(
    page.getByText('10 of total 36 data object properties')
  ).toBeVisible()
})

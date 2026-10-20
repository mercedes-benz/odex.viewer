// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check diagnostic variant page - view all diagnostic variants', async ({
  page,
}) => {
  await page.goto('/diagnostic-variant')

  // Check the headline
  await expect(
    page.getByText('List of all Diagnostic Variants of all loaded ODX-Ds')
  ).toBeVisible()

  // Check that the variants table is visible with expected variants
  await expect(
    page.getByRole('link', { name: 'somersault_base_variant' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'somersault_lazy' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'somersault_assiduous' })
  ).toBeVisible()
})

test('Check diagnostic variant page - view specific diagnostic variant', async ({
  page,
}) => {
  await page.goto('/diagnostic-variant')

  // Navigate to a specific variant by clicking its link
  await page.getByRole('link', { name: 'somersault_base_variant' }).click()

  // Check the main title
  await expect(
    page.getByRole('heading', { name: 'Diagnostic Variant' })
  ).toBeVisible()

  // Check the variant short name heading
  await expect(
    page.getByRole('heading', { name: 'somersault_base_variant' })
  ).toBeVisible()

  // Check the Metadata section subtitle
  await expect(page.getByText('Metadata')).toBeVisible()

  // Check that the accordion with Diagnostic Communications is visible
  await expect(
    page.getByRole('button', { name: 'Diagnostic Communications' })
  ).toBeVisible()

  // Check that the accordion with Diagnostic Trouble Codes is visible
  await expect(
    page.getByRole('button', { name: 'Diagnostic Trouble Codes' })
  ).toBeVisible()

  // Check that the accordion with Data Object Properties is visible
  await expect(
    page.getByRole('button', { name: 'Data Object Properties' })
  ).toBeVisible()

  // Check that the accordion with State Charts is visible
  await expect(page.getByRole('button', { name: 'State Charts' })).toBeVisible()
})

test('Check diagnostic variant page - column selection on overview table', async ({
  page,
}) => {
  await page.goto('/diagnostic-variant')

  const variantsTable = page.getByLabel('Diagnostic variants table')

  await expect(variantsTable).toBeVisible()

  await page.getByTestId('diagVariants-columns-dropdown-button').click()

  // The overview table has 7 total columns
  expect(
    await page.getByTestId('diagVariants-columns-dropdown-entry').all()
  ).toHaveLength(7)
})

test('Check diagnostic variant page - SHORT NAME filter on variants sub-table', async ({
  page,
}) => {
  // DiagnosticVariantsComponent (with SHORT NAME filter) is rendered on the odx-d detail page
  await page.goto('/odx-d?objectId=c91929c68418ac5db8f9534234e0fc1b')

  const variantsTable = page.getByLabel('Diagnostic variants table')

  await expect(variantsTable).toBeVisible()

  await page.getByTestId('filter-SHORT NAME-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-SHORT NAME-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "somersault_base_variant" value in the dropdown (matches 1 of 3 items)
  await page
    .getByTestId('filter-SHORT NAME-menu-entry-somersault_base_variant')
    .click({ force: true })

  // Check that the table contains the expected number of rows (1 header row + 1 data rows)
  expect(await variantsTable.getByRole('row').all()).toHaveLength(2)
})

test('Check diagnostic variant page - column selection on diag comms sub-table', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-variant?objectId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // The Diagnostic Communications accordion is expanded by default
  // Wait for the column dropdown button to appear (data loads async)
  await expect(
    page.getByTestId('diagComms-columns-dropdown-button')
  ).toBeVisible()

  await page.getByTestId('diagComms-columns-dropdown-button').click()

  await expect(
    page.getByTestId('diagComms-columns-dropdown-entry').first()
  ).toBeVisible()
})

test('Check diagnostic variant page - column selection on DTCs sub-table', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-variant?objectId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Expand the Diagnostic Trouble Codes accordion
  await page.getByRole('button', { name: 'Diagnostic Trouble Codes' }).click()

  const dtcsTable = page.getByLabel('Diagnostic trouble codes table')

  await expect(dtcsTable).toBeVisible()

  await page.getByTestId('dtcs-columns-dropdown-button').click()

  await expect(
    page.getByTestId('dtcs-columns-dropdown-entry').first()
  ).toBeVisible()
})

test('Check diagnostic variant page - column selection on DOPs sub-table', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-variant?objectId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Expand the Data Object Properties accordion
  await page.getByRole('button', { name: 'Data Object Properties' }).click()

  const dopsTable = page.getByLabel('Data object property table')

  await expect(dopsTable).toBeVisible()

  await page.getByTestId('dops-columns-dropdown-button').click()

  await expect(
    page.getByTestId('dops-columns-dropdown-entry').first()
  ).toBeVisible()
})

test('Check diagnostic variant page - COMM_TYPE filter on diag comms sub-table', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-variant?objectId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // The Diagnostic Communications accordion is expanded by default
  await expect(
    page.getByTestId('diagComms-columns-dropdown-button')
  ).toBeVisible()

  await page.getByTestId('filter-COMM_TYPE-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-COMM_TYPE-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "DiagService" value in the dropdown (matches 8 of 10 items)
  await expect(
    page.getByTestId('filter-COMM_TYPE-menu-entry-DiagService')
  ).toBeVisible()
  await page
    .getByTestId('filter-COMM_TYPE-menu-entry-DiagService')
    .click({ force: true })

  await expect(page.getByText('9 of total 10 diagnostic')).toBeVisible()
})

test('Check diagnostic variant page - LEVEL filter on DTCs sub-table', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-variant?objectId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Expand the Diagnostic Trouble Codes accordion (starts closed)
  await page.getByRole('button', { name: 'Diagnostic Trouble Codes' }).click()

  const dtcsTable = page.getByLabel('Diagnostic trouble codes table')

  await expect(dtcsTable).toBeVisible()

  await page.getByTestId('filter-LEVEL-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-LEVEL-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select level "2" value in the dropdown (matches 1 of 2 items)
  await page.getByTestId('filter-LEVEL-menu-entry-2').click({ force: true })

  await expect(page.getByText('1 of total 2 diagnostic')).toBeVisible()
})

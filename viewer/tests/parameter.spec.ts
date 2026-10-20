// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('DtcDop selection and preview', async ({ page }) => {
  await page.goto(
    '/diagnostic-comm?objectId=5b4d00a8d1ba6f53b3a47231600cb2f6&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-container-name')).toHaveText(
    'ReportDTCByStatusMask'
  )

  const positiveResponse = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })

  await positiveResponse
    .getByRole('button', { name: /^DTCAndStatusRecords EndOfPduField/ })
    .click()
  await positiveResponse.getByRole('button', { name: 'Add item' }).click()
  await positiveResponse
    .getByRole('button', { name: /^\[0\] DTCAndStatusRecord Structure/ })
    .click()

  const select = positiveResponse.getByRole('combobox', {
    name: 'DTC for dtc_dop_all',
  })

  await expect(select.getByRole('option')).toHaveText([
    'Select DTC',
    'P1001 - Motor malfunction.',
    'B1002 - Energy level dropped below minimum.',
  ])
  await select.selectOption('4097')
  await expect(select).toHaveValue('4097')
  await select.selectOption('4098')
  await expect(select).toHaveValue('4098')

  const search = positiveResponse.getByPlaceholder(
    'Search in visible columns...'
  )

  await search.fill('no matching parameter')
  await expect(select).toHaveCount(0)
  await search.fill('')
  await expect(select).toHaveValue('4098')

  await positiveResponse
    .getByRole('link', { name: 'DTCAndStatusRecords', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Data Object Property', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'DTCAndStatusRecords', exact: true })
  ).toBeVisible()
  await page
    .getByRole('link', { name: 'DTCAndStatusRecord', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'DTCAndStatusRecord', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'dtc_dop_all', exact: true })
    .locator('svg')
    .click()

  const dialog = page.getByRole('dialog')
  const preview = dialog.getByRole('table', { name: 'DTCs in dtc_dop_all' })

  await expect(preview).toBeVisible()
  await expect(preview.getByRole('row')).toHaveCount(3)
  await expect(preview.getByText('4097 [0x1001]')).toBeVisible()
  await expect(preview.getByText('4098 [0x1002]')).toBeVisible()
  await expect(preview.getByText('P1001', { exact: true })).toBeVisible()
  await expect(preview.getByText('B1002', { exact: true })).toBeVisible()
  await expect(preview.getByText('DTC_1001', { exact: true })).toBeVisible()
  await expect(preview.getByText('DTC_1002', { exact: true })).toBeVisible()
  await expect(preview.getByText('Motor malfunction.')).toBeVisible()
})

test('Accordion search accepts typing on the first click', async ({ page }) => {
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  const search = page.getByPlaceholder('Search in visible columns...').first()

  await search.click()
  await page.keyboard.type('id')
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('id')

  const metadata = page.getByRole('button', { name: 'Metadata', exact: true })

  await expect(metadata).toHaveAttribute('aria-expanded', 'true')
  await metadata.click()
  await expect(metadata).toHaveAttribute('aria-expanded', 'false')
  await metadata.click()
  await expect(metadata).toHaveAttribute('aria-expanded', 'true')
})

test('Check parameter page - navigate from diagnostic communication', async ({
  page,
}) => {
  // Navigate to a specific diagnostic communication with a known request/response - session_start from the somersault ODX-D
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Verify we are on the diagnostic comm detail page
  await expect(page.getByTestId('diag-comm-title')).toBeVisible()

  // The Request accordion should be expanded by default - look for a parameter link inside it
  await expect(page.getByRole('button', { name: 'Request' })).toBeVisible()

  // Click the "id" parameter link in the page
  const paramLink = page.getByRole('link', { name: 'id' }).first()

  await expect(paramLink).toBeVisible()
  await paramLink.click()

  // Check the main title on the parameter page
  await expect(page.getByRole('heading', { name: 'Parameter' })).toBeVisible()

  // Check that the parameter short name heading is visible
  await expect(page.getByRole('heading', { name: 'id' })).toBeVisible()

  // Check that the parameter details table is visible
  await expect(page.getByTestId('parameter-details-table')).toBeVisible()
})

test('Check parameter page - column selection on parameters table', async ({
  page,
}) => {
  // Load DiagService page for "session_start" from the somersault ODX-D
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-title')).toBeVisible()

  // Wait for the column dropdown button to appear (parameters table loads async)
  await expect(
    page.getByTestId('parameters-columns-dropdown-button').first()
  ).toBeVisible()

  await page.getByTestId('parameters-columns-dropdown-button').first().click()

  await expect(
    page.getByTestId('parameters-columns-dropdown-entry').first()
  ).toBeVisible()
  // The parameters table has 24 total columns
  expect(
    await page.getByTestId('parameters-columns-dropdown-entry').all()
  ).toHaveLength(24)
})

test('Check parameter page - TYPE filter', async ({ page }) => {
  // Load DiagService page for "session_start" from the somersault ODX-D
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-title')).toBeVisible()

  // Wait for the parameters table to load (Request accordion open by default)
  await expect(page.getByTestId('filter-TYPE-button').first()).toBeVisible()

  await page.getByTestId('filter-TYPE-button').first().click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-TYPE-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "ValueParameter" value in the dropdown (matches 1 of 3 items)
  await expect(
    page.getByTestId('filter-TYPE-menu-entry-ValueParameter')
  ).toBeVisible()
  await page
    .getByTestId('filter-TYPE-menu-entry-ValueParameter')
    .click({ force: true })

  await expect(page.getByText('1 of total 3 parameters')).toBeVisible()
})

test('Check parameter page - SEMANTIC filter', async ({ page }) => {
  // Load DiagService page for "session_start" from the somersault ODX-D
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-title')).toBeVisible()

  // Wait for the parameters table to load (Request accordion open by default)
  await expect(page.getByTestId('filter-SEMANTIC-button').first()).toBeVisible()

  await page.getByTestId('filter-SEMANTIC-button').first().click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-SEMANTIC-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "SERVICE-ID" value in the dropdown (matches 1 of 3 items)
  await expect(
    page.getByTestId('filter-SEMANTIC-menu-entry-SERVICE-ID')
  ).toBeVisible()
  await page
    .getByTestId('filter-SEMANTIC-menu-entry-SERVICE-ID')
    .click({ force: true })

  await expect(page.getByText('1 of total 3 parameters')).toBeVisible()
})

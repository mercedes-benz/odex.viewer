// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

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

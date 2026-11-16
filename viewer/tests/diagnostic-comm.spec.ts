// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check diagnostic communication page - view all diagnostic communications', async ({
  page,
}) => {
  await page.goto('/diagnostic-comm')

  // Check the headline and the total number of diagnostic communications
  await expect(
    page.getByText('List of all Diagnostic Communications of all loaded ODX-Ds')
  ).toBeVisible()
  await expect(page.getByText('11 of total 11 diagnostic')).toBeVisible()

  // Check that the table is visible
  await expect(page.getByTestId('diag-comm-table')).toBeVisible()
})

test('Check diagnostic communication page - view specific diagnostic communication', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Check the title and container name
  await expect(page.getByTestId('diag-comm-title')).toBeVisible()
  await expect(page.getByTestId('diag-comm-title')).toHaveText(
    'Diagnostic Communication'
  )

  await expect(page.getByTestId('diag-comm-container-name')).toHaveText(
    'session_start',
    { timeout: 10000 }
  )

  // Check that the accordion is visible
  await expect(page.getByTestId('diag-comm-accordion')).toBeVisible()

  // Check that the metadata table within the accordion is visible
  await expect(page.getByTestId('diag-comm-metadata-table')).toBeVisible()
})

test('Check diagnostic communication page - column selection', async ({
  page,
}) => {
  await page.goto('/diagnostic-comm')

  await expect(page.getByTestId('diag-comm-table')).toBeVisible()

  await page.getByTestId('diagComms-columns-dropdown-button').click()

  await expect(
    page.getByTestId('diagComms-columns-dropdown-entry').first()
  ).toBeVisible()
  // The overview table has 13 total columns which can be toggled on/off in the column selection dropdown
  await expect(
    page.getByTestId('diagComms-columns-dropdown-entry')
  ).toHaveCount(13)
})

test('Check diagnostic communication page - COMM_TYPE filter', async ({
  page,
}) => {
  await page.goto('/diagnostic-comm')

  await expect(page.getByTestId('diag-comm-table')).toBeVisible()

  // COMM_TYPE column is in the default visible set
  await page.getByTestId('filter-COMM_TYPE-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-COMM_TYPE-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "DiagService" value in the dropdown (matches 10 of 11 items)
  await page.getByTestId('filter-COMM_TYPE-menu-entry-DiagService').click()

  await expect(page.getByText('10 of total 11 diagnostic')).toBeVisible()
})

test('Check diagnostic communication page - SEMANTIC filter', async ({
  page,
}) => {
  await page.goto('/diagnostic-comm')

  await expect(page.getByTestId('diag-comm-table')).toBeVisible()

  // SEMANTIC column is in the default visible set
  await page.getByTestId('filter-SEMANTIC-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-SEMANTIC-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "session" value in the dropdown (matches session_start and session_stop, so 2 of 11 items)
  await page.getByTestId('filter-SEMANTIC-menu-entry-SESSION').click()

  await expect(page.getByText('2 of total 11 diagnostic')).toBeVisible()
})

test('Check diagnostic communication page - search filters row count', async ({
  page,
}) => {
  await page.goto('/diagnostic-comm')

  await expect(page.getByTestId('diag-comm-table')).toBeVisible()
  await expect(page.getByText('11 of total 11 diagnostic')).toBeVisible()

  // "session" matches session_start and session_stop only (2 of 11 items)
  await page.getByPlaceholder('Search in visible columns...').fill('session')

  await expect(page.getByText('2 of total 11 diagnostic')).toBeVisible()
})

test('Check diagnostic communication page - Request accordion open by default', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-title')).toBeVisible()

  // Request accordion is open by default (key 'request' in defaultSelectedKeys)
  await expect(page.getByRole('button', { name: 'Request' })).toBeVisible()

  // At least one parameter link is visible inside the Request section
  await expect(page.getByRole('link', { name: 'id' }).first()).toBeVisible()
})

test('Check diagnostic communication page - Positive Responses accordion open by default', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=b81ea7fe576a2e4c37b402952fd4eea9&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-title')).toBeVisible()

  // Positive Responses accordion is open by default (key 'posResponses' in defaultSelectedKeys)
  await expect(
    page.getByRole('button', { name: 'Positive Responses' })
  ).toBeVisible()
})

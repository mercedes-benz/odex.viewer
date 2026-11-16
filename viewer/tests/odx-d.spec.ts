// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check ODX-D page and navigatation to revision history page', async ({
  page,
}) => {
  await page.goto('/odx-d')

  // Check the main title
  await expect(page.getByTestId('odx-d-title')).toBeVisible()
  await expect(page.getByTestId('odx-d-title')).toHaveText('ODX-D')

  // Check the subtitle
  await expect(page.getByTestId('odx-databases-subtitle')).toBeVisible()
  await expect(page.getByTestId('odx-databases-subtitle')).toHaveText(
    'Overview of loaded Diagnostic Layer Containers'
  )

  // Select objectId query parameter and reload the page for a specific object
  await page.getByRole('link', { name: 'Show ODX-D' }).first().click()

  // Check the main title
  await expect(page.getByTestId('odx-d-title')).toBeVisible()
  await expect(page.getByTestId('odx-d-title')).toHaveText('ODX-D')

  // Check the short name heading
  await expect(page.getByTestId('odx-d-shortname')).toBeVisible()
  await expect(page.getByTestId('odx-d-shortname')).toHaveText('somersault')

  // Check the Metadata section
  await expect(page.getByTestId('odx-d-metadata')).toBeVisible()
  await expect(page.getByTestId('odx-d-metadata')).toHaveText('Metadata')

  await expect(page.getByTestId('odx-d-revision-history-link')).toBeVisible()
  await page.getByTestId('odx-d-revision-history-link').click()

  // Check the Revision History
  await expect(page.getByTestId('revision-history-title')).toBeVisible()
  await expect(page.getByTestId('revision-history-title')).toHaveText(
    'Revision History'
  )

  // Check the Metadata section
  await expect(
    page.getByTestId('revision-history-metadata-subtitle')
  ).toBeVisible()
  await expect(
    page.getByTestId('revision-history-metadata-subtitle')
  ).toHaveText('Metadata')

  // Check the Revisions section
  await expect(page.getByTestId('revisions-subtitle')).toBeVisible()
  await expect(page.getByTestId('revisions-subtitle')).toHaveText('Revisions')
  await expect(page.getByTestId('revisions-row')).toHaveCount(3)

  await expect(
    page.getByTestId('revision-history-container-name')
  ).toBeVisible()
  await expect(page.getByTestId('revision-history-container-name')).toHaveText(
    'somersault'
  )

  await expect(
    page.getByTestId('revisions-columns-dropdown-button')
  ).toBeVisible()
  await page.getByTestId('revisions-columns-dropdown-button').click()

  // The revisions table has 6 total columns which can be toggled on/off in the column selection dropdown
  await expect(
    page.getByTestId('revisions-columns-dropdown-entry')
  ).toHaveCount(6)
  await page.keyboard.press('Escape')
  await expect(
    page.getByTestId('revisions-columns-dropdown-entry')
  ).toHaveCount(0)

  // Check the Company Data section
  await expect(page.getByTestId('company-data-subtitle')).toBeVisible()
  await expect(page.getByTestId('company-data-subtitle')).toHaveText(
    'Company Data'
  )
  await expect(page.getByTestId('company-data-row')).toHaveCount(3)
})

test('Check ODX-D page - column selection on database table', async ({
  page,
}) => {
  await page.goto('/odx-d')

  const dbTable = page.getByLabel('Diagnostic layer containers table')

  await expect(dbTable).toBeVisible()

  await page.getByTestId('odxDatabases-columns-dropdown-button').click()

  // The databases table has 8 total columns which can be toggled on/off in the column selection dropdown
  await expect(
    page.getByTestId('odxDatabases-columns-dropdown-entry')
  ).toHaveCount(8)
})

test('Check ODX-D page - VARIANT TYPE filter on diagnostic variants table', async ({
  page,
}) => {
  await page.goto('/odx-d?objectId=c91929c68418ac5db8f9534234e0fc1b')

  const variantsTable = page.getByLabel('Diagnostic variants table')

  await expect(variantsTable).toBeVisible()

  await page.getByTestId('filter-VARIANT TYPE-button').click()

  // Check that the dropdown menu is visible
  await expect(
    page
      .getByTestId('filter-VARIANT TYPE-menu')
      .filter({ has: page.getByRole('menu', { name: 'Filter' }) })
  ).toBeVisible()

  // Select the "ECU-VARIANT" value in the dropdown (matches 2 of 3 items)
  await page.getByTestId('filter-VARIANT TYPE-menu-entry-ECU-VARIANT').click()

  await expect(page.getByRole('button', { name: 'Show Variant' })).toHaveCount(
    2
  )
})

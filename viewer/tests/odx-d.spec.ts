// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check ODX-D page and navigatation to revision history page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/odx-d')

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
  expect(await page.getByTestId('revisions-row').all()).toHaveLength(3)

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

  expect(
    await page.getByTestId('revisions-columns-dropdown-entry').all()
  ).toHaveLength(6)

  // Check the Company Data section
  await expect(page.getByTestId('company-data-subtitle')).toBeVisible()
  await expect(page.getByTestId('company-data-subtitle')).toHaveText(
    'Company Data'
  )
  expect(await page.getByTestId('company-data-row').all()).toHaveLength(3)
})

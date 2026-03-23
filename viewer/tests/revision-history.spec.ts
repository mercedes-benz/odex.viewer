// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check revision history page', async ({ page }) => {
  await page.goto(
    'http://localhost:3000/revision?objectId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Check the title and container name
  await expect(page.getByTestId('revision-history-title')).toBeVisible()
  await expect(page.getByTestId('revision-history-title')).toHaveText(
    'Revision History'
  )
  await expect(
    page.getByTestId('revision-history-container-name')
  ).toBeVisible()
  await expect(page.getByTestId('revision-history-container-name')).toHaveText(
    'somersault'
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
    page.getByTestId('revisions-columns-dropdown-button')
  ).toBeVisible()
  await page.getByTestId('revisions-columns-dropdown-button').click()

  expect(
    await page.getByTestId('revisions-columns-dropdown-entry').all()
  ).toHaveLength(6)

  // Check for the Company Data section
  await expect(page.getByTestId('company-data-subtitle')).toBeVisible()
  await expect(page.getByTestId('company-data-subtitle')).toHaveText(
    'Company Data'
  )

  await expect(
    page.getByTestId('companyData-columns-dropdown-button')
  ).toBeVisible()
  await page.getByTestId('companyData-columns-dropdown-button').click()

  expect(
    await page.getByTestId('companyData-columns-dropdown-entry').all()
  ).toHaveLength(17)

  expect(await page.getByTestId('company-data-row').all()).toHaveLength(3)
})

test('Check revision details page', async ({ page }) => {
  await page.goto(
    'http://localhost:3000/revision?objectId=c91929c68418ac5db8f9534234e0fc1b'
  )

  // Check that entry for revision label '1.0' exists and is visible
  await expect(
    page
      .getByLabel('1.0', { exact: true })
      .getByRole('link', { name: 'Details' })
  ).toBeVisible()
  // Click on the 'Details' link for revision '1.0'
  await page
    .getByLabel('1.0', { exact: true })
    .getByRole('link', { name: 'Details' })
    .click()

  // Check the title and container name
  await expect(page.getByTestId('revision-history-title')).toBeVisible()
  await expect(page.getByTestId('revision-history-title')).toHaveText(
    'Revision History'
  )
  await expect(
    page.getByTestId('revision-history-container-name')
  ).toBeVisible()
  await expect(page.getByTestId('revision-history-container-name')).toHaveText(
    'somersault'
  )

  // Check the Metadata section
  await expect(page.getByTestId('revision-metadata-subtitle')).toBeVisible()
  await expect(page.getByTestId('revision-metadata-subtitle')).toHaveText(
    'Metadata'
  )

  // Check the Modifications section
  await expect(
    page.getByTestId('revision-modifications-subtitle')
  ).toBeVisible()
  await expect(page.getByTestId('revision-modifications-subtitle')).toHaveText(
    'Modifications'
  )
  expect(
    await page.getByTestId('revision-modifications-row').all()
  ).toHaveLength(2)

  // Navigate back to the revision history page using breadcrumb link and check URL
  await expect(
    page.getByRole('link', { name: 'Revision History' })
  ).toBeVisible()
  await page.getByRole('link', { name: 'Revision History' }).click()

  await expect(page).toHaveURL(
    'http://localhost:3000/revision?objectId=c91929c68418ac5db8f9534234e0fc1b'
  )
})

// SPDX-License-Identifier: AGPL-3.0-only
import path from 'path'

import { test, expect } from '@playwright/test'

test('upload PDX file', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main').getByRole('alert')).not.toBeVisible()
  await expect(page.getByText('Start exploring your')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose File' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible()

  // Upload somersault PDX test data
  await page.getByRole('button', { name: 'Choose File' }).click()
  await page
    .getByRole('button', { name: 'Choose File' })
    .setInputFiles(
      path.join(__dirname, '..', '..', 'server', 'tests', 'somersault.pdx')
    )
  await page.getByRole('button', { name: 'Upload File' }).click()

  await expect(page).toHaveURL((url) => {
    const params = url.searchParams

    return (
      url.toString().startsWith('http://localhost:3000/odx-d') &&
      params.has('objectId') &&
      params.get('objectId') !== '0'
    )
  })

  await expect(page.getByRole('heading', { name: 'ODX-D' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'somersault' })).toBeVisible()
  await expect(page.getByText('Metadata')).toBeVisible()
  await expect(page.getByText('ECU & Base Variants')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'somersault_base_variant' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'somersault_lazy' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'somersault_assiduous' })
  ).toBeVisible()
  await expect(
    page.getByLabel('somersault_base_variant').getByText('no revision history')
  ).toBeVisible()
  await expect(
    page.getByLabel('somersault_lazy').getByText('no revision history')
  ).toBeVisible()

  await expect(page.getByTestId('reset-button-page')).toBeVisible()

  // Use breadcrump to navigate back to home page
  await page
    .getByLabel('Breadcrumbs')
    .getByRole('link', { name: 'Home' })
    .click()
  await expect(page.getByText('Start exploring your')).toBeVisible()

  await expect(page).toHaveURL('http://localhost:3000')
})

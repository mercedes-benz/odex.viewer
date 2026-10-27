// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Check settings page', async ({ page }) => {
  await page.goto('/settings')

  // Check the main title
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  // Check the State settings subtitle
  await expect(page.getByText('State settings')).toBeVisible()

  // Check the descriptive text
  await expect(
    page.getByText(
      'This section allows to manage the settings of UI element states'
    )
  ).toBeVisible()

  // Check that the reset button is visible
  await expect(
    page.getByRole('button', { name: 'Reset UI state to defaults' })
  ).toBeVisible()
})

test('Check settings page - reset UI state to defaults', async ({ page }) => {
  await page.goto('/settings')

  // Read current UI theme from the HTML element's class
  const currentTheme = await page.locator('html').getAttribute('class')

  // Change UI theme by toggling the theme switch
  await page.getByTestId('theme-switch').first().click()
  // Verify that the theme has changed
  const newTheme = await page.locator('html').getAttribute('class')

  expect(newTheme).not.toBe(currentTheme)

  // Reset the theme change
  await page.getByRole('button', { name: 'Reset UI state to defaults' }).click()

  // Check if the theme has been reset to the original theme
  await expect(page.locator('html')).toHaveClass(new RegExp(currentTheme || ''))

  await expect(page).toHaveURL(/\/settings/)
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
})

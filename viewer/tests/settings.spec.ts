// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from '@playwright/test'

test('Prerendered controls wait for hydration before accepting input', async ({
  page,
}) => {
  let releaseScripts!: () => void
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve
  })

  await page.route('**/_next/**/*.js*', async (route) => {
    await scriptsReady
    await route.continue()
  })

  try {
    await page.goto('/settings', { waitUntil: 'commit' })
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.locator('[data-hydrated]')).toHaveAttribute('inert', '')
    await expect(page.locator('[data-hydrated]')).toHaveAttribute(
      'data-hydrated',
      'false'
    )
  } finally {
    releaseScripts()
  }

  await expect(page.locator('[data-hydrated]')).toHaveAttribute(
    'data-hydrated',
    'true'
  )
  await expect(page.locator('[data-hydrated]')).not.toHaveAttribute('inert')
  const theme = await page.locator('html').getAttribute('class')

  await page.getByTestId('theme-switch').first().click()
  await expect(page.locator('html')).not.toHaveAttribute('class', theme!)
})

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
  await expect(page.locator('[data-hydrated]')).toHaveAttribute(
    'data-hydrated',
    'true'
  )

  // Read current UI theme from the HTML element's class
  const currentTheme = await page.locator('html').getAttribute('class')

  // Change UI theme by toggling the theme switch
  await page.getByTestId('theme-switch').first().click()
  await expect(page.locator('html')).not.toHaveAttribute('class', currentTheme!)

  // Reset the theme change
  const resetReload = page.waitForEvent('load')

  await page.getByRole('button', { name: 'Reset UI state to defaults' }).click()
  await resetReload

  // Check if the theme has been reset to the original theme
  await expect(page.locator('html')).toHaveAttribute('class', currentTheme!)

  await expect(page).toHaveURL(/\/settings/)
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
})

test('Reset UI state clears persisted table column settings', async ({
  page,
}) => {
  await page.goto('/dops')
  await expect(
    page.getByText('36 of total 36 data object properties')
  ).toBeVisible()

  const dropdownButton = page.getByTestId('dops-columns-dropdown-button')
  const firstColumn = page.getByTestId('dops-columns-dropdown-entry').first()

  await dropdownButton.click()
  await expect(firstColumn).toBeVisible()
  const defaultSelection = await firstColumn.getAttribute('aria-checked')

  expect(defaultSelection).toMatch(/^(true|false)$/)
  await firstColumn.click()
  const changedSelection = defaultSelection === 'true' ? 'false' : 'true'

  await dropdownButton.click()
  await expect(firstColumn).toHaveAttribute('aria-checked', changedSelection)
  await page.reload()
  await expect(
    page.getByText('36 of total 36 data object properties')
  ).toBeVisible()
  await page.getByTestId('dops-columns-dropdown-button').click()
  await expect(
    page.getByTestId('dops-columns-dropdown-entry').first()
  ).toHaveAttribute('aria-checked', changedSelection)

  await page.goto('/settings')
  const resetReload = page.waitForEvent('load')

  await page.getByRole('button', { name: 'Reset UI state to defaults' }).click()
  await resetReload
  await expect(page.locator('[data-hydrated]')).toHaveAttribute(
    'data-hydrated',
    'true'
  )

  await page.goto('/dops')
  await expect(
    page.getByText('36 of total 36 data object properties')
  ).toBeVisible()
  await page.getByTestId('dops-columns-dropdown-button').click()
  await expect(
    page.getByTestId('dops-columns-dropdown-entry').first()
  ).toHaveAttribute('aria-checked', defaultSelection!)
})

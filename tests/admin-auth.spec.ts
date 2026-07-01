import { expect, test } from '@playwright/test'

test.describe('admin authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Checking session...')).toBeHidden()

  })

  test('login form is visible', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Sign in'),
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.locator('#login-email').fill('invalid@email.com')
    await page.locator('#login-password').fill('invalidpass')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByTestId('login-error')).toBeVisible()
  })

  test('redirects unauthenticated admin visitors to login', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })
})

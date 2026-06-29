import { expect, test } from '@playwright/test'

test('visitor can open the booking flow from the homepage', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: /bringing you closer to nature, dairy & farm life/i,
    }),
  ).toBeVisible()

  await page.getByRole('link', { name: /book a group tour/i }).click()

  await expect(page).toHaveURL(/\/booking-form\/date-slot$/)
  await expect(page.getByText(/pre-booking slot/i)).toBeVisible()
  await expect(page.getByText(/step 1 of 5/i)).toBeVisible()
})

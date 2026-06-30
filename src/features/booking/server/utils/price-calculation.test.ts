import { describe, expect, test } from 'vitest'
import {
  calculateBookingTotal,
  calculatePackageSubtotal,
} from './price-calculation'

const packageRow = {
        package_id: 'pkg-001',
        pax_my_adult: 5,
        pax_my_kid: 20,
        pax_my_senior: 0,
        pax_my_oku: 10,
        pax_non_my_adult: 0,
        pax_non_my_kid: 0,
        pax_non_my_senior: 5,
        pax_non_my_oku: 0,
}

const packagePrice = {
    price_my_adult: 30,
    price_my_kid: 20,
    price_my_senior: 20,
    price_my_oku:0,
    price_non_my_adult:60,
    price_non_my_kid: 40,
    price_non_my_senior:40,
    price_non_my_oku:0
}

test('accept valid package subtotal', () => {
    const subtotal = calculatePackageSubtotal(packageRow, packagePrice)
    expect(subtotal).toBe(750)
})
describe('calculateBookingTotal', () => {
  test('adds package, food, add-on, and guide fee totals', () => {
    const total = calculateBookingTotal(
      [packageRow],
      [
        {
          food_id: 1,
          quantity: 20,
        },
      ],
      [
        {
          addon_id: 1,
          quantity: 3,
        },
      ],
      {
        'pkg-001': packagePrice,
      },
      {
        1: {
          food_price: 8,
        },
      },
      {
        1: {
          addon_price: 12,
        },
      },
      100,
    )

    expect(total).toBe(1046)
  })

  test('ignores food and add-on rows when price is missing', () => {
    const total = calculateBookingTotal(
      [packageRow],
      [
        {
          food_id: 999,
          quantity: 20,
        },
      ],
      [
        {
          addon_id: 999,
          quantity: 3,
        },
      ],
      {
        'pkg-001': packagePrice,
      },
      {},
      {},
    )

    expect(total).toBe(750)
  })
})

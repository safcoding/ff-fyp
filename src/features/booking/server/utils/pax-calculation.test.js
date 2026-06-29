import { describe, expect, test } from 'vitest'
import {
  calculatePackagePaxTotal,
  calculatePaxBreakdown,
  calculatePaxTotal,
} from './pax-calculation'

const basePackage = {
  package_id: 'pkg-001',
  selected_activity: 1,
  pax_my_adult: 10,
  pax_my_kid: 5,
  pax_my_senior: 2,
  pax_my_oku: 1,
  pax_non_my_adult: 4,
  pax_non_my_kid: 3,
  pax_non_my_senior: 1,
  pax_non_my_oku: 0,
}

describe('calculatePackagePaxTotal', () => {
  test('calculates total pax for one selected package', () => {
    expect(calculatePackagePaxTotal(basePackage)).toBe(26)
  })
})

describe('calculatePaxTotal', () => {
  test('calculates total pax across multiple selected packages', () => {
    const secondPackage = {
      ...basePackage,
      package_id: 'pkg-002',
      pax_my_adult: 4,
      pax_my_kid: 0,
      pax_my_senior: 0,
      pax_my_oku: 0,
      pax_non_my_adult: 0,
      pax_non_my_kid: 0,
      pax_non_my_senior: 0,
      pax_non_my_oku: 0,
    }

    expect(calculatePaxTotal([basePackage, secondPackage])).toBe(30)
  })

  test('returns zero for an empty package list', () => {
    expect(calculatePaxTotal([])).toBe(0)
  })
})

describe('calculatePaxBreakdown', () => {
  test('returns pax totals by category', () => {
    const breakdown = calculatePaxBreakdown([
      basePackage,
      {
        ...basePackage,
        package_id: 'pkg-002',
        pax_my_adult: 1,
        pax_my_kid: 1,
        pax_my_senior: 0,
        pax_my_oku: 0,
        pax_non_my_adult: 0,
        pax_non_my_kid: 0,
        pax_non_my_senior: 0,
        pax_non_my_oku: 2,
      },
    ])

    expect(breakdown).toEqual({
      pax_my_adult: 11,
      pax_my_kid: 6,
      pax_my_senior: 2,
      pax_my_oku: 1,
      pax_non_my_adult: 4,
      pax_non_my_kid: 3,
      pax_non_my_senior: 1,
      pax_non_my_oku: 2,
    })
  })
})

import { describe, expect, test } from 'vitest'
import {
  GUIDE_PRICE,
  calculateAssignedGuideCount,
  calculateGuideFee,
} from './guide-assignment'

describe('calculateAssignedGuideCount', () => {
  test.each([
    [1, 1],
    [50, 1],
    [51, 2],
    [100, 2],
    [101, 3],
    [150, 3],
    [151, 4],
    [200, 4],
  ])('assigns %i pax to %i guide(s)', (paxTotal, expectedGuideCount) => {
    expect(calculateAssignedGuideCount(paxTotal)).toBe(expectedGuideCount)
  })

  test('rejects bookings above 200 pax', () => {
    expect(() => calculateAssignedGuideCount(201)).toThrow(
      'Please contact staff for bookings above 200 pax.',
    )
  })
})

describe('calculateGuideFee', () => {
  test('calculates guide fee from guide count', () => {
    expect(calculateGuideFee(3)).toBe(3 * GUIDE_PRICE)
  })

  test('returns zero when no guide is assigned', () => {
    expect(calculateGuideFee(null)).toBe(0)
  })
})

export const GUIDE_PRICE = 150

export const calculateAssignedGuideCount = (paxTotal: number): number => {
  if (paxTotal > 200) {
    throw new Error('Please contact staff for bookings above 200 pax.')
  }

  if (paxTotal >= 151) {
    return 4
  }

  if (paxTotal >= 101) {
    return 3
  }

  if (paxTotal >= 51) {
    return 2
  }

  return 1
}

export const calculateGuideFee = (guideCount: number | null): number => {
  return (guideCount ?? 0) * GUIDE_PRICE
}

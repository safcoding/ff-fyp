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

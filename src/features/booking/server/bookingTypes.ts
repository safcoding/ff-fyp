import type { loadRelated } from './bookingRepo'

export type ExtraBookingData = Awaited<
  ReturnType<typeof loadRelated>
>

export type LoadedPackage = ExtraBookingData["packages"][number]
export type LoadedFood = ExtraBookingData["foods"][number]
export type LoadedAddon = ExtraBookingData["addons"][number]

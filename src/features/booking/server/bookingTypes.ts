export type ExtraBookingData = Awaited<
  ReturnType<typeof import("./bookingRepo").loadRelated>
>

export type LoadedPackage = ExtraBookingData["packages"][number]
export type LoadedFood = ExtraBookingData["foods"][number]
export type LoadedAddon = ExtraBookingData["addons"][number]

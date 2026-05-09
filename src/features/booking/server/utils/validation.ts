import { calculatePackagePaxTotal, calculatePaxTotal } from "./price-calculation";
import type { BookingFormInput } from "@/schemas/bookingSchemas";
import type { ExtraBookingData } from "../bookingTypes";

const unique = <T>(items: T[]) => Array.from(new Set(items))

export const validateBooking = (userInput: BookingFormInput, dbData: ExtraBookingData) => {
    validatePackage(userInput,dbData);
    validatePax(userInput, dbData);
    validateFood(userInput, dbData);
    validateAddon(userInput, dbData);
}

const validatePackage = (selected: BookingFormInput,dbData: ExtraBookingData) => {

  const packageIds = unique(selected.packages.map((pkg) => pkg.package_id))
  const unavailablePackage = dbData.packages.find((pkg) => !pkg.package_availability)

    if (selected.packages.length === 0){
        throw new Error("At least one package required")
    }

    if (selected.packages.length !== packageIds.length) {
        throw new Error("Invalid package selection")
    }

    if (unavailablePackage){
        throw new Error(`Selected Package is not available: ${unavailablePackage.package_name}`)
    }
}

const validatePax = (selected:BookingFormInput, dbData: ExtraBookingData) => {
    const totalPax = calculatePaxTotal(selected.packages);
    const packageById = new Map(dbData.packages.map((pax) => [pax.package_id, pax]))

    if (totalPax < 20){
        throw new Error("At least 20 pax needed")
    }

    if (selected.packages.length == 1) {
        return
    }
    
  for (const selectedPackage of selected.packages) {
    const packageRecord = packageById.get(selectedPackage.package_id)

    if (!packageRecord?.minimum_pax) {
      continue
    }

    const packagePaxTotal = calculatePackagePaxTotal(selectedPackage)

    if (packagePaxTotal < packageRecord.minimum_pax) {
      throw new Error(
        `${packageRecord.package_name} requires at least ${packageRecord.minimum_pax} pax`
      )
    }
  }
}

const validateFood = (selected:BookingFormInput, dbData: ExtraBookingData) => {
    const foodIds = unique(selected.foods.map((food) => food.food_id))

    if (dbData.foods.length !== foodIds.length){
        throw new Error("Invalid food selection")
    }
}

const validateAddon = (selected: BookingFormInput, dbData: ExtraBookingData) => {
    const addonIds = unique(selected.addons.map((addon) => addon.addon_id))
    const unavailableAddon = dbData.addons.find((addon) => !addon.addon_avail)

    if (dbData.addons.length !== addonIds.length){
        throw new Error("Invalid Addon")
    }

        if (unavailableAddon) {
        throw new Error(`Selected addon is not available: ${unavailableAddon.addon_name}`)
    }
}

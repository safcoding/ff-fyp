import { calculatePaxTotal } from "./price-calculation";

const unique = <T>(items: T[]) => Array.from(new Set(items))

export const validateBooking = (userInput: any, dbData: any) => {
    validatePackage(userInput,dbData);
    validatePax(userInput);
    validateFood(userInput);
    validateAddon(userInput);
    validateSlot(userInput);
}

const validatePackage = (selected: any, dbPackage: any) => {

  const packageIds = unique(selected.packages.map((pkg: any) => pkg.package_id))
  const unavailablePackage = selected.packages.find((pkg: any) => !pkg.package_availability)

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

const validatePax = (selected:any) => {
    const totalPax = calculatePaxTotal(selected.packages);

    if (totalPax < 20){
        throw new Error("At least 20 pax needed")
    }

    if (selected.packages.length == 1) {
        return
    }
    
    if (selected.packages.length > 1) {
    const hasPackageWithMinimumPax = packagePaxTotals.some((total: number) => total >= 20)

    if (!hasPackageWithMinimumPax) {
      throw new Error("At least one package must have at least 20 pax")
    }
  }
}

const validateFood = (selected: any) => {
    const foodIds = unique(selected.foods.map((pkg: any) => pkg.food_id))

    if (foodIds.length !== foodIds.length){
        throw new Error("Invalid food selection")
    }
}

const validateAddon = (selected: any) => {
    const addonIds = unique(selected.foods.map((pkg: any) => pkg.addon_id))

    if (addonIds.length !== addonIds.length){
        throw new Error("Invalid Addon")
    }
    const unavailableAddon = selected.addons.find((addon: any) => !addon.addon_avail)
        if (unavailableAddon) {
        throw new Error(`Selected addon is not available: ${unavailableAddon.addon_name}`)
    }
}

con
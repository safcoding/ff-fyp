import type { PackagePricing } from "@/serverActions/packageActions"

export type Step = 1 | 2 | 3 | 4 | 5

export type AddonSelection = {
  addon_id: number
  quantity: number
}

export type FoodSelection = {
  food_id: number
  quantity: number
}

export type FormValues = {
  pax_my_adult: number
  pax_my_kid: number
  pax_my_senior: number
  pax_my_oku: number
  pax_non_my_adult: number
  pax_non_my_kid: number
  pax_non_my_senior: number
  pax_non_my_oku: number
  pic_name: string
  pic_email: string
  pic_hp: string
  org_address: string
  org_name: string
  org_state: string
  org_type: string
  slot_id: string
  package_id: string
  booking_date: string
  addons: AddonSelection[]
  foods: FoodSelection[]
}

export const bookingDraftStorageKey = "booking-form-draft-v1"

export const defaultFormValues: FormValues = {
  pax_my_adult: 0,
  pax_my_kid: 0,
  pax_my_senior: 0,
  pax_my_oku: 0,
  pax_non_my_adult: 0,
  pax_non_my_kid: 0,
  pax_non_my_senior: 0,
  pax_non_my_oku: 0,
  booking_date: "",
  pic_name: "",
  pic_email: "",
  pic_hp: "",
  org_address: "",
  org_name: "",
  org_state: "",
  org_type: "",
  slot_id: "",
  package_id: "",
  addons: [],
  foods: [],
}

export const paxFieldMeta: ReadonlyArray<{ name: keyof FormValues; label: string }> = [
  { name: "pax_my_adult", label: "MY Adult" },
  { name: "pax_my_kid", label: "MY Kid" },
  { name: "pax_my_senior", label: "MY Senior" },
  { name: "pax_my_oku", label: "MY OKU" },
  { name: "pax_non_my_adult", label: "Non-MY Adult" },
  { name: "pax_non_my_kid", label: "Non-MY Kid" },
  { name: "pax_non_my_senior", label: "Non-MY Senior" },
  { name: "pax_non_my_oku", label: "Non-MY OKU" },
]

export function computeTotal(
  values: FormValues,
  pricing: PackagePricing | null,
  addons: Array<{ addon_id: number; addon_price: number }> = [],
  foods: Array<{ food_id: number; food_price: number }> = [],
): number {
  if (!pricing) return 0

  const packageTotal =
    values.pax_my_adult * pricing.price_my_adult +
    values.pax_my_kid * pricing.price_my_kid +
    values.pax_my_senior * pricing.price_my_senior +
    values.pax_my_oku * pricing.price_my_oku +
    values.pax_non_my_adult * pricing.price_non_my_adult +
    values.pax_non_my_kid * pricing.price_non_my_kid +
    values.pax_non_my_senior * pricing.price_non_my_senior +
    values.pax_non_my_oku * pricing.price_non_my_oku

  const addonPriceMap = new Map(addons.map((addon) => [addon.addon_id, addon.addon_price]))
  const foodPriceMap = new Map(foods.map((food) => [food.food_id, food.food_price]))

  const addonTotal = values.addons.reduce((sum, item) => {
    const unitPrice = addonPriceMap.get(item.addon_id) ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  const foodTotal = values.foods.reduce((sum, item) => {
    const unitPrice = foodPriceMap.get(item.food_id) ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  return packageTotal + addonTotal + foodTotal
}

export function getTotalVisitors(values: FormValues) {
  return (
    values.pax_my_adult +
    values.pax_my_kid +
    values.pax_my_senior +
    values.pax_my_oku +
    values.pax_non_my_adult +
    values.pax_non_my_kid +
    values.pax_non_my_senior +
    values.pax_non_my_oku
  )
}

export function validateDetails(values: FormValues): string | null {
  if (getTotalVisitors(values) < 1) {
    return "At least one visitor is required."
  }

  const requiredTextFields: Array<{ key: keyof FormValues; label: string }> = [
    { key: "pic_name", label: "Person in Charge Name" },
    { key: "pic_email", label: "Person in Charge Email" },
    { key: "pic_hp", label: "Phone" },
    { key: "org_name", label: "Organization Name" },
    { key: "org_address", label: "Organization Address" },
    { key: "org_state", label: "Organization State" },
    { key: "org_type", label: "Organization Type" },
  ]

  for (const field of requiredTextFields) {
    const value = String(values[field.key] ?? "").trim()
    if (!value) {
      return `${field.label} is required.`
    }
  }

  const email = values.pic_email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address."
  }

  const phone = values.pic_hp.trim()
 const phonePattern = /^\+?[1-9]\d{7,14}$/
  if (!phonePattern.test(phone)) {
    return "Phone must be in valid E.164 format (example: +60123456789)."
  }

  return null
}

import { createServerFn } from "@tanstack/react-start"
import z from "zod"

import { prisma } from "@/db"

export type PackagePricing = {
  price_my_adult: number
  price_my_kid: number
  price_my_senior: number
  price_my_oku: number
  price_non_my_adult: number
  price_non_my_kid: number
  price_non_my_senior: number
  price_non_my_oku: number
}

export function getPackagePricing(pkg: Record<string, unknown>): PackagePricing {
  return {
    price_my_adult: Number(pkg.price_my_adult ?? 0),
    price_my_kid: Number(pkg.price_my_kid ?? 0),
    price_my_senior: Number(pkg.price_my_senior ?? 0),
    price_my_oku: Number(pkg.price_my_oku ?? 0),
    price_non_my_adult: Number(pkg.price_non_my_adult ?? 0),
    price_non_my_kid: Number(pkg.price_non_my_kid ?? 0),
    price_non_my_senior: Number(pkg.price_non_my_senior ?? 0),
    price_non_my_oku: Number(pkg.price_non_my_oku ?? 0),
  }
}

const packageSchema = z.object({
  package_name: z.string().trim().min(1),
  package_note: z.string().trim().optional(),
  package_availability: z.boolean(),
  price_my_adult: z.coerce.number().nonnegative(),
  price_my_kid: z.coerce.number().nonnegative(),
  price_my_senior: z.coerce.number().nonnegative(),
  price_my_oku: z.coerce.number().nonnegative(),
  price_non_my_adult: z.coerce.number().nonnegative(),
  price_non_my_kid: z.coerce.number().nonnegative(),
  price_non_my_senior: z.coerce.number().nonnegative(),
  price_non_my_oku: z.coerce.number().nonnegative(),
})

export const getPackages = createServerFn({ method: "GET" }).handler(async () => {
  const packages = await prisma.packages.findMany({
    orderBy: { package_name: "asc" },
  })

  return packages.map((pkg) => ({
    package_id: pkg.package_id,
    package_name: pkg.package_name,
    package_note: pkg.package_note,
    package_availability: pkg.package_availability,
    price_my_adult: Number(pkg.price_my_adult),
    price_my_kid: Number(pkg.price_my_kid),
    price_my_senior: Number(pkg.price_my_senior),
    price_my_oku: Number(pkg.price_my_oku),
    price_non_my_adult: Number(pkg.price_non_my_adult),
    price_non_my_kid: Number(pkg.price_non_my_kid),
    price_non_my_senior: Number(pkg.price_non_my_senior),
    price_non_my_oku: Number(pkg.price_non_my_oku),
  }))
})

export const createPackage = createServerFn({ method: "POST" })
  .inputValidator(packageSchema)
  .handler(async ({ data }) => {
    const created = await prisma.packages.create({
      data: {
        package_name: data.package_name,
        package_note: data.package_note || null,
        package_availability: data.package_availability,
        price_my_adult: data.price_my_adult,
        price_my_kid: data.price_my_kid,
        price_my_senior: data.price_my_senior,
        price_my_oku: data.price_my_oku,
        price_non_my_adult: data.price_non_my_adult,
        price_non_my_kid: data.price_non_my_kid,
        price_non_my_senior: data.price_non_my_senior,
        price_non_my_oku: data.price_non_my_oku,
      },
    })

    return `Created package ${created.package_name}`
  })
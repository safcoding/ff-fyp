import { createServerFn } from "@tanstack/react-start"
import { packageSchema, createPackageSchema, deletePackageSchema } from "@/schemas/packageSchemas"
import { prisma } from "@/db"
import authMiddleware from "@/lib/auth-middleware"

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

export const getPackages = createServerFn({ method: "GET" }).handler(async () => {
  const packages = await prisma.packages.findMany({
    orderBy: { package_name: "asc" },
    include: {
      package_activities: {
        select: {
          activity_id: true,
          activities: {
            select: {
              activity_id: true,
              activity_name: true,
            },
          },
        },
      },
    },
  })

  return packages.map((pkg) => ({
    package_id: pkg.package_id,
    package_name: pkg.package_name,
    package_note: pkg.package_note,
    package_features: pkg.package_features,
    package_availability: pkg.package_availability,
    price_my_adult: Number(pkg.price_my_adult),
    price_my_kid: Number(pkg.price_my_kid),
    price_my_senior: Number(pkg.price_my_senior),
    price_my_oku: Number(pkg.price_my_oku),
    price_non_my_adult: Number(pkg.price_non_my_adult),
    price_non_my_kid: Number(pkg.price_non_my_kid),
    price_non_my_senior: Number(pkg.price_non_my_senior),
    price_non_my_oku: Number(pkg.price_non_my_oku),
    activity_ids: pkg.package_activities.map((item) => item.activity_id).filter(Boolean),
    activities: pkg.package_activities
      .map((item) => item.activities)
      .filter((activity): activity is { activity_id: number; activity_name: string } => Boolean(activity)),
  }))
})

export const createPackage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createPackageSchema)
  .handler(async ({ data }) => {
    const created = await prisma.packages.create({
      data: {
        package_name: data.package_name,
        package_note: data.package_note || null,
        package_features: data.package_features,
        package_availability: data.package_availability,

        price_my_adult: data.price_my_adult,
        price_my_kid: data.price_my_kid,
        price_my_senior: data.price_my_senior,
        price_my_oku: data.price_my_oku,
        price_non_my_adult: data.price_non_my_adult,
        price_non_my_kid: data.price_non_my_kid,
        price_non_my_senior: data.price_non_my_senior,
        price_non_my_oku: data.price_non_my_oku,

        minimum_pax: data.minimum_pax,

        package_activities: {
          create: data.activity_ids.map((activity_id) => ({
            activity_id,
          })),
        }
      },
    })

    return `Created package ${created.package_name}`
  })

export const updatePackage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(packageSchema)
  .handler(async ({ data }) => {
    const updated = await prisma.$transaction(async (tx) => {
      const updatedPackage = await tx.packages.update({
        where: { package_id: data.package_id },
        data: {
          package_name: data.package_name,
          package_note: data.package_note || null,
          package_features: data.package_features,
          package_availability: data.package_availability,
          price_my_adult: data.price_my_adult,
          price_my_kid: data.price_my_kid,
          price_my_senior: data.price_my_senior,
          price_my_oku: data.price_my_oku,
          price_non_my_adult: data.price_non_my_adult,
          price_non_my_kid: data.price_non_my_kid,
          price_non_my_senior: data.price_non_my_senior,
          price_non_my_oku: data.price_non_my_oku,
          minimum_pax: data.minimum_pax,
        },
      })

      await tx.package_activities.deleteMany({
        where: { package_id: data.package_id },
      })

      if (data.activity_ids.length) {
        await tx.package_activities.createMany({
          data: data.activity_ids.map((activity_id) => ({
            package_id: data.package_id,
            activity_id,
          })),
        })
      }

      return updatedPackage
    })

    return `Updated package ${updated.package_name}`
  })

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deletePackageSchema)
  .handler(async ({ data }) => {
    try {
      const deleted = await prisma.$transaction(async (tx) => {
        await tx.package_activities.deleteMany({
          where: { package_id: data.package_id },
        })

        return tx.packages.delete({
          where: { package_id: data.package_id },
        })
      })

      return `Deleted package ${deleted.package_name}`
    } catch {
      throw new Error("This package cannot be deleted because it is referenced by existing bookings.")
    }
  })

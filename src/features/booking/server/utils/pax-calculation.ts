import type z from "zod"
import type { bookingPackagesSchema } from "@/schemas/bookingSchemas"

type PackageRow = z.infer<typeof bookingPackagesSchema>
type PaxTotals = {
  pax_my_adult: number
  pax_my_kid: number
  pax_my_senior: number
  pax_my_oku: number
  pax_non_my_adult: number
  pax_non_my_kid: number
  pax_non_my_senior: number
  pax_non_my_oku: number
}

export const calculatePackagePaxTotal = (pkg: PackageRow): number => {
  return (
    pkg.pax_my_adult +
    pkg.pax_my_kid +
    pkg.pax_my_senior +
    pkg.pax_my_oku +
    pkg.pax_non_my_adult +
    pkg.pax_non_my_kid +
    pkg.pax_non_my_senior +
    pkg.pax_non_my_oku
  )
}

export const calculatePaxTotal = (packageRows: PackageRow[]): number => {
  const totals = calculatePaxBreakdown(packageRows)
  return (
    totals.pax_my_adult +
    totals.pax_my_kid +
    totals.pax_my_senior +
    totals.pax_my_oku +
    totals.pax_non_my_adult +
    totals.pax_non_my_kid +
    totals.pax_non_my_senior +
    totals.pax_non_my_oku
  )
}

export const calculatePaxBreakdown = (packageRows: PackageRow[]): PaxTotals => {
  return packageRows.reduce((sum, row) => {
    return {
      pax_my_adult: sum.pax_my_adult + row.pax_my_adult,
      pax_my_kid: sum.pax_my_kid + row.pax_my_kid,
      pax_my_senior: sum.pax_my_senior + row.pax_my_senior,
      pax_my_oku: sum.pax_my_oku + row.pax_my_oku,
      pax_non_my_adult: sum.pax_non_my_adult + row.pax_non_my_adult,
      pax_non_my_kid: sum.pax_non_my_kid + row.pax_non_my_kid,
      pax_non_my_senior: sum.pax_non_my_senior + row.pax_non_my_senior,
      pax_non_my_oku: sum.pax_non_my_oku + row.pax_non_my_oku,
    }
  }, {
    pax_my_adult: 0,
    pax_my_kid: 0,
    pax_my_senior: 0,
    pax_my_oku: 0,
    pax_non_my_adult: 0,
    pax_non_my_kid: 0,
    pax_non_my_senior: 0,
    pax_non_my_oku: 0,
  })
}

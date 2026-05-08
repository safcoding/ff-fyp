import z from "zod";

export const packageSchema = z.object({
  package_name: z.string().trim().min(1),
  package_id: z.string().trim().min(1),
  package_note: z.string().trim().optional(),
  package_features: z.array(z.string().trim().min(1)).min(1),
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
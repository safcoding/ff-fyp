import z from 'zod'

export const settingsSchema = z.object({
  min_lead_days: z.coerce.number().int().min(0),
  company_name: z.string().trim().max(255),
  company_address: z.string().trim().max(1000),
  company_phone: z.string().trim().max(50),
  company_email: z.string().trim().max(255),
  sst_registration: z.string().trim().max(100)
})

export const updateSettingsSchema = settingsSchema

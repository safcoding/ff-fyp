import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { updateSettingsSchema } from '@/schemas/settingsSchemas'
import { adminOnlyMiddleware } from '@/lib/auth-middleware'

export const getSettings = createServerFn({ method: 'GET' })
  .middleware([adminOnlyMiddleware])
  .handler(
  async () => {
    const settings = await prisma.global_settings.findFirst({
      orderBy: { id: 'asc' },
    })

    return {
      min_lead_days: settings?.min_lead_days ?? 14,
      company_name: settings?.company_name ?? '',
      company_address: settings?.company_address ?? '',
      company_phone: settings?.company_phone ?? '',
      company_email: settings?.company_email ?? '',
      sst_registration: settings?.sst_registration ?? '',
    }
  },
)

export const updateSettings = createServerFn({ method: 'POST' })
  .middleware([adminOnlyMiddleware])
  .inputValidator(updateSettingsSchema)
  .handler(async ({ data }) => {
    const existing = await prisma.global_settings.findFirst({
      orderBy: { id: 'asc' },
    })

    if (existing) {
      await prisma.global_settings.update({
        where: { id: existing.id },
        data: {
          min_lead_days: data.min_lead_days ?? existing.min_lead_days,
          company_name: data.company_name ?? existing.company_name,
          company_address: data.company_address ?? existing.company_address,
          company_phone: data.company_phone ?? existing.company_phone,
          company_email: data.company_email ?? existing.company_email,
          sst_registration: data.sst_registration ?? existing.sst_registration,
        },
      })
    } else {
      await prisma.global_settings.create({
        data: {
          min_lead_days: data.min_lead_days ?? 14,
          company_name: data.company_name ?? '',
          company_address: data.company_address ?? '',
          company_phone: data.company_phone ?? '',
          company_email: data.company_email ?? '',
          sst_registration: data.sst_registration ?? '',
        },
      })
    }

    return 'Settings updated'
  })

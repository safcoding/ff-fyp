import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
  }).format(value)

export const toHHmm = (value: Date | string) => {
  if (value instanceof Date) return value.toISOString().slice(11, 16)
  return value.trim().slice(0, 5)
}

export const toIsoDateTimeForTimeColumn = (value: Date | string) => {
  if (value instanceof Date) return value.toISOString()

  const raw = value.trim()
  if (/^\d{2}:\d{2}$/.test(raw)) return `1970-01-01T${raw}:00.000Z`
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return `1970-01-01T${raw}.000Z`

  return `1970-01-01T${raw.slice(0, 8)}.000Z`
}
import { useEffect, useState } from "react"

import {
  bookingDraftStorageKey,
  createEmptyPackageSelection,
  defaultFormValues,
} from "@/lib/utils/booking/booking-form"
import type { FormValues } from "@/lib/utils/booking/booking-form"
import { org_categories, states } from "@/generated/prisma/enums"

const paxKeys = [
  "pax_my_adult",
  "pax_my_kid",
  "pax_my_senior",
  "pax_my_oku",
  "pax_non_my_adult",
  "pax_non_my_kid",
  "pax_non_my_senior",
  "pax_non_my_oku",
] as const

type LegacyDraft = Partial<FormValues> & Record<string, unknown>

const stateValues = new Set(Object.values(states))
const orgTypeValues = new Set(Object.values(org_categories))

function normalizeEnumValue(value: unknown, allowed: Set<string>): string {
  if (typeof value !== "string") {
    return ""
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  if (allowed.has(trimmed)) {
    return trimmed
  }

  const cleaned = trimmed
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return allowed.has(cleaned) ? cleaned : ""
}

function normalizeDraft(raw: unknown): Partial<FormValues> | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const draft = raw as LegacyDraft

  if (!Array.isArray(draft.packages)) {
    const packageId = typeof draft.package_id === "string" ? draft.package_id.trim() : ""
    if (packageId) {
      const selection = createEmptyPackageSelection(packageId)

      for (const key of paxKeys) {
        const value = draft[key]
        if (typeof value === "number" && Number.isFinite(value)) {
          selection[key] = Math.max(0, Math.floor(value))
        } else if (typeof value === "string" && value.trim() !== "") {
          const parsed = Number(value)
          selection[key] = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0
        }
      }

      return {
        ...draft,
        org_state: normalizeEnumValue(draft.org_state, stateValues),
        org_type: normalizeEnumValue(draft.org_type, orgTypeValues),
        packages: [selection],
      }
    }
  }

  return {
    ...draft,
    org_state: normalizeEnumValue(draft.org_state, stateValues),
    org_type: normalizeEnumValue(draft.org_type, orgTypeValues),
  }
}

export function useBookingDraft() {
  const [values, setValues] = useState<FormValues>(defaultFormValues)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const rawDraft = window.sessionStorage.getItem(bookingDraftStorageKey)
    if (!rawDraft) {
      setIsHydrated(true)
      return
    }

    try {
      const parsed = JSON.parse(rawDraft) as unknown
      const normalized = normalizeDraft(parsed)
      if (normalized) {
        setValues((prev) => ({ ...prev, ...normalized }))
      }
    } catch {
      // Ignore malformed draft payloads and continue with defaults.
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return
    }

    window.sessionStorage.setItem(bookingDraftStorageKey, JSON.stringify(values))
  }, [values, isHydrated])

  function updateField<TKey extends keyof FormValues>(key: TKey, value: FormValues[TKey]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function clearDraft() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(bookingDraftStorageKey)
    }
    setValues(defaultFormValues)
  }

  return {
    values,
    setValues,
    updateField,
    clearDraft,
    isHydrated,
  }
}

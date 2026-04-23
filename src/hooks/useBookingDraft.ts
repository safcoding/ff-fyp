import { useEffect, useState } from "react"

import {
  bookingDraftStorageKey,
  defaultFormValues,
  type FormValues,
} from "@/lib/booking-form"

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
      const draft = JSON.parse(rawDraft) as Partial<FormValues>
      setValues((prev) => ({ ...prev, ...draft }))
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

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
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

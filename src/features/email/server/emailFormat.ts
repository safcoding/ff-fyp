export function formatDate(value: Date | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value)
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function formatPaxValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export const paxLabels = [
  ["pax_my_adult", "Malaysian Adult"],
  ["pax_my_kid", "Malaysian Kids"],
  ["pax_my_senior", "Malaysian Senior"],
  ["pax_my_oku", "Malaysian OKU"],
  ["pax_non_my_adult", "Non-Malaysian Adult"],
  ["pax_non_my_kid", "Non-Malaysian Kids"],
  ["pax_non_my_senior", "Non-Malaysian Senior"],
  ["pax_non_my_oku", "Non-Malaysian OKU"],
] as const
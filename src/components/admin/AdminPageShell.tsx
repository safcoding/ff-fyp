import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AdminPageHeaderProps = {
  title: string
  description: string
  meta?: ReactNode
}

type AdminSectionCardProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

type AdminStatusBadgeProps = {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function AdminPageHeader({ title, description, meta }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#445412]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-fraunces text-3xl font-black text-[#445412] sm:text-4xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">{description}</p>
      </div>
      {meta ? <div className="flex shrink-0 flex-wrap gap-2">{meta}</div> : null}
    </div>
  )
}

export function AdminStatPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-[#445412]/10 bg-white/80 px-3 py-2 text-sm shadow-sm">
      <span className="text-stone-500">{label}</span>
      <span className="ml-2 font-semibold text-[#445412]">{value}</span>
    </div>
  )
}

export function AdminSectionCard({ title, description, children, className }: AdminSectionCardProps) {
  return (
    <Card className={cn("border-[#445412]/10 bg-white/85 shadow-sm", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="font-fraunces text-2xl font-black text-[#445412]">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function AdminStatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-stone-200 bg-stone-100 text-stone-600",
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

export function AdminItemRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-stone-200 bg-stone-50/70 p-4 text-sm", className)}>
      {children}
    </div>
  )
}

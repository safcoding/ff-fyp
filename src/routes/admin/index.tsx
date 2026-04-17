import { createFileRoute, Link } from "@tanstack/react-router"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/admin/")({ component: AdminIndex })

function AdminIndex() {
  const pages = [
    { href: "/admin/packages", label: "Manage Packages" },
    { href: "/admin/slots", label: "Manage Slots" },
    { href: "/admin/addons", label: "Manage Addons" },
    { href: "/admin/foods", label: "Manage Foods" },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Forms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {pages.map((page) => (
            <Link
              key={page.href}
              to={page.href}
              className="rounded-md border p-4 text-sm hover:bg-slate-50"
            >
              {page.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

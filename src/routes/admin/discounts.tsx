import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { requireAdminRoute } from "@/lib/admin-route-guard"
import { AdminItemRow, AdminListSkeleton, AdminPageHeader, AdminSectionCard, AdminStatPill } from "@/components/admin/AdminPageShell"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/deleteDialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import {
  createDiscount,
  deleteDiscount,
  getDiscounts,
  updateDiscount,
} from "@/features/discount/server/discountActions"
import type { discount_types as DiscountType } from "@/generated/prisma/enums"

export const Route = createFileRoute("/admin/discounts")({
  beforeLoad: requireAdminRoute,
  component: DiscountsPage,
})

type DiscountForm = {
  discount_id: string
  discount_type: DiscountType
  discount_amount: number
}

const defaultValues: DiscountForm = {
  discount_id: "",
  discount_type: "PERCENTAGE",
  discount_amount: 0,
}

function formatDiscount(discount: Pick<DiscountForm, "discount_type" | "discount_amount">) {
  return discount.discount_type === "PERCENTAGE"
    ? `${discount.discount_amount}%`
    : `RM ${discount.discount_amount.toFixed(2)}`
}

function DiscountsPage() {
  const queryClient = useQueryClient()
  const [editingDiscount, setEditingDiscount] = useState<DiscountForm | null>(null)
  const [deletingDiscount, setDeletingDiscount] = useState<{ discount_id: string } | null>(null)

  const discountsQuery = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: () => getDiscounts(),
  })

  const createDiscountMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-discounts"] })
    },
  })

  const updateDiscountMutation = useMutation({
    mutationFn: updateDiscount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-discounts"] })
      setEditingDiscount(null)
    },
  })

  const deleteDiscountMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-discounts"] })
      setDeletingDiscount(null)
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createDiscountMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Discounts"
        description="Set up discount codes and rates for bookings."
        meta={<AdminStatPill label="Codes" value={discountsQuery.data?.length ?? 0} />}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <AdminSectionCard title="Create Discount" description="Create reusable promo codes for quotations and bookings.">
          <form
            className="grid gap-4 md:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field name="discount_id">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Discount Code</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    placeholder="SCHOOL10"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="discount_type">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Type</Label>
                  <select
                    id={field.name}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value as DiscountType)}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat Rate</option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="discount_amount">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Amount</Label>
                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                  />
                </div>
              )}
            </form.Field>

            <div className="space-y-2 md:col-span-3">
              <Button type="submit" disabled={createDiscountMutation.isPending}>
                {createDiscountMutation.isPending ? "Creating discount..." : "Create discount"}
              </Button>
              {createDiscountMutation.isError ? (
                <p className="text-sm text-red-600">{createDiscountMutation.error.message}</p>
              ) : null}
              {createDiscountMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createDiscountMutation.data}</p>
              ) : null}
            </div>
          </form>
      </AdminSectionCard>

      <AdminSectionCard title="Existing Discounts" description="Compare discount type, value, and edit codes.">
          {discountsQuery.isPending ? <AdminListSkeleton rows={4} /> : null}
          {discountsQuery.isError ? <p className="text-sm text-red-600">{discountsQuery.error.message}</p> : null}
          {discountsQuery.data ? (
            <div className="grid gap-3">
              {discountsQuery.data.map((discount) => (
                <AdminItemRow key={discount.discount_id} className="border-amber-100 bg-amber-50/50">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="space-y-1">
                      <p className="font-mono text-base font-semibold text-stone-900">{discount.discount_id}</p>
                      <p className="text-stone-600">{discount.discount_type === "PERCENTAGE" ? "Percentage" : "Flat rate"}</p>
                      <p className="text-lg font-bold text-[#445412]">{formatDiscount(discount)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingDiscount(discount)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingDiscount({ discount_id: discount.discount_id })}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </AdminItemRow>
              ))}
            </div>
          ) : null}
      </AdminSectionCard>

      <Modal
        open={Boolean(editingDiscount)}
        title="Edit Discount"
        description="Update discount type and amount."
        onClose={() => setEditingDiscount(null)}
      >
        {editingDiscount ? (
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              void updateDiscountMutation.mutateAsync({ data: editingDiscount })
            }}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-discount-id">Discount Code</Label>
              <Input id="edit-discount-id" value={editingDiscount.discount_id} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-discount-type">Type</Label>
              <select
                id="edit-discount-type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editingDiscount.discount_type}
                onChange={(e) =>
                  setEditingDiscount((prev) =>
                    prev ? { ...prev, discount_type: e.target.value as DiscountType } : prev
                  )
                }
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat Rate</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-discount-amount">Amount</Label>
              <Input
                id="edit-discount-amount"
                type="number"
                min={0}
                step={0.01}
                value={Number(editingDiscount.discount_amount)}
                onChange={(e) =>
                  setEditingDiscount((prev) =>
                    prev ? { ...prev, discount_amount: Number(e.target.value || 0) } : prev
                  )
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex gap-2">
                <Button type="submit" disabled={updateDiscountMutation.isPending}>
                  {updateDiscountMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingDiscount(null)}>
                  Cancel
                </Button>
              </div>
              {updateDiscountMutation.isError ? (
                <p className="text-sm text-red-600">{updateDiscountMutation.error.message}</p>
              ) : null}
            </div>
          </form>
        ) : null}
      </Modal>

      <DeleteDialog
        open={Boolean(deletingDiscount)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDiscount(null)
          }
        }}
        onConfirm={() => {
          if (!deletingDiscount) {
            return
          }
          void deleteDiscountMutation.mutateAsync({ data: deletingDiscount })
        }}
        pending={deleteDiscountMutation.isPending}
        title="Remove Discount"
        description={`This will permanently remove ${deletingDiscount?.discount_id ?? "this discount"}.`}
        confirmLabel="Confirm remove"
      />

      {deleteDiscountMutation.isError ? (
        <p className="text-sm text-red-600">{deleteDiscountMutation.error.message}</p>
      ) : null}
      {deleteDiscountMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deleteDiscountMutation.data}</p>
      ) : null}
      </div>
    </div>
  )
}

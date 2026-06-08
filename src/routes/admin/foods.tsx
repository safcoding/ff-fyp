import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { AdminItemRow, AdminPageHeader, AdminSectionCard, AdminStatPill } from "@/components/admin/AdminPageShell"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/deleteDialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { createFood, deleteFood, getFoods, updateFood } from "@/features/food/server/foodActions"

export const Route = createFileRoute("/admin/foods")({ component: FoodsPage })

type FoodForm = {
  food_name: string
  food_price: number
}

const defaultValues: FoodForm = {
  food_name: "",
  food_price: 0,
}

function FoodsPage() {
  const queryClient = useQueryClient()
  const [editingFood, setEditingFood] = useState<(FoodForm & { food_id: number }) | null>(null)
  const [editValues, setEditValues] = useState<FoodForm>(defaultValues)
  const [deletingFood, setDeletingFood] = useState<{ food_id: number; food_name: string } | null>(null)

  const foodsQuery = useQuery({
    queryKey: ["admin-foods"],
    queryFn: () => getFoods(),
  })

  const createFoodMutation = useMutation({
    mutationFn: createFood,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-foods"] })
    },
  })

  const updateFoodMutation = useMutation({
    mutationFn: updateFood,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-foods"] })
      setEditingFood(null)
    },
  })

  const deleteFoodMutation = useMutation({
    mutationFn: deleteFood,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-foods"] })
      setDeletingFood(null)
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createFoodMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  function openEditModal(food: { food_id: number } & FoodForm) {
    setEditingFood(food)
    setEditValues({
      food_name: food.food_name,
      food_price: food.food_price,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Foods"
        description="Manage food items available for group bookings."
        meta={<AdminStatPill label="Total" value={foodsQuery.data?.length ?? 0} />}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
      <AdminSectionCard title="Create Food" description="Add menu items with clear per-item pricing.">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field 
            name="food_name"
            validators={{
              onBlur: ({ value }) =>
                value.length < 0 ? 'Food Name Required' : undefined,
            }} 
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Food Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field 
            name="food_price"
            validators={{
              onBlur: ({ value }) =>
                value <= 0 ? 'Price must be RM0 or more' : undefined,
            }}            
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Food Price</Label>
                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                  />
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            <div className="space-y-2 md:col-span-2">
              <Button type="submit" disabled={createFoodMutation.isPending}>
                {createFoodMutation.isPending ? "Creating food..." : "Create food"}
              </Button>
              {createFoodMutation.isError ? (
                <p className="text-sm text-red-600">{createFoodMutation.error.message}</p>
              ) : null}
              {createFoodMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createFoodMutation.data}</p>
              ) : null}
            </div>
          </form>
      </AdminSectionCard>

      <AdminSectionCard title="Existing Foods" description="Scan current menu items and update prices.">
          {foodsQuery.isPending ? <p>Loading foods...</p> : null}
          {foodsQuery.isError ? <p className="text-sm text-red-600">{foodsQuery.error.message}</p> : null}
          {foodsQuery.data ? (
            <div className="grid gap-3">
              {foodsQuery.data.map((food) => (
                <AdminItemRow key={food.food_id}>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-stone-900">{food.food_name}</p>
                      <p className="text-stone-600">RM {Number(food.food_price).toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(food)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingFood({ food_id: food.food_id, food_name: food.food_name })}
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
        open={Boolean(editingFood)}
        title="Edit Food"
        description="Update food details."
        onClose={() => setEditingFood(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!editingFood) {
              return
            }
            void updateFoodMutation.mutateAsync({
              data: {
                food_id: editingFood.food_id,
                ...editValues,
              },
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-food-name">Food Name</Label>
            <Input
              id="edit-food-name"
              value={editValues.food_name}
              onChange={(e) => setEditValues((prev) => ({ ...prev, food_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-food-price">Food Price</Label>
            <Input
              id="edit-food-price"
              type="number"
              min={0}
              step={0.01}
              value={Number(editValues.food_price)}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, food_price: Number(e.target.value || 0) }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={updateFoodMutation.isPending}>
                {updateFoodMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingFood(null)}>
                Cancel
              </Button>
            </div>
            {updateFoodMutation.isError ? (
              <p className="text-sm text-red-600">{updateFoodMutation.error.message}</p>
            ) : null}
            {updateFoodMutation.isSuccess ? (
              <p className="text-sm text-green-700">{updateFoodMutation.data}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <DeleteDialog
        open={Boolean(deletingFood)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFood(null)
          }
        }}
        onConfirm={() => {
          if (!deletingFood) {
            return
          }
          void deleteFoodMutation.mutateAsync({ data: { food_id: deletingFood.food_id } })
        }}
        pending={deleteFoodMutation.isPending}
        title="Remove Food"
        description={`This will permanently remove ${deletingFood?.food_name ?? "this food"}.`}
        confirmLabel="Confirm remove"
      />

      {deleteFoodMutation.isError ? (
        <p className="text-sm text-red-600">{deleteFoodMutation.error.message}</p>
      ) : null}
      {deleteFoodMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deleteFoodMutation.data}</p>
      ) : null}
      </div>
    </div>
  )
}

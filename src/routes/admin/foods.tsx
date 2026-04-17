import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFood, getFoods } from "@/serverActions/foodActions"

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

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createFoodMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Food</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field name="food_name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Food Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="food_price">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Food Price</Label>
                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    step={1}
                    value={Number(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                  />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Foods</CardTitle>
        </CardHeader>
        <CardContent>
          {foodsQuery.isPending ? <p>Loading foods...</p> : null}
          {foodsQuery.isError ? <p className="text-sm text-red-600">{foodsQuery.error.message}</p> : null}
          {foodsQuery.data ? (
            <div className="space-y-3">
              {foodsQuery.data.map((food) => (
                <div key={food.food_id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{food.food_name}</p>
                  <p>Price: {food.food_price}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

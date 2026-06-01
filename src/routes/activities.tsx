import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/activities')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/activities"!</div>
}

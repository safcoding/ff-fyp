import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return await auth.handler(request)
        } catch (err) {
          console.error('[better-auth] GET handler failed', err)
          return new Response(
            JSON.stringify({
              error: 'Internal Server Error',
              message: err instanceof Error ? err.message : String(err),
            }),
            { status: 500, headers: { 'content-type': 'application/json' } },
          )
        }
      },
      POST: async ({ request }) => {
        try {
          return await auth.handler(request)
        } catch (err) {
          console.error('[better-auth] POST handler failed', err)
          return new Response(
            JSON.stringify({
              error: 'Internal Server Error',
              message: err instanceof Error ? err.message : String(err),
            }),
            { status: 500, headers: { 'content-type': 'application/json' } },
          )
        }
      },
    },
  },
})

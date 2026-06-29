import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const adminUserIds = process.env.BETTER_AUTH_ADMIN_USER_IDS
  ? process.env.BETTER_AUTH_ADMIN_USER_IDS.split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  : undefined

const trustedOrigins = [
  'http://localhost:3000',
  'https://ff-fyp.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.PUBLIC_APP_URL,
  process.env.VITE_PUBLIC_APP_URL,
  process.env.APP_URL,
]
  .filter((origin): origin is string => Boolean(origin))
  .map((origin) => origin.replace(/\/$/, ''))

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins,
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
      adminUserIds,

    }),
    tanstackStartCookies(),
  ],
})

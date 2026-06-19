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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: [
    'http://localhost:3000',
    'https://ff-fyp.vercel.app',
    'https://ff-fyp-git-optimization-safcodings-projects.vercel.app/login',
  ],
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
      adminUserIds,

    }),
    tanstackStartCookies(),
  ],
})

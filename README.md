# Farm Fresh @ UPM Booking System

A TanStack Start web application for Farm Fresh @ UPM tour package discovery, booking submission, booking administration, package management, slot management, and PDF quotation/report generation.

## Tech Stack

- React 19 with TanStack Start and TanStack Router
- TanStack Query for client/server data fetching
- Prisma with PostgreSQL/Neon
- Better Auth for authentication
- Tailwind CSS for styling
- React PDF for quotation and monthly report generation
- Unpic for optimized image rendering
- Vercel for deployment

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not available, create `.env.local` manually and provide the variables listed in the environment section below.

Start the development server:

```bash
npm run dev
```

The app runs on:

```txt
http://localhost:3000
```

## Environment Variables

Required for database/auth:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
```

Optional/admin related:

```env
BETTER_AUTH_ADMIN_USER_IDS="user_id_1,user_id_2"
PUBLIC_APP_URL="http://localhost:3000"
VITE_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

Required for booking approval emails:

```env
SMTP_HOST="..."
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="Farm Fresh @ UPM <noreply@example.com>"
```

Optional test email target:

```env
TEST_EMAIL_TO="you@example.com"
```

Generate a Better Auth secret with:

```bash
npx -y @better-auth/cli secret
```

## Database

Generate the Prisma client:

```bash
npm run db:generate
```

Apply schema changes locally with a migration:

```bash
npm run db:migrate
```

Push schema changes directly when a migration is not needed:

```bash
npm run db:push
```

Open Prisma Studio:

```bash
npm run db:studio
```

Seed data:

```bash
npm run db:seed
```

Indexes defined in `prisma/schema.prisma` must be applied to the real database with a Prisma migration or `db:push`. Editing the schema alone does not update the deployed database.

## Available Scripts

```bash
npm run dev       # Start local development server
npm run build     # Build production output
npm run preview   # Preview production build
npm run test      # Run Vitest tests
npm run lint      # Run ESLint
npm run format    # Check Prettier formatting
npm run check     # Write Prettier formatting and auto-fix ESLint
```

## Project Structure

```txt
src/routes/                 File-based app routes
src/routes/admin/           Protected admin pages
src/components/             Shared UI and feature components
src/features/*/server/      Server actions and business logic
src/schemas/                Zod schemas and shared input types
src/lib/                    Auth, guards, and shared utilities
src/generated/prisma/       Generated Prisma client files
prisma/schema.prisma        Database schema
public/                     Static images, icons, manifest, robots.txt
```

## Images And Icons

Static assets live in `public/` and are referenced from the site root. For example:

```txt
public/ff-logo.ico -> /ff-logo.ico
public/banner.webp -> /banner.webp
```

The browser favicon and site title are configured in:

```txt
src/routes/__root.tsx
```

For large public images:

- Prefer WebP for compatibility and size.
- Use `1920 x 1080` for full-width hero images.
- Use smaller responsive versions where possible, such as `1280 x 720` and `768 x 432`.
- Keep hero images roughly `200 KB - 500 KB` when quality allows.
- Use `@unpic/react`'s `Image` component for rendered public images.

## Admin Performance Notes

The admin booking page uses server-side filtering and pagination instead of loading all bookings in the browser. PDF generation libraries are dynamically imported only when generating quotation or monthly report downloads, so they do not block the initial admin bookings route.

Admin pages also use:

- Route-level pending feedback
- Skeleton loading states
- TanStack Query stale times to reduce repeated fetches
- Prisma indexes for common booking filters and sorting

## CI/CD

This project is suitable for a GitHub Actions pipeline that runs:

```bash
npm ci
npm run lint
npm run build
npm run test -- --passWithNoTests
```

For Vercel deployment, configure the same required environment variables in the Vercel project settings.

Recommended workflow:

1. Push changes to GitHub.
2. GitHub Actions runs lint, build, and tests.
3. Vercel creates a preview deployment for pull requests.
4. Merging to the production branch triggers the production deployment.

## Deployment

The app is deployed on Vercel. Before deploying, make sure:

- `DATABASE_URL` points to the production database.
- `BETTER_AUTH_SECRET` is set.
- SMTP variables are set if approval emails are enabled.
- Prisma schema changes have been applied to the production database.
- The production build passes locally with `npm run build`.

## Common Checks

Run before opening a pull request:

```bash
npm run lint
npm run build
npm run test -- --passWithNoTests
```

If CI fails, read the failing step first. Lint failures usually mean code style or TypeScript-aware ESLint rules need fixing. Build failures usually mean a TypeScript, bundling, server/client boundary, or environment issue.

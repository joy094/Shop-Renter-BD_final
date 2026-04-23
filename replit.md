# Dokan Bhara — Shop Rental Manager

Bilingual (Bangla / English) shop rental management web app for small landlords in Bangladesh.

## Demo login
- Username: `admin`
- Password: `admin123`

## Artifacts
- `artifacts/rental-admin` — React + Vite frontend (path `/`)
- `artifacts/api-server` — Express API backend (path `/api`)

## Stack
- React + Vite + TanStack Query + shadcn/ui + Recharts
- Express + Drizzle ORM + PostgreSQL
- HMAC-signed cookie session (`SESSION_SECRET`)
- OpenAPI spec → orval-generated typed client + Zod validators

## Key paths
- API spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/index.ts`
- Backend routes: `artifacts/api-server/src/routes/`
- Frontend pages: `artifacts/rental-admin/src/pages/`
- i18n provider: `artifacts/rental-admin/src/lib/i18n.tsx` (modes: `bn` / `en` / `both`)
- Seed script: `scripts/src/seed-rental.ts` — run with `pnpm --filter @workspace/scripts run seed-rental`

## Features
- Dashboard summary (occupied/vacant shops, expected/collected/outstanding rent)
- Tenants CRUD with NID, phone, address, notes
- Shops CRUD with location, size, monthly rent, deposit, lease assignment
- Monthly payment tracking with paid / unpaid / partial status
- Generate-monthly: bulk-creates payment records for all occupied shops
- Reports: monthly collection chart, occupancy donut, top tenants
- Bilingual labels everywhere; Bangla numerals for currency; Noto Sans Bengali font
- Mobile-responsive sidebar nav (Dashboard, Tenants, Shops, Payments, Reports, Settings)

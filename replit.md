# Dokan Bhara — Shop Rental Manager (MERN)

Bilingual (Bangla / English) shop rental management web app for small landlords in Bangladesh.

## Stack (MERN, plain JavaScript)
- **M**ongoDB + Mongoose (in-memory dev server by default; swap in MongoDB Atlas via `MONGODB_URI`)
- **E**xpress 4 (plain JS, ES modules)
- **R**eact 19 + Vite + React Router (plain JSX)
- **N**ode 20+

## Demo login
- Username: `admin`
- Password: `admin123`

## Artifacts
- `artifacts/rental-admin` — React + Vite frontend (path `/`, port 22114)
- `artifacts/api-server` — Express API backend (path `/api`, port 8080)

## Key paths
- Backend models: `artifacts/api-server/src/models/`
- Backend routes: `artifacts/api-server/src/routes/`
- DB connection + auto-seed: `artifacts/api-server/src/lib/db.js`, `seed.js`
- Session auth (HMAC cookie): `artifacts/api-server/src/lib/session.js`
- Frontend pages: `artifacts/rental-admin/src/pages/`
- API client: `artifacts/rental-admin/src/api.js`
- i18n provider (bn / en / both): `artifacts/rental-admin/src/i18n.jsx`

## Database
- By default uses **mongodb-memory-server** — a real MongoDB that runs in-process. Data is reset on backend restart and re-seeded automatically.
- To use a persistent MongoDB (e.g. MongoDB Atlas), set the `MONGODB_URI` environment variable.

## Features
- Dashboard with monthly summary (occupied/vacant, expected/collected/outstanding)
- Tenants CRUD (name, phone, NID, address, email, notes)
- Shops CRUD (code, location, size, monthly rent, deposit, lease assignment)
- Payments: monthly tracking with paid / unpaid / partial; "generate monthly bills" bulk action; filters by month/status
- Reports: monthly collection bar chart, occupancy donut, top tenants
- Bilingual everywhere (Bangla numerals for currency, Noto Sans Bengali font)
- Mobile-responsive sidebar layout
- Change password from settings

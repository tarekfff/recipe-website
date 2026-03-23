# Recipe Platform

A full-stack recipe management platform built with Next.js 14, Prisma, and PostgreSQL.

## 🚀 Getting Started

Follow these steps to run the Next.js platform and PostgreSQL database locally.

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Because this is a secure application, **there are no root passwords hardcoded in the repository**. You must define your own passwords.

```bash
cp .env.example .env
```
Open `.env` and fill out the database and admin setup variables:
- `POSTGRES_USER` and `POSTGRES_PASSWORD` (Your database credentials)
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (Your production Admin login)

### 3. Start PostgreSQL Database (Docker)
The `docker-compose.yml` file is configured to read directly from your `.env` file.

```bash
docker compose up postgres -d
```

### 4. Initialize Database & Seed Data
Run the Prisma migrations to build the tables, then seed the initial mock data and create your Admin user:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npx tsx seed-admin.ts
```

### 5. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Accessing the Admin Panel

The Admin panel is protected by NextAuth credentials. You can log in using the `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` you configured in your `.env` file during step 2.

Admin Login URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🌐 Public API Endpoints

All endpoints return `{ success, data, message, pagination? }`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | List recipes (paginated) |
| GET | `/api/recipes/:slug` | Get recipe by slug |
| POST | `/api/recipes` | Create recipe (auth) |
| PUT | `/api/recipes/:slug` | Update recipe (auth) |
| DELETE | `/api/recipes/:slug` | Soft delete (auth) |
| GET | `/api/categories` | List categories |
| GET | `/api/chefs` | List chefs |
| POST | `/api/feedback` | Submit review |
| POST | `/api/newsletter` | Subscribe |
| GET | `/api/analytics/overview` | Dashboard stats (auth) |
| GET | `/api/system/health` | Health check |

### Query Parameters
- `?page=1&limit=20` — pagination
- `?sortBy=viewCount&order=desc` — sorting
- `?category=desserts&difficulty=EASY` — filtering
- `?q=hummus` — search
- `?lang=ar` — Arabic content

---

## 🤖 N8N / Automation Integration

1. Go to Admin → Settings → API Keys
2. Click **Generate New API Key**
3. Copy the key (shown **once only**)
4. In N8N HTTP Request node, add header:
   ```
   X-API-Key: rcp_your_key_here
   ```

**Example N8N setup:**
```
Method: GET
URL: http://yoursite.com/api/recipes?status=published&limit=50
Headers: X-API-Key → rcp_xxx...
```

This works for **any** `/api/*` endpoint.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/              → REST API Route Handlers
│   │   ├── auth/         → next-auth
│   │   ├── recipes/      → CRUD
│   │   ├── categories/   → CRUD + reorder
│   │   ├── chefs/        → CRUD
│   │   ├── feedback/     → submit + manage
│   │   ├── newsletter/   → subscribe
│   │   ├── analytics/    → dashboard stats
│   │   ├── apikeys/      → manage API keys
│   │   └── system/       → health + settings
│   ├── admin/            → Password-protected admin panel
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── recipes/
│   │   ├── feedback/
│   │   └── settings/
│   ├── recipes/          → Public recipe pages (SSG+ISR)
│   ├── page.tsx          → Homepage
│   ├── sitemap.ts        → Dynamic sitemap
│   └── robots.ts
├── lib/
│   ├── db.ts             → Prisma singleton
│   ├── auth.ts           → next-auth config
│   └── api-auth.ts       → X-API-Key + RBAC helpers
├── middleware.ts          → Protect /admin routes
└── components/
    └── admin/
```

---

## 🔐 Auth

- **Session auth**: `next-auth` credentials provider (email + password)
- **API auth**: `X-API-Key` header (for N8N, Zapier, etc.)
- **RBAC**: SUPER_ADMIN > ADMIN > EDITOR > VIEWER

---

## 📊 SEO

- JSON-LD Recipe structured data on every recipe page
- Dynamic `sitemap.xml` auto-built from published content
- `robots.txt` configured to block `/admin` and `/api`
- SSG + ISR (revalidate: 60s) for recipe detail pages
- `generateMetadata` for per-page meta tags

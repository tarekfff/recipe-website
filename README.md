# Recipe Platform

A full-stack recipe management platform built with Next.js 14, Prisma, and PostgreSQL.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Start PostgreSQL (Docker)
```bash
docker run --name recipe-pg \
  -e POSTGRES_DB=recipe_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres:15
```

Or with Docker Compose (if you have docker-compose.yml):
```bash
docker-compose up -d
```

### 4. Set up database
```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Admin Credentials

```
Email:    admin@recipe.com
Password: Admin@123456
```

Admin Panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

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

# Recipe Platform MVP — Full Specification
> AI Agent Build Guide: WordPress → Custom Coded Platform Migration

---

## 📋 Project Overview

**Project Name:** Recipe Management Platform  
**Type:** Full-Stack Web Application (API + Admin Panel + Public Frontend)  
**Goal:** Replace WordPress with a fast, scalable, SEO-optimized custom-coded platform  
**Stack Recommendation:** Next.js 14 (App Router) + Node.js/Express API + PostgreSQL + Redis

### Why Move from WordPress?
| Problem (WordPress) | Solution (Custom Code) |
|---|---|
| Slow page loads (plugins bloat) | SSR/SSG with Next.js = sub-1s loads |
| No fine-grained control | Full control over every byte served |
| Plugin conflicts & vulnerabilities | Zero plugin dependencies |
| Poor Core Web Vitals | Optimized images, lazy loading, CDN |
| SEO via plugins only | Built-in SEO engine (like RankMath) |
| Hard to scale | Stateless API, horizontal scaling |

---

## 🏗️ Tech Stack

### Frontend (Public Website)
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **State:** Zustand / React Query (TanStack Query)
- **Images:** Next.js Image component with WebP/AVIF auto-conversion

### Admin Panel
- **Framework:** Next.js 14 (separate `/admin` route group or standalone app)
- **UI Components:** shadcn/ui + Tailwind CSS
- **Rich Text Editor:** TipTap (recipe instructions, descriptions)
- **Charts:** Recharts (analytics dashboard)
- **Tables:** TanStack Table (data grids with sorting/filtering)

### Backend API
- **Runtime:** Node.js 20+
- **Framework:** Express.js or Fastify
- **ORM:** Prisma (type-safe DB queries)
- **Database:** PostgreSQL 15
- **Cache:** Redis (API responses, sessions)
- **Auth:** JWT + Refresh Tokens + bcrypt
- **File Upload:** Multer + Sharp (image optimization) + Cloudinary or S3
- **Search:** PostgreSQL Full-Text Search (or Meilisearch for advanced)
- **Email:** Nodemailer + SendGrid (newsletter)
- **Queue:** BullMQ (background jobs: image processing, email sends)

### Infrastructure
- **Hosting:** Vercel (Next.js) + Railway/Render (API) or VPS (DigitalOcean)
- **CDN:** Cloudflare
- **Monitoring:** Sentry (errors) + PostHog (analytics)
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```
recipe-platform/
├── apps/
│   ├── web/                    # Public Next.js website
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx              # Homepage
│   │   │   │   ├── recipes/
│   │   │   │   │   ├── page.tsx          # Recipe listing
│   │   │   │   │   └── [slug]/page.tsx   # Recipe detail (SEO-optimized)
│   │   │   │   ├── categories/
│   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   ├── chefs/
│   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   └── search/page.tsx
│   │   │   └── sitemap.ts
│   │   └── components/
│   │       ├── RecipeCard.tsx
│   │       ├── RecipeSchema.tsx   # JSON-LD structured data
│   │       └── SEOHead.tsx
│   │
│   └── admin/                  # Admin Panel Next.js app
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login/page.tsx
│       │   └── (dashboard)/
│       │       ├── dashboard/page.tsx
│       │       ├── recipes/
│       │       │   ├── page.tsx          # List + search
│       │       │   ├── new/page.tsx
│       │       │   └── [id]/page.tsx     # Edit
│       │       ├── categories/
│       │       ├── chefs/
│       │       ├── feedback/
│       │       ├── seo/
│       │       ├── newsletter/
│       │       └── settings/
│       └── components/
│
└── api/                        # Express/Fastify REST API
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── recipes.ts
    │   │   ├── categories.ts
    │   │   ├── chefs.ts
    │   │   ├── feedback.ts
    │   │   ├── seo.ts
    │   │   ├── newsletter.ts
    │   │   ├── media.ts
    │   │   └── admin/system.ts
    │   ├── middleware/
    │   │   ├── auth.ts           # JWT verification
    │   │   ├── rbac.ts           # Role-based access
    │   │   ├── rateLimiter.ts
    │   │   └── errorHandler.ts
    │   ├── services/
    │   │   ├── imageService.ts
    │   │   ├── seoService.ts
    │   │   ├── searchService.ts
    │   │   └── emailService.ts
    │   └── prisma/
    │       └── schema.prisma
```

---

## 🗄️ Database Schema

```prisma
// prisma/schema.prisma

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  password     String
  name         String
  role         Role      @default(EDITOR)
  createdAt    DateTime  @default(now())
  auditLogs    AuditLog[]
}

enum Role {
  SUPER_ADMIN
  ADMIN
  EDITOR
  VIEWER
}

model Recipe {
  id              String      @id @default(cuid())
  slug            String      @unique
  title           String
  titleAr         String?     // Arabic translation
  description     String
  descriptionAr   String?
  ingredients     Json        // Array of {name, amount, unit}
  instructions    Json        // Array of {step, text, image?}
  prepTime        Int         // minutes
  cookTime        Int         // minutes
  servings        Int
  difficulty      Difficulty
  calories        Int?
  featuredImage   String      // URL
  videoUrl        String?
  status          Status      @default(DRAFT)
  viewCount       Int         @default(0)
  publishedAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  category        Category    @relation(fields: [categoryId], references: [id])
  categoryId      String
  chef            Chef?       @relation(fields: [chefId], references: [id])
  chefId          String?
  tags            Tag[]
  feedback        Feedback[]
  seo             RecipeSEO?
  images          RecipeImage[]
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Category {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  nameAr      String?
  description String?
  image       String?
  order       Int       @default(0)
  recipes     Recipe[]
  seo         CategorySEO?
}

model Chef {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  bio         String?
  avatar      String?
  social      Json?     // {instagram, youtube, facebook}
  recipes     Recipe[]
}

model Tag {
  id       String   @id @default(cuid())
  name     String   @unique
  slug     String   @unique
  recipes  Recipe[]
}

model Feedback {
  id        String   @id @default(cuid())
  recipeId  String
  recipe    Recipe   @relation(fields: [recipeId], references: [id])
  name      String
  email     String?
  rating    Int      // 1-5
  comment   String
  status    FeedbackStatus @default(PENDING)
  createdAt DateTime @default(now())
}

enum FeedbackStatus {
  PENDING
  APPROVED
  REJECTED
}

model RecipeSEO {
  id              String  @id @default(cuid())
  recipeId        String  @unique
  recipe          Recipe  @relation(fields: [recipeId], references: [id])
  metaTitle       String?
  metaDescription String?
  focusKeyword    String?
  keywords        String[]
  ogImage         String?
  canonicalUrl    String?
  noIndex         Boolean @default(false)
  schemaEnabled   Boolean @default(true) // Recipe structured data
}

model CategorySEO {
  id              String    @id @default(cuid())
  categoryId      String    @unique
  category        Category  @relation(fields: [categoryId], references: [id])
  metaTitle       String?
  metaDescription String?
  focusKeyword    String?
}

model Newsletter {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  status      NewsletterStatus @default(ACTIVE)
  subscribedAt DateTime @default(now())
}

enum NewsletterStatus {
  ACTIVE
  UNSUBSCRIBED
}

model NewsletterCampaign {
  id        String   @id @default(cuid())
  subject   String
  body      String   // HTML content
  sentAt    DateTime?
  sentCount Int      @default(0)
  status    CampaignStatus @default(DRAFT)
  createdAt DateTime @default(now())
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENT
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String   // CREATE, UPDATE, DELETE
  resource   String   // recipe, category, etc.
  resourceId String
  changes    Json?    // diff of what changed
  ipAddress  String?
  createdAt  DateTime @default(now())
}

model ErrorLog {
  id        String   @id @default(cuid())
  level     String   // error, warn, info
  message   String
  stack     String?
  context   Json?
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
}

model SiteSettings {
  id            String @id @default("singleton")
  siteName      String @default("Recipe Platform")
  siteUrl       String
  logo          String?
  favicon       String?
  defaultLanguage String @default("en")
  maintenanceMode Boolean @default(false)
  analyticsId   String?  // Google Analytics
  socialLinks   Json?
  updatedAt     DateTime @updatedAt
}
```

---

## 🔌 REST API Endpoints

### Authentication
```
POST   /api/auth/login              # Admin login → JWT token
POST   /api/auth/refresh            # Refresh token
POST   /api/auth/logout
GET    /api/auth/me
```

### Recipes (Public)
```
GET    /api/recipes                  # List (paginated, filtered)
GET    /api/recipes/:slug            # Single recipe by slug
GET    /api/recipes/featured         # Featured recipes
GET    /api/recipes/search?q=        # Full-text search
GET    /api/recipes/category/:slug   # By category
GET    /api/recipes/chef/:slug       # By chef
```

### Recipes (Admin)
```
GET    /api/admin/recipes            # All with status filter
POST   /api/admin/recipes            # Create
PUT    /api/admin/recipes/:id        # Update
DELETE /api/admin/recipes/:id        # Delete
POST   /api/admin/recipes/:id/publish
POST   /api/admin/recipes/:id/duplicate
```

### Categories
```
GET    /api/categories               # Public list
GET    /api/admin/categories         # Admin list
POST   /api/admin/categories         # Create
PUT    /api/admin/categories/:id     # Update
DELETE /api/admin/categories/:id     # Delete
PUT    /api/admin/categories/reorder # Drag-and-drop order
```

### Chefs
```
GET    /api/chefs                    # Public list
GET    /api/chefs/:slug              # Public profile
GET    /api/admin/chefs              # Admin list
POST   /api/admin/chefs              # Create
PUT    /api/admin/chefs/:id          # Update
DELETE /api/admin/chefs/:id          # Delete
```

### Feedback
```
POST   /api/feedback                 # Public: submit feedback
GET    /api/admin/feedback           # Admin: list (filterable by status)
PUT    /api/admin/feedback/:id/approve
PUT    /api/admin/feedback/:id/reject
DELETE /api/admin/feedback/:id
```

### Media
```
POST   /api/admin/media/upload       # Upload image → returns optimized URL
POST   /api/admin/media/upload-video
DELETE /api/admin/media/:id
GET    /api/admin/media              # Media library
```

### SEO
```
GET    /api/seo/sitemap.xml          # Auto-generated sitemap
GET    /api/seo/robots.txt
PUT    /api/admin/seo/recipe/:id     # Update recipe SEO
PUT    /api/admin/seo/category/:id   # Update category SEO
GET    /api/admin/seo/analysis/:recipeId  # SEO score & suggestions
```

### Newsletter
```
POST   /api/newsletter/subscribe     # Public subscribe
GET    /api/newsletter/unsubscribe   # Unsubscribe via email link
GET    /api/admin/newsletter/subscribers
DELETE /api/admin/newsletter/subscribers/:id
POST   /api/admin/newsletter/campaigns       # Create campaign
POST   /api/admin/newsletter/campaigns/:id/send
```

### Analytics
```
GET    /api/admin/analytics/overview         # Totals: recipes, categories, views
GET    /api/admin/analytics/top-recipes      # Most viewed
GET    /api/admin/analytics/traffic          # Views over time
```

### System (Admin)
```
POST   /api/admin/system/backup              # Trigger DB backup
GET    /api/admin/system/backups             # List backups
POST   /api/admin/system/restore/:backupId
GET    /api/admin/system/audit-logs          # Audit log viewer
GET    /api/admin/system/error-logs          # Error log viewer
PUT    /api/admin/system/settings            # Update site settings
GET    /api/admin/system/health              # System health check
```

---

## 🎨 Admin Panel Pages

### 1. Dashboard `/admin/dashboard`
- **Stats cards:** Total recipes, categories, chefs, pending feedback, newsletter subscribers
- **Charts:** Recipe views over last 30 days (line chart), Top 10 recipes (bar chart), Feedback by rating (pie chart)
- **Recent activity:** Latest feedback, recently published recipes
- **Quick actions:** Add recipe, Approve feedback

### 2. Recipe Management `/admin/recipes`
- **List view:** Table with columns: thumbnail, title, category, status, views, date
- **Filters:** Status (draft/published/archived), category, chef, date range
- **Search:** Real-time title search
- **Bulk actions:** Publish, Archive, Delete selected
- **Recipe Editor `/admin/recipes/new` & `/admin/recipes/[id]`:**
  - Title + slug (auto-generated, editable)
  - Multi-language tabs (EN / AR)
  - TipTap rich text for description
  - Ingredients builder (add/remove rows: name, amount, unit)
  - Step-by-step instructions builder (drag to reorder, add image per step)
  - Featured image upload with preview
  - Video URL field
  - Prep time, cook time, servings, difficulty, calories
  - Category & tags selector
  - Chef assignment
  - Status toggle (Draft / Published)
  - **SEO Panel (like RankMath):**
    - SEO Score gauge (0–100)
    - Focus keyword input
    - Meta title + meta description with character counters
    - Preview: Google snippet & social share card
    - Keyword analysis: title, slug, description, content density
    - OG image upload
    - No-index toggle
    - Canonical URL
    - **Recipe Schema toggle** (enables JSON-LD structured data)

### 3. Category Management `/admin/categories`
- Grid or list view with drag-and-drop reorder
- CRUD modal or page: name (EN/AR), slug, description, image, SEO fields

### 4. Chef Management `/admin/chefs`
- List with avatar, name, recipe count
- CRUD: name, slug, bio, avatar upload, social links

### 5. Feedback Management `/admin/feedback`
- Table: reviewer name, recipe, rating (stars), comment, date, status
- Approve / Reject / Delete actions
- Filter by status and rating

### 6. SEO Center `/admin/seo`
- Global SEO settings (site meta title template, meta description)
- Sitemap generator (auto + manual trigger)
- Robots.txt editor
- Redirect manager (301/302)
- SEO health overview: recipes without meta description, missing focus keywords

### 7. Newsletter `/admin/newsletter`
- **Subscribers tab:** table, export CSV, delete
- **Campaigns tab:** list campaigns, create new (subject, HTML editor), send or schedule

### 8. System Settings `/admin/settings`
- Site name, URL, logo, favicon
- Default language
- Google Analytics ID
- Social media links
- Maintenance mode toggle
- **Database:** Manual backup trigger, list backups, restore
- **Audit Logs:** paginated table of all admin actions
- **Error Logs:** paginated, filterable error log with resolve toggle

---

## 🔍 SEO Engine (Like RankMath)

### Recipe Card / Structured Data (Like WP Recipe Maker)
Every published recipe generates JSON-LD in the `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Classic Hummus",
  "image": ["https://cdn.example.com/hummus.webp"],
  "author": { "@type": "Person", "name": "Chef Ahmed" },
  "datePublished": "2024-01-15",
  "description": "Creamy homemade hummus...",
  "prepTime": "PT10M",
  "cookTime": "PT0M",
  "totalTime": "PT10M",
  "keywords": "hummus, chickpeas, Middle Eastern",
  "recipeYield": "4 servings",
  "recipeCategory": "Appetizer",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "180 calories"
  },
  "recipeIngredient": ["2 cups chickpeas", "3 tbsp tahini"],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "name": "Blend ingredients",
      "text": "Add all ingredients to a food processor..."
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "124"
  }
}
```

### SEO Score Calculator (Admin Panel)
Checks and scores (0–100) based on:
- [ ] Focus keyword in title (+10)
- [ ] Focus keyword in slug (+10)
- [ ] Focus keyword in meta description (+10)
- [ ] Focus keyword in first paragraph (+10)
- [ ] Meta title length 50–60 chars (+10)
- [ ] Meta description length 120–160 chars (+10)
- [ ] Has featured image with alt text (+10)
- [ ] Content length > 300 words (+10)
- [ ] Internal links present (+5)
- [ ] Recipe schema enabled (+5)

### Sitemap Auto-Generation
- `/sitemap.xml` — auto-updates on publish/unpublish
- Includes: recipes, categories, chefs pages
- Ping Google/Bing on update

---

## ⚡ Performance Targets (Post-Migration)

| Metric | WordPress (typical) | Target (Custom) |
|---|---|---|
| LCP | 3–6s | < 1.5s |
| FID/INP | 200–500ms | < 50ms |
| CLS | > 0.1 | < 0.05 |
| Time to First Byte | 500–1500ms | < 200ms |
| PageSpeed Score | 40–60 | > 90 |
| Bundle Size | 1–3MB (JS) | < 150KB (JS) |

### How to Achieve This
- **Next.js SSG** for recipe pages — pre-built HTML, served from CDN
- **ISR (Incremental Static Regeneration)** — revalidate recipe pages on update
- **Image optimization:** WebP/AVIF, lazy loading, blur placeholder, Next.js `<Image>`
- **Redis caching** on API: recipe lists cache for 5 minutes, invalidate on update
- **Code splitting:** each page only loads what it needs
- **Cloudflare CDN** for static assets and edge caching
- **No jQuery, no page builder bloat**

---

## 🔐 Authentication & Security

### JWT Auth Flow
1. Admin logs in → API returns `accessToken` (15min) + `refreshToken` (7d, httpOnly cookie)
2. Every API request sends `Authorization: Bearer <accessToken>`
3. On expiry, auto-refresh using `refreshToken`
4. Logout clears cookie + blacklists refresh token in Redis

### Role-Based Access Control
| Role | Recipes | Categories | Chefs | Feedback | SEO | System |
|---|---|---|---|---|---|---|
| SUPER_ADMIN | Full | Full | Full | Full | Full | Full |
| ADMIN | Full | Full | Full | Full | Full | View only |
| EDITOR | Own recipes | View | View | View | Own | — |
| VIEWER | View | View | View | View | View | — |

### Security Measures
- Helmet.js (HTTP security headers)
- Rate limiting: 100 req/15min public, 500 req/15min admin
- Input validation: Zod schemas on all endpoints
- SQL injection: impossible via Prisma ORM
- XSS: sanitize HTML content with DOMPurify (server-side)
- CORS: whitelist frontend domains only
- File upload: validate MIME type + max 10MB, virus scan optional

---

## 🌍 Multi-Language Support

- All content models have `nameAr`, `descriptionAr` etc. fields
- API returns language based on `Accept-Language` header or `?lang=ar`
- Admin panel has language tabs on recipe/category editors
- Frontend uses Next.js i18n routing: `/en/recipes/slug` and `/ar/recipes/slug`
- RTL support for Arabic via Tailwind `rtl:` prefix

---

## 📦 MVP Phases

### Phase 1 — Core (Week 1–3)
- [ ] Project setup (monorepo, CI/CD, DB)
- [ ] Auth system (login, JWT, roles)
- [ ] Recipe CRUD API
- [ ] Category CRUD API
- [ ] Admin panel: Dashboard, Recipe list, Recipe editor (basic)
- [ ] Public website: Homepage, Recipe listing, Recipe detail page

### Phase 2 — Content Features (Week 4–5)
- [ ] Chef management
- [ ] Feedback system (submit + admin approve)
- [ ] Image upload + optimization pipeline
- [ ] SEO fields + JSON-LD recipe schema
- [ ] Search functionality

### Phase 3 — SEO & Marketing (Week 6)
- [ ] SEO score calculator in admin
- [ ] Sitemap auto-generation
- [ ] Newsletter subscribe + admin management
- [ ] Multi-language content (EN + AR)

### Phase 4 — System & Polish (Week 7–8)
- [ ] Audit logs
- [ ] Error logging
- [ ] Database backup/restore
- [ ] System settings page
- [ ] Performance audit + optimization
- [ ] Analytics dashboard
- [ ] Full testing + deployment

---

## 🛠️ Development Setup

```bash
# Clone and install
git clone https://github.com/your-org/recipe-platform
cd recipe-platform
npm install

# Environment variables
cp .env.example .env
# Fill in: DATABASE_URL, REDIS_URL, JWT_SECRET, CLOUDINARY_URL, SENDGRID_API_KEY

# Database
npx prisma migrate dev --name init
npx prisma db seed   # seed demo data

# Start development
npm run dev:api      # API on :3001
npm run dev:web      # Public site on :3000
npm run dev:admin    # Admin panel on :3002
```

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/recipes

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=another-secret

# File Storage (Cloudinary or S3)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# OR
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Email
SENDGRID_API_KEY=
EMAIL_FROM=noreply@yoursite.com

# App
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📊 Analytics & Monitoring

### Built-in Analytics (No Third Party Required for MVP)
- Recipe view counter (increment on page load, debounced)
- Feedback count per recipe
- Top recipes by views
- Subscriber growth over time

### Optional Integrations
- **Google Analytics 4** — via site settings GA ID
- **PostHog** — self-hosted event analytics
- **Sentry** — error monitoring (add DSN to env)

---

## 📋 Checklist for AI Agent

When building this platform, ensure:

**Backend**
- [ ] All API routes return consistent JSON: `{ success, data, message, pagination? }`
- [ ] All errors return `{ success: false, error: string, statusCode: number }`
- [ ] Pagination on all list endpoints: `?page=1&limit=20`
- [ ] Sorting on list endpoints: `?sortBy=createdAt&order=desc`
- [ ] Filtering: `?status=published&category=desserts`
- [ ] Soft delete on recipes (add `deletedAt` field, filter in queries)
- [ ] All image URLs served through CDN, not local disk
- [ ] Background queue for image processing (don't block API response)

**Frontend (Public)**
- [ ] All recipe pages use `generateStaticParams` for SSG
- [ ] `<Image>` component for all images (never `<img>`)
- [ ] JSON-LD script in `<head>` on recipe pages
- [ ] `<meta>` tags: title, description, og:image, og:type on every page
- [ ] `robots.txt` and `sitemap.xml` accessible at root
- [ ] 404 page for unpublished/deleted recipes
- [ ] Loading skeletons (not spinners) for all async content

**Admin Panel**
- [ ] All forms use React Hook Form + Zod validation
- [ ] Optimistic UI updates on CRUD operations
- [ ] Confirm dialog before delete actions
- [ ] Toast notifications for all actions (success + error)
- [ ] Unsaved changes warning when leaving editor
- [ ] Mobile responsive (usable on tablet minimum)
- [ ] SEO panel visible on recipe editor as a right sidebar
- [ ] Character counters on meta title (60) and meta description (160)
- [ ] Real-time slug generation from title (with manual override)

**Security**
- [ ] Admin routes protected by middleware (redirect to login if no valid token)
- [ ] Public API has rate limiting
- [ ] File uploads validate type and size before processing
- [ ] No sensitive data in API responses (never return password hashes)

---

*Generated MVP Spec — Recipe Platform Migration from WordPress*  
*Use this document as the single source of truth for AI agent code generation.*
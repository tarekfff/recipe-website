# 🚢 Deployment Guide: Live Server Sync

This guide explains how to deploy and update **Graceful Recipes** on a live production server using Docker and Traefik.

## 🏗️ Architecture Overview
The platform is designed to be self-updating. Instead of complex CI/CD pipelines, the production container is configured to sync directly with the GitHub repository on startup.

- **Orchestration**: Docker Compose
- **Reverse Proxy**: Traefik (with automated TLS/SSL)
- **Database**: PostgreSQL 15 (Isolated)

---

## 🚀 Initial Setup

1. **Prerequisites**:
   - Docker & Docker Compose installed on the server.
   - A running Traefik instance on the `n8n_default` network (standard for many automation setups).

2. **Configuration**:
   Copy `docker-compose.live.yml` to your server. You can customize the following variables in the file:
   - `DOMAIN_NAME`: Your site's domain (e.g., `recipes.com`).
   - `SITE_NAME`: Internal identifier for Traefik.
   - `DATABASE_URL`: Ensure credentials match the postgres service.

3. **Launch**:
   ```bash
   docker compose -f docker-compose.live.yml up -d
   ```

---

## 🔄 Live Updates (Git Sync)

The production container uses a "pull-and-build" strategy. Whenever you push new code to your GitHub repository and want the server to update:

1. **Restart the Service**:
   ```bash
   docker compose -f docker-compose.live.yml restart nextjs
   ```

2. **What happens behind the scenes?**:
   - The container performs a fresh `git clone` of the latest code.
   - It runs `npm install` and `npx prisma migrate deploy` to ensure the database schema is up-to-date.
   - It builds the Next.js application (`npm run build`).
   - It starts the new production server.

---

## 🔐 Environment & Security
For production, it is highly recommended to move sensitive credentials (like `AUTH_SECRET` and `DATABASE_URL`) out of the YAML file and into a secure `.env` file on the server.

### Example `.env` for production:
```env
DOMAIN_NAME=yourdomain.com
SITE_NAME=recipe-prod
POSTGRES_USER=secure_user
POSTGRES_PASSWORD=secure_password
AUTH_SECRET=your_generated_secret
```

---

*Note: For large-scale production, consider transitioning to the multi-stage `Dockerfile` located in the `/frontend` directory for even faster boot times.*

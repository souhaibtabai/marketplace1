# marketplace1

Full-stack marketplace application with separate frontend apps for customers and admin/vendors.

---

## 🚀 Run Locally (Docker — recommended)

**Prerequisites:** [Docker Desktop](https://docs.docker.com/get-docker/) (includes `docker compose`)

```bash
# 1. Clone the repo (if you haven't already)
git clone https://github.com/souhaibtabai/marketplace1.git
cd marketplace1

# 2. Start everything (database + backend + frontend)
docker compose up --build

# 3. Open the site
#    Customer site  → http://localhost:5173
#    Backend API    → http://localhost:5000/api/health
```

> **Default admin account** (created automatically):
> - Email: `admin@marketplace.local`
> - Password: `Marketplace1!`

To stop: `docker compose down`  
To wipe the database and start fresh: `docker compose down -v`

---

## 🛠 Run Locally (Manual — no Docker)

**Prerequisites:** Node.js 20+, PostgreSQL 14+

### 1. Database

```sql
-- In psql (as a superuser):
CREATE USER marketplace WITH PASSWORD 'marketplace';
CREATE DATABASE marketplace OWNER marketplace;
\c marketplace
-- Run the schema:
\i docker/init.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env – set DB_HOST=localhost, DB_USER=marketplace, DB_PASSWORD=marketplace, etc.
npm install
npm start          # → http://localhost:5000
```

### 3. Frontend (customer site)

```bash
cd site
npm install
npm run dev        # → http://localhost:5173  (proxies /api to localhost:5000)
```

---

## 🚨 Common Issues

- **404 Error on /login?logout=true?** See [QUICK_FIX.md](./QUICK_FIX.md) 🔥
- **Admin login redirects to wrong URL?** See [RENDER_DEPLOYMENT_FIX.md](./RENDER_DEPLOYMENT_FIX.md)
- **SPA routes returning 404?** See [DEBUG_404_ERROR.md](./DEBUG_404_ERROR.md)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

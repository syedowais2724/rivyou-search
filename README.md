# Rivyou — Product Discovery Search Engine

Rivyou is a high-performance product discovery platform designed to find the **right** product rather than just any query-matching product. It includes structured scoring tiers, typo tolerance (fuzzy matching), and cached search pipelines.

## Features

- **Auth Portal**: JWT-secured endpoints (Sign Up, Sign In, Blacklisted Sign Out).
- **Three-Tier Relevance Ranking**:
  - **Tier 1 (Category Match)**: Score 0.85 to 1.00. Category matches query. Sub-sorted by matching tag frequency.
  - **Tier 2 (Tag Match)**: Score 0.50 to 0.84. Tags containing query term. Sub-sorted: exact tags (0.70) > fuzzy tags (0.55).
  - **Tier 3 (Name/Description Match)**: Score 0.20 to 0.49. Substring or fuzzy matching on product titles (0.40) or descriptions (0.25).
- **Typo Tolerance**: Uses `rapidfuzz` string similarity to auto-correct typos (e.g., "smartphne" matches "Smartphones" category).
- **Asynchronous Search Logs**: Runs background logging tasks through `django-rq` and Redis queue, storing results count and analytics without slowing HTTP response times.
- **Search Caching**: Implements Django cache framework backed by Redis with a 5-minute TTL.
- **Modern Discovery UI**: Splendid split-panel login/register screen, Centered debounced search pill, category pills, dynamic relevance progress bars, slide-out discovery logs drawer, global top 10 search trackers.

---

## Technical Stack

- **Backend**: Django + Django REST Framework + PostgreSQL + `rapidfuzz`
- **Database**: PostgreSQL (with B-Tree indexes & postgres GIN index on tags ArrayField)
- **Caching & Queue**: Redis + `django-rq`
- **Frontend**: React (Vite) + Tailwind CSS + Lucide icons
- **Docs**: `drf-spectacular` (Swagger UI available at `http://localhost:8000/api/docs/`)

---

## Getting Started (Docker Compose)

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Build and Start Services
Execute standard docker command:
```bash
docker-compose up --build
```
This builds and boots:
- `db` (Postgres:15)
- `redis` (Redis:7)
- `backend` (Django API at `http://localhost:8000`)
- `rq_worker` (Django-RQ worker)
- `frontend` (Vite SPA at `http://localhost:5173`)

### 3. Seed Database
Run the custom Django seed command to populate 1000 randomized products:
```bash
docker-compose exec backend python manage.py load_products
```
This seeds:
- 330 Smartphones
- 335 Chargers (with ~100 including "smartphone" tag)
- 335 Back Covers (with ~100 including "smartphone" tag)

### 4. Seed from a Custom CSV Dataset
If you have your own CSV dataset of products, copy it into the `backend` directory (e.g., as `dataset.csv`) and run:
```bash
docker-compose exec backend python manage.py import_products --file dataset.csv
```
*Note: This command will clear the table before seeding by default. If you wish to append instead, use the `--append` flag:*
```bash
docker-compose exec backend python manage.py import_products --file dataset.csv --append
```

### 5. Running Backend Tests
Execute pytest tests inside backend container:
```bash
docker-compose exec backend pytest
```

---

## API Documentation

### Auth Endpoints (Unprotected)
- `POST /api/auth/register` — Create user, returns JWT token.
- `POST /api/auth/login` — Login, returns JWT token and details.
- `POST /api/auth/logout` — Logout (protected), blacklists the token.

### Product & Search Endpoints (Protected)
- `GET /api/products/search?q=<query>&limit=20&page=1&category_filter=<optional>` — Protected 3-tier search engine.
- `GET /api/products/:id` — Detail view for product.
- `GET /api/products/category/<category>` — Paginated category list.
- `POST /api/products` — Admin create endpoint (check `is_staff`).

### Analytics Endpoints (Protected)
- `GET /api/analytics/search-history` — User's recent 50 search terms with result count.
- `GET /api/analytics/top-searches` — Global top 10 queries with count.

---

## Relevance Ranking Scoring Rules

1. **Category Match**: `0.85 + (matching_tags / total_tags) * 0.15`
2. **Exact Tag Match**: `0.70`
3. **Fuzzy Tag Match**: `0.55` (rapidfuzz similarity > 80%)
4. **Name Match**: `0.40`
5. **Description Match**: `0.25`

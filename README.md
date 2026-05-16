# ✦ Luca Glow — Admin Panel

> **Full-stack e-commerce admin panel** for [Luca Glow](https://luca-glow-project.lovable.app/) — a clean beauty & skincare brand from Kerala, India.  
> Built with **React 19 + Laravel 11** following the "High-End Glow" design philosophy.

---

## ✨ What's Inside

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS 3, TanStack Table v8, TanStack Query v5 |
| **Charts** | Recharts (Line + Donut) |
| **Icons** | Lucide React |
| **State** | Zustand (auth), TanStack Query (server state) |
| **Backend** | Laravel 11 (REST API, stateless) |
| **Auth** | Laravel Sanctum (Bearer token) |
| **Media** | Spatie Media Library v11 (auto WebP conversion) |
| **Permissions** | Spatie Laravel Permission (RBAC) |
| **PDF** | barryvdh/laravel-dompdf (branded invoices) |
| **Database** | MySQL 8.0+ |

---

## 📁 Project Structure

```
luca-glow/
├── luca-glow-admin/          # React 19 frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js      # Axios instance (Sanctum headers)
│   │   │   └── hooks.js      # All TanStack Query hooks (20+ hooks)
│   │   ├── components/
│   │   │   └── ui/index.jsx  # Shared: Badge, KPICard, SlideOver, Modal, Toggle…
│   │   ├── data/
│   │   │   └── mock.js       # Full mock dataset (dev fallback)
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Sidebar.jsx   # Collapsible nav with Lucide icons
│   │   │   └── Topbar.jsx    # Breadcrumbs, search, notifications
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── dashboard/Dashboard.jsx  # KPIs + Recharts + low-stock
│   │   │   ├── products/Products.jsx    # TanStack Table + filters
│   │   │   ├── products/ProductForm.jsx # Full create/edit + media upload
│   │   │   ├── categories/Categories.jsx # Nested tree view
│   │   │   ├── orders/Orders.jsx        # Bulk actions + slide-over detail
│   │   │   ├── customers/Customers.jsx  # 360° profile + skin profile
│   │   │   ├── marketing/Marketing.jsx  # Coupons + slider CMS
│   │   │   └── settings/Settings.jsx    # RBAC + GST + maintenance mode
│   │   └── stores/authStore.js          # Zustand auth state
│   ├── index.html
│   ├── tailwind.config.js    # Luca Glow design tokens
│   └── vite.config.js        # Code-split chunks
│
└── luca-glow-api/            # Laravel 11 backend
    ├── app/
    │   ├── Http/Controllers/Api/
    │   │   ├── AuthController.php       # Login, logout, me, profile
    │   │   ├── DashboardController.php  # Stats, charts, low-stock
    │   │   ├── ProductController.php    # CRUD + Spatie media
    │   │   ├── OrderController.php      # Status engine + PDF invoice
    │   │   └── Controllers.php          # Customer, Category, Coupon, Slider, Settings
    │   └── Models/
    │       ├── User.php         # total_spend accessor, VIP auto-upgrade
    │       ├── Product.php      # effective_price, Spatie media, scopes
    │       ├── Order.php        # OrderItem, OrderAddress, StatusHistory
    │       └── Models.php       # Category, Attribute, Coupon, Slider, Setting, CustomerGroup
    ├── config/
    │   ├── cors.php             # Allows React dev + prod domains
    │   ├── sanctum.php          # 7-day token expiry
    │   └── media-library.php    # WebP conversion, S3-ready
    ├── database/
    │   ├── migrations/          # One comprehensive migration
    │   └── seeders/             # Full Luca Glow brand seed data
    ├── resources/views/
    │   └── invoices/order.blade.php  # Branded PDF invoice template
    └── routes/
        ├── api.php              # 40+ protected endpoints
        ├── web.php              # Health + maintenance check
        └── console.php          # Artisan commands + scheduler
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- PHP ≥ 8.2 + Composer
- MySQL 8.0+
- (Optional) Redis for queue

---

### 1 — Frontend Setup

```bash
cd luca-glow-admin

# Install dependencies
npm install

# Create env file
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1
# Set VITE_USE_MOCK=true  ← keep true until backend is ready

# Start dev server
npm run dev
# → http://localhost:3000

# Demo login (mock mode):
# Email:    admin@lucaglow.com
# Password: password
```

**Production build:**
```bash
npm run build
# dist/ is generated with code-split chunks (~200KB gzipped total)
```

---

### 2 — Backend Setup

```bash
cd luca-glow-api

# Install PHP dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Configure .env:
DB_DATABASE=luca_glow
DB_USERNAME=root
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
```

**Database:**
```bash
# Create the database first
mysql -u root -p -e "CREATE DATABASE luca_glow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations + seed
php artisan migrate --seed

# Output: ✅ Luca Glow seed complete — 12 products, 5 categories, 4 coupons, 3 sliders.
```

**Storage & Media:**
```bash
php artisan storage:link
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

**Start server:**
```bash
php artisan serve
# → http://localhost:8000

# (Optional) Queue worker for async image conversions
php artisan queue:work --queue=media
```

---

### 3 — Connect Frontend to Backend

Once the Laravel backend is running:

```bash
# In luca-glow-admin/.env
VITE_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK=false   ← Switch from mock to real API
```

---

## 🔐 Authentication Flow

```
React Login Form
      │
      ▼
POST /api/v1/auth/login  { email, password }
      │
      ▼
Laravel Sanctum validates credentials
      │
      ▼
Returns: { token: "lgadm_...", user: { name, roles, permissions } }
      │
      ▼
Zustand stores token → localStorage
      │
      ▼
All subsequent requests: Authorization: Bearer lgadm_...
```

**Default admin credentials (seeded):**
```
Email:    admin@lucaglow.com
Password: password
Role:     Super Admin
```

---

## 📊 API Reference

All endpoints are prefixed with `/api/v1/` and require `Authorization: Bearer {token}`.

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard/stats` | KPI cards (revenue, orders, customers, AOV) |
| GET | `/admin/dashboard/chart?period=monthly` | Revenue + orders time series |
| GET | `/admin/dashboard/categories-chart` | Category sales distribution |
| GET | `/admin/dashboard/low-stock` | Products below threshold |
| GET | `/admin/dashboard/recent-orders` | Latest 8 transactions |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/products` | Paginated list (search, filter, sort) |
| POST | `/admin/products` | Create with attributes |
| GET | `/admin/products/{id}` | Single product detail |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Soft delete |
| PATCH | `/admin/products/{id}/toggle` | Toggle active status |
| POST | `/admin/products/{id}/media` | Upload images (WebP) |
| DELETE | `/admin/products/{id}/media/{mediaId}` | Remove image |
| POST | `/admin/products/{id}/media/reorder` | Reorder gallery |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/orders` | Paginated (search, status, date range) |
| GET | `/admin/orders/{id}` | Full detail with items + addresses + history |
| PATCH | `/admin/orders/{id}/status` | Update status + notify customer |
| POST | `/admin/orders/bulk-status` | Bulk update selected orders |
| GET | `/admin/orders/{id}/invoice` | Stream branded PDF invoice |
| GET | `/admin/orders/export/csv` | CSV export |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/customers` | Paginated with total_spend (aggregated) |
| GET | `/admin/customers/{id}` | 360° profile + order timeline |
| PATCH | `/admin/customers/{id}/group` | Move to VIP/Regular/Wholesale |
| PATCH | `/admin/customers/{id}/suspend` | Toggle account status |
| POST | `/admin/customers/{id}/reset-password` | Send password reset email |

### Marketing
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/admin/coupons` | List / create coupon |
| PUT/DELETE | `/admin/coupons/{id}` | Update / delete |
| PATCH | `/admin/coupons/{id}/toggle` | Kill switch |
| GET/POST | `/admin/sliders` | List / create banner |
| POST | `/admin/sliders/reorder` | Reorder banners |

### Settings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/settings` | All settings grouped |
| PUT | `/admin/settings` | Update settings |
| POST | `/admin/settings/cache/clear` | Clear Laravel cache |
| GET/POST | `/admin/staff` | List staff / invite |
| PATCH | `/admin/staff/{id}/role` | Update role |

---

## 🎨 Design System

### Colour Tokens
```css
--glow-primary:   #FDBA74   /* Buttons, active states, focus rings */
--glow-secondary: #FB923C   /* Hover, gradients */
--glow-dark:      #7C2D12   /* Headings, accents */
--glow-soft:      #FFF7ED   /* Page backgrounds, tints */
```

### Key Component Classes (Tailwind)
```
.btn-glow      → Primary CTA button (orange gradient)
.btn-outline   → Secondary button
.btn-danger    → Destructive action
.card          → White surface with shadow-card
.kpi-card      → Dashboard stat card with top glow border
.input-field   → Styled form input with focus ring
.tbl-head      → Table header cell
.tbl-cell      → Table body cell
.tbl-row       → Hoverable table row
.badge         → Inline status pill
.slide-over    → Fixed right-panel drawer
.skeleton      → Animated loading placeholder
```

---

## ⚙️ RBAC Permission Matrix

| Permission | Super Admin | Order Manager | Catalog Editor | Viewer |
|---|:---:|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage Products | ✅ | — | ✅ | — |
| Process Orders | ✅ | ✅ | — | — |
| View Customers | ✅ | ✅ | — | ✅ |
| Marketing / CMS | ✅ | — | — | — |
| System Settings | ✅ | — | — | — |
| Invite Staff | ✅ | — | — | — |

---

## 🗄️ Key Database Schema

```sql
-- Core tables with relationships
products          → categories (belongsTo)
products          → spatie_media (hasMany via media library)
orders            → users/customers (belongsTo)
orders            → order_items (hasMany)
orders            → order_addresses (hasMany, type: billing/shipping)
orders            → order_status_history (hasMany)
users             → customer_groups (belongsTo)
users             → spatie permissions roles (many-to-many)
coupons           → (standalone, validated at checkout)
sliders           → spatie_media (hasOne via media library)
settings          → (key-value store, grouped)

-- Critical indexes for performance
products(sku, is_active)
orders(status, created_at)
orders(customer_id)
orders(order_number)   -- unique
users(email)           -- unique
```

---

## 🔄 Scheduled Commands

```bash
# Runs automatically via Laravel Scheduler (add to server crontab):
# * * * * * cd /path/to/api && php artisan schedule:run >> /dev/null 2>&1

php artisan lucaglow:auto-upgrade-customers   # Daily 2AM — VIP auto-promotion
php artisan lucaglow:cleanup-expired-coupons  # Daily — deactivate expired codes
php artisan lucaglow:low-stock-report         # Manual — print low-stock table
```

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy dist/ folder
# Set VITE_API_URL=https://api.lucaglow.com/api/v1
# Set VITE_USE_MOCK=false
```

### Backend (Laravel Forge / DigitalOcean)
```bash
# 1. Upload code, run composer install --no-dev
# 2. Set environment variables
# 3. Run migrations: php artisan migrate --force
# 4. Optimize: php artisan optimize
# 5. Storage link: php artisan storage:link
# 6. Queue worker: supervisor with php artisan queue:work
# 7. Scheduler cron (see above)

# S3 media storage (recommended for production)
MEDIA_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=ap-south-1
AWS_BUCKET=luca-glow-media
```

---

## 🧪 Testing Login

| Email | Password | Role |
|---|---|---|
| `admin@lucaglow.com` | `password` | Super Admin |

> **Mock mode** is active by default (`VITE_USE_MOCK=true`).  
> All pages load with realistic Luca Glow data without needing the Laravel backend running.  
> Toggle `VITE_USE_MOCK=false` once your backend is connected.

---

## 📦 What's Seeded

- **5** product categories (Skincare & Face, Cleansing Soaps, Lykha Makeup, Fragrances, Body & Hair)
- **12** real Luca Glow products (Face Cream, Kojic Soap, Gluta Soap, Lykha Foundation, Perfume, etc.)
- **4** customer groups (Regular, VIP, Wholesale, First-Time) with auto-upgrade threshold
- **4** promo coupons (GLOW2026, WELCOME100, LYKHA10, FREESHIP)
- **3** hero sliders
- **1** Super Admin user
- **4** permission roles with full RBAC matrix
- **10** store settings (name, GST, currency locked to INR)

---

*Built with ❤️ for Luca Glow · Kerala, India · lucaglow.com*

# Nepal Cozy Care - Frontend Page Connections

This file explains which frontend page connects to which components and backend endpoints.

---

## 1) Routing Map (Source of Truth)
Routes are defined in [Nepal-Cozy-Care-frontend/src/App.tsx](Nepal-Cozy-Care-frontend/src/App.tsx#L1-L96). The app is wrapped with `BrowserRouter` in [Nepal-Cozy-Care-frontend/src/main.tsx](Nepal-Cozy-Care-frontend/src/main.tsx#L1-L13).

---

## 2) API Base URL and Auth

- Most pages use this base URL pattern:
  - `const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"`
- Authenticated requests use:
  - `Authorization: Bearer <token>` (token from `localStorage`)
- Admin pages are wrapped by `AdminProtectedRoute` and still add `Bearer` token headers.
- There is a helper in [Nepal-Cozy-Care-frontend/src/services/api.ts](Nepal-Cozy-Care-frontend/src/services/api.ts) but most pages call `fetch()` directly.

---

## 3) Page-by-Page Connections

### Public Pages

**Route: `/`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Home.tsx](Nepal-Cozy-Care-frontend/src/pages/Home.tsx)
- Components used:
  - `Layout`, `Hero`, `Features`, `PopularItems`, `ShopPlants`, `BestSellers`, `OurGarden`, `OurGoal`, `AboutUs`
- API usage:
  - `PopularItems` -> `GET /api/plants?per_page=4`
  - `ShopPlants` -> `GET /api/plants?per_page=4`
  - `BestSellers` -> `GET /api/plants?per_page=4`
- Files:
  - [Nepal-Cozy-Care-frontend/src/components/home/PopularItems.tsx](Nepal-Cozy-Care-frontend/src/components/home/PopularItems.tsx)
  - [Nepal-Cozy-Care-frontend/src/components/home/ShopPlants.tsx](Nepal-Cozy-Care-frontend/src/components/home/ShopPlants.tsx)
  - [Nepal-Cozy-Care-frontend/src/components/home/BestSellers.tsx](Nepal-Cozy-Care-frontend/src/components/home/BestSellers.tsx)

**Route: `/register`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Register.tsx](Nepal-Cozy-Care-frontend/src/pages/Register.tsx)
- API usage:
  - `POST /api/register` (create account)
  - `POST /api/login` (auto-login after registration)

**Route: `/login`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Login.tsx](Nepal-Cozy-Care-frontend/src/pages/Login.tsx)
- API usage:
  - `POST /api/login`
- Stores token and user in `localStorage`.

**Route: `/plants`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Plants.tsx](Nepal-Cozy-Care-frontend/src/pages/Plants.tsx)
- Components used:
  - `Layout`, `FilterSidebar`, `ProductGrid`
- API usage:
  - `GET /api/plants?per_page=100`

**Route: `/plants/:id`**
- File: [Nepal-Cozy-Care-frontend/src/pages/ProductDetail.tsx](Nepal-Cozy-Care-frontend/src/pages/ProductDetail.tsx)
- API usage:
  - `GET /api/plants/{id}`

**Route: `/pots`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Pots.tsx](Nepal-Cozy-Care-frontend/src/pages/Pots.tsx)
- API usage:
  - No backend calls found (static content).

**Route: `/popular-items`**
- File: [Nepal-Cozy-Care-frontend/src/pages/PopularItemsPage.tsx](Nepal-Cozy-Care-frontend/src/pages/PopularItemsPage.tsx)
- API usage:
  - `GET /api/plants?per_page=100`

**Route: `/plant-finder`**
- File: [Nepal-Cozy-Care-frontend/src/pages/PlantFinder.tsx](Nepal-Cozy-Care-frontend/src/pages/PlantFinder.tsx)
- API usage:
  - `GET /api/plants?per_page=100`
- Logic: Filters results on the client based on room/light/difficulty/humidity selections.

**Route: `/shipping`**
- File: [Nepal-Cozy-Care-frontend/src/pages/ShippingDelivery.tsx](Nepal-Cozy-Care-frontend/src/pages/ShippingDelivery.tsx)
- API usage:
  - No backend calls found (static content).

**Route: `/blogs`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Blogs.tsx](Nepal-Cozy-Care-frontend/src/pages/Blogs.tsx)
- Components used:
  - `Layout`, `Sidebar`, `FeaturedBlogs`, `Welcome`, `EditorPicks`
- API usage:
  - `GET /api/blogs`

**Route: `/contact`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Contact.tsx](Nepal-Cozy-Care-frontend/src/pages/Contact.tsx)
- Components used:
  - `Layout`, `ContactInfo`, `ContactForm`, `Banner`
- API usage:
  - `POST /api/contact` (from `ContactForm`)
- File: [Nepal-Cozy-Care-frontend/src/components/contact/ContactForm.tsx](Nepal-Cozy-Care-frontend/src/components/contact/ContactForm.tsx)

**Route: `/cart`**
- File: [Nepal-Cozy-Care-frontend/src/pages/Cart.tsx](Nepal-Cozy-Care-frontend/src/pages/Cart.tsx)
- Auth: Requires `token` in `localStorage` or it redirects to `/login`.
- API usage:
  - `GET /api/cart` (load cart)
  - `PUT /api/cart/{itemId}` (update quantity)
  - `DELETE /api/cart/{itemId}` (remove item)
  - `POST /api/cart` (add item)
  - `GET /api/plants?limit=5` (recommended plants)

**Route: `/about`**
- File: [Nepal-Cozy-Care-frontend/src/pages/About.tsx](Nepal-Cozy-Care-frontend/src/pages/About.tsx)
- API usage:
  - No backend calls found (static content).

**Route: `/care-tips`**
- File: [Nepal-Cozy-Care-frontend/src/pages/CareTips.tsx](Nepal-Cozy-Care-frontend/src/pages/CareTips.tsx)
- Components used:
  - `Layout`, `Hero`, `Filters`, `TipsGrid`
- API usage:
  - `GET /api/care-tips/categories`
  - `GET /api/care-tips?search=&category=&difficulty=&sort_by=&page=`

**Route: `/care-tips/:id`**
- File: [Nepal-Cozy-Care-frontend/src/pages/CareTipDetail.tsx](Nepal-Cozy-Care-frontend/src/pages/CareTipDetail.tsx)
- API usage:
  - `GET /api/care-tips/{id}`

**Route: `/track-order`**
- File: [Nepal-Cozy-Care-frontend/src/pages/TrackOrder.tsx](Nepal-Cozy-Care-frontend/src/pages/TrackOrder.tsx)
- API usage:
  - `POST /api/orders/track` (requires `order_id` and `email`)

**Route: `/plant-health-checker`**
- File: [Nepal-Cozy-Care-frontend/src/pages/PlantHealthChecker.tsx](Nepal-Cozy-Care-frontend/src/pages/PlantHealthChecker.tsx)
- API usage:
  - No backend calls found (static content).

---

### Admin Pages (Protected)
All admin routes are wrapped by `AdminProtectedRoute` and use `Authorization: Bearer <token>`.

**Route: `/admin`**
- File: [Nepal-Cozy-Care-frontend/src/pages/AdminDashboard.tsx](Nepal-Cozy-Care-frontend/src/pages/AdminDashboard.tsx)
- API usage:
  - `GET /api/admin/dashboard/stats`
  - `GET /api/admin/dashboard/recent-orders`
  - `GET /api/admin/dashboard/top-products`

**Route: `/admin/plants`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/ManagePlants.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/ManagePlants.tsx)
- API usage:
  - `GET /api/admin/plants?per_page=100`
  - Fallback: `GET /api/plants?per_page=100`
  - `POST /api/plants` (create with file upload)
  - `POST /api/plants/{id}` with `_method=PUT` (update with file upload)
  - `DELETE /api/plants/{id}`

**Route: `/admin/accessories`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/ManageAccessories.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/ManageAccessories.tsx)
- API usage:
  - No backend calls found (mock data only).

**Route: `/admin/blogs`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/ManageBlogs.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/ManageBlogs.tsx)
- API usage:
  - `GET /api/admin/blogs`
  - `POST /api/upload` (image upload)
  - `POST /api/blogs` (create)
  - `PUT /api/blogs/{id}` (update or publish)
  - `DELETE /api/blogs/{id}`

**Route: `/admin/care-tips`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/ManageCareTips.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/ManageCareTips.tsx)
- API usage:
  - `GET /api/admin/care-tips`
  - `POST /api/upload` (image upload)
  - `POST /api/care-tips` (create)
  - `PUT /api/care-tips/{id}` (update or publish)
  - `DELETE /api/care-tips/{id}`

**Route: `/admin/orders`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/ManageOrders.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/ManageOrders.tsx)
- API usage:
  - `GET /api/admin/orders`
  - `PUT /api/orders/{id}/status`

**Route: `/admin/users`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/ManageUsers.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/ManageUsers.tsx)
- API usage:
  - No backend calls found (mock data only).

**Route: `/admin/reports`**
- File: [Nepal-Cozy-Care-frontend/src/pages/admin/Reports.tsx](Nepal-Cozy-Care-frontend/src/pages/admin/Reports.tsx)
- API usage:
  - No backend calls found (mock data only).

---

## 4) Quick Summary (What Uses API and What is Static)

**Uses backend API**
- Auth: Register, Login
- Catalog: Home widgets, Plants, ProductDetail, PopularItemsPage, PlantFinder
- Content: Blogs, CareTips, CareTipDetail
- Cart: Cart
- Order: TrackOrder
- Admin: Dashboard, ManagePlants, ManageBlogs, ManageCareTips, ManageOrders
- Contact form: Contact

**Static or mock-only**
- About, Pots, ShippingDelivery, PlantHealthChecker
- Admin: ManageAccessories, ManageUsers, Reports

---

## 5) Where to Look if Supervisor Asks

- Routing: [Nepal-Cozy-Care-frontend/src/App.tsx](Nepal-Cozy-Care-frontend/src/App.tsx#L1-L96)
- API calls: Search `fetch(` in `src/pages` and `src/components`
- Admin protection: [Nepal-Cozy-Care-frontend/src/components/admin/AdminProtectedRoute.tsx](Nepal-Cozy-Care-frontend/src/components/admin/AdminProtectedRoute.tsx)

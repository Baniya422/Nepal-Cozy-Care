# Nepal Cozy Care - Complete Folder Structure & MVC Architecture

## Overview

Nepal Cozy Care is a **full-stack application** with two main folders:
1. **Backend** (Laravel) - Handles business logic, database, and API
2. **Frontend** (React) - Handles user interface and user interactions

---

## PART 1: BACKEND FOLDER STRUCTURE & MVC

### Location: `Nepal-Cozy-Care-backend/`

#### Directory Tree:
```
Nepal-Cozy-Care-backend/
│
├── app/                                    # ← APPLICATION CODE
│   ├── Http/
│   │   ├── Controllers/Api/               # ← CONTROLLERS (C in MVC)
│   │   │   ├── AdminController.php
│   │   │   ├── AuthController.php
│   │   │   ├── BlogController.php
│   │   │   ├── CareTipController.php
│   │   │   ├── CartController.php
│   │   │   ├── OrderController.php
│   │   │   ├── PlantController.php
│   │   │   ├── ReviewController.php
│   │   │   ├── UploadController.php
│   │   │   └── WishlistController.php
│   │   └── Middleware/
│   │       └── AdminMiddleware.php        # ← Protects admin routes
│   │
│   ├── Models/                            # ← MODELS (M in MVC)
│   │   ├── Blog.php
│   │   ├── CareTip.php
│   │   ├── Cart.php
│   │   ├── CartItem.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Plant.php
│   │   ├── Review.php
│   │   ├── User.php
│   │   └── Wishlist.php
│   │
│   └── Providers/
│       └── AppServiceProvider.php         # ← App configuration
│
├── database/
│   ├── migrations/                        # ← Database schema
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 2026_01_08_052501_create_personal_access_tokens_table.php
│   │   ├── create_plants_table.php
│   │   ├── create_carts_table.php
│   │   ├── create_orders_table.php
│   │   ├── create_order_items_table.php
│   │   ├── create_reviews_table.php
│   │   ├── create_wishlists_table.php
│   │   ├── create_blogs_table.php
│   │   └── create_care_tips_table.php
│   │
│   ├── factories/
│   │   └── UserFactory.php                # ← Generate test data
│   │
│   └── seeders/
│       └── AdminUserSeeder.php            # ← Populate initial admin user
│
├── routes/
│   ├── api.php                            # ← ✅ ALL API ROUTES (URLs defined here)
│   ├── web.php
│   └── console.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── sanctum.php                        # ← API token auth settings
│   ├── services.php
│   ├── session.php
│   └── ...
│
├── public/
│   ├── index.php                          # ← 🔴 ENTRY POINT (requests start here)
│   ├── storage/                           # ← Uploaded files (symlink)
│   └── robots.txt
│
├── storage/
│   ├── app/                               # ← Uploaded files stored here
│   ├── logs/                              # ← Application logs
│   └── framework/                         # ← Framework cache
│
├── bootstrap/
│   ├── app.php                            # ← Create app instance
│   └── providers.php                      # ← Load service providers
│
├── tests/
│   ├── Feature/                           # ← Feature tests
│   ├── Unit/                              # ← Unit tests
│   └── TestCase.php
│
├── vendor/                                # ← Dependencies (auto-generated)
│   └── (autoload.php, laravel/, symfony/, etc.)
│
├── .env.example                           # ← Environment template
├── composer.json                          # ← PHP dependencies
├── artisan                                # ← CLI tool
├── phpunit.xml                            # ← Testing config
└── README.md
```

---

## PART 2: WHAT EACH FOLDER DOES

### `app/Http/Controllers/Api/` - THE CONTROLLERS (C)
**What it is:** Request handlers that contain business logic.

**Each file is a Controller:**
- `AuthController.php` → Handles user registration, login, logout
- `PlantController.php` → Handles plant CRUD and listing
- `CartController.php` → Handles shopping cart operations
- `OrderController.php` → Handles order creation, tracking, status update
- `WishlistController.php` → Handles save/unsave plants
- `ReviewController.php` → Handles plant reviews and ratings
- `BlogController.php` → Handles blog posts CRUD
- `CareTipController.php` → Handles care tips CRUD
- `AdminController.php` → Handles dashboard stats
- `UploadController.php` → Handles file uploads

**Responsibilities:**
- Accept HTTP requests from frontend
- Validate input
- Call Model methods
- Return JSON responses

**Example flow:**
```
Frontend sends: POST /api/plants with plant data
  ↓
Route matches: Route::post('/plants', [PlantController::class, 'store'])
  ↓
PlantController::store() method runs
  ↓
Validates data
  ↓
Plant::create() saves to database
  ↓
Returns JSON response to frontend
```

---

### `app/Models/` - THE MODELS (M)
**What it is:** Database table representations using Eloquent ORM.

**Each file represents a database table:**
- `User.php` → users table (customers & admins)
- `Plant.php` → plants table (products)
- `Cart.php` → carts table (shopping cart)
- `Order.php` → orders table
- `OrderItem.php` → order_items table
- `Review.php` → reviews table
- `Wishlist.php` → wishlists table
- `Blog.php` → blogs table
- `CareTip.php` → care_tips table

**Responsibilities:**
- Define relationships (one-to-many, many-to-many)
- Query the database
- Handle data validation
- Define fillable fields

**Example:**
```php
class Plant extends Model {
    protected $fillable = ['name', 'price', 'stock', ...];
    
    public function reviews() {
        return $this->hasMany(Review::class);
    }
}
```

---

### `routes/api.php` - THE ROUTES (V - View Layer Controller)
**What it is:** Maps URLs to Controllers.

**Structure:**
- Public routes (no auth needed)
  - `GET /plants` → Browse plants
  - `POST /register` → Create account
  - `POST /login` → Login
  - `GET /blogs` → Read blogs
  - `GET /care-tips` → Read care tips
  - `POST /orders/track` → Track order

- Protected routes (need login token)
  - `POST /cart` → Add to cart
  - `GET /orders` → My orders
  - `POST /reviews` → Leave review
  - `DELETE /wishlist/{id}` → Remove from wishlist

- Admin-only routes (need admin role)
  - `POST /plants` → Create plant
  - `PUT /plants/{id}` → Edit plant
  - `DELETE /plants/{id}` → Delete plant
  - `GET /admin/dashboard` → Stats
  - `PUT /orders/{id}/status` → Update order status

---

### `database/migrations/` - DATABASE SCHEMA
**What it is:** Creates database tables.

**File naming:** `YYYY_MM_DD_HHMMSS_action.php`

**Each file creates a table:**
- `create_users_table.php` → users table with email, password, role
- `create_plants_table.php` → plants table with name, price, stock, image
- `create_carts_table.php` → carts table with user_id, plant_id, quantity
- `create_orders_table.php` → orders table with user_id, status, total
- `create_order_items_table.php` → order_items table with order_id, plant_id, quantity, price
- `create_reviews_table.php` → reviews table with user_id, plant_id, rating, comment
- `create_wishlists_table.php` → wishlists table with user_id, plant_id
- `create_blogs_table.php` → blogs table with title, content, author
- `create_care_tips_table.php` → care_tips table with title, category, content

---

### `database/seeders/` - INITIAL DATA
**What it is:** Populates database with starting data.

- `AdminUserSeeder.php` → Creates first admin account for login

---

### `app/Http/Middleware/` - REQUEST FILTERS
**What it is:** Middleware that runs before/after requests.

- `AdminMiddleware.php` → Checks if user is admin, blocks if not

---

### `public/index.php` - ENTRY POINT
**This is where ALL requests start:**
1. Request comes in (e.g., `POST /api/plants`)
2. `index.php` loads Laravel
3. Routes are matched
4. Controller is called
5. Response is returned

---

## PART 3: FRONTEND FOLDER STRUCTURE & COMPONENT PATTERN

### Location: `Nepal-Cozy-Care-frontend/src/`

#### Directory Tree:
```
Nepal-Cozy-Care-frontend/src/
│
├── main.tsx                               # ← 🔴 ENTRY POINT (React app starts here)
│
├── App.tsx                                # ← ROOT COMPONENT (all routes defined)
│
├── pages/                                 # ← PAGE COMPONENTS (full pages for routes)
│   ├── Home.tsx
│   ├── Plants.tsx
│   ├── ProductDetail.tsx
│   ├── PlantFinder.tsx
│   ├── PopularItemsPage.tsx
│   ├── Cart.tsx
│   ├── Blogs.tsx
│   ├── CareTips.tsx
│   ├── CareTipDetail.tsx
│   ├── Contact.tsx
│   ├── TrackOrder.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── PlantHealthChecker.tsx
│   ├── About.tsx
│   ├── Pots.tsx
│   ├── ShippingDelivery.tsx
│   ├── AdminDashboard.tsx
│   │
│   └── admin/                             # ← ADMIN PAGES (protected)
│       ├── ManagePlants.tsx
│       ├── ManageBlogs.tsx
│       ├── ManageCareTips.tsx
│       ├── ManageOrders.tsx
│       ├── ManageAccessories.tsx
│       ├── ManageUsers.tsx
│       └── Reports.tsx
│
├── components/                            # ← REUSABLE COMPONENTS
│   ├── Header.tsx
│   ├── ImageWithFallback.tsx
│   │
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminProtectedRoute.tsx        # ← Route guard
│   │   └── admin.css
│   │
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   │
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── PopularItems.tsx
│   │   ├── ShopPlants.tsx
│   │   ├── BestSellers.tsx
│   │   ├── OurGarden.tsx
│   │   ├── OurGoal.tsx
│   │   ├── AboutUs.tsx
│   │   └── home.css
│   │
│   ├── plants/
│   │   ├── FilterSidebar.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductCard.tsx
│   │
│   ├── blogs/
│   │   ├── FeaturedBlogs.tsx
│   │   ├── EditorPicks.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Welcome.tsx
│   │   └── BlogCard.tsx
│   │
│   ├── care-tips/
│   │   ├── Hero.tsx
│   │   ├── Filters.tsx
│   │   ├── TipsGrid.tsx
│   │   └── TipCard.tsx
│   │
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── RecommendedProducts.tsx
│   │
│   ├── contact/
│   │   ├── ContactForm.tsx
│   │   ├── ContactInfo.tsx
│   │   ├── Banner.tsx
│   │   └── contact.css
│   │
│   └── (more component folders...)
│
├── services/                              # ← API COMMUNICATION LAYER
│   └── api.ts                             # ← API client (singleton)
│
├── types/                                 # ← TYPESCRIPT INTERFACES
│   ├── index.ts
│   ├── Plant.ts
│   ├── Order.ts
│   ├── User.ts
│   ├── careTip.ts
│   └── ...
│
├── lib/                                   # ← UTILITY FUNCTIONS
│   ├── utils.ts
│   └── constants.ts
│
├── styles/                                # ← GLOBAL STYLES
│   ├── index.css
│   ├── plants.css
│   ├── cart.css
│   ├── productDetail.css
│   ├── plantfinder.css
│   ├── careTips.css
│   ├── contact.css
│   ├── trackOrder.css
│   └── ...
│
├── assets/                                # ← STATIC ASSETS
│   └── images/
│
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

---

## PART 4: FRONTEND FILE RESPONSIBILITIES

### `src/main.tsx` - ENTRY POINT
```tsx
// Loads React and App component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>  ← Enables routing
    <App />        ← Root component
  </BrowserRouter>
)
```

---

### `src/App.tsx` - ROUTER & ROOT COMPONENT
```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/plants" element={<Plants />} />
  <Route path="/login" element={<Login />} />
  <Route path="/admin" element={
    <AdminProtectedRoute>  ← Checks if user is admin
      <AdminDashboard />
    </AdminProtectedRoute>
  } />
</Routes>
```

**Decides:**
- Which page to show based on URL
- Which pages need admin protection

---

### `src/pages/` - FULL PAGE COMPONENTS
**Each file is a complete page:**

**Home.tsx:**
- Shows hero banner
- Product sections (PopularItems, BestSellers, ShopPlants)
- About section
- Calls multiple component children

**Plants.tsx:**
- Fetches plants from `GET /api/plants`
- Shows FilterSidebar and ProductGrid
- Handles filtering and search

**Cart.tsx:**
- Requires login token
- Fetches cart from `GET /api/cart`
- Can update quantity `PUT /api/cart/{id}`
- Can remove items `DELETE /api/cart/{id}`
- Can checkout

**AdminDashboard.tsx:**
- Protected by AdminProtectedRoute (only admins can access)
- Fetches dashboard stats from `GET /api/admin/dashboard/stats`
- Shows charts and recent orders

---

### `src/components/` - REUSABLE COMPONENTS
**Smaller UI pieces used by pages:**

**Layout.tsx:**
```tsx
<Layout>
  <Header /> ← Navigation bar
  {children} ← Page content
  <Footer /> ← Footer
</Layout>
```

**FilterSidebar.tsx:**
- Shows price, category, difficulty filters
- Props: filter selections, setters
- Used by: Plants.tsx, PopularItemsPage.tsx

**ProductCard.tsx:**
- Shows single plant card with image, price, rating
- Props: plant data
- Used by: BestSellers, PopularItems, ShopPlants, ProductGrid

**AdminLayout.tsx:**
- Layout for admin pages
- Sidebar with navigation links
- Used by: all admin pages

---

### `src/services/api.ts` - API CLIENT
**This is the BRIDGE between frontend and backend:**

```tsx
// Generic fetch wrapper
class ApiService {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`/api${endpoint}`)
    return response.json()
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

export const apiService = new ApiService()
```

**But most pages call `fetch()` directly instead of using this.**

---

### `src/types/` - TYPESCRIPT INTERFACES
Defines shape of data from backend:

```tsx
// Plant.ts
interface Plant {
  id: number
  name: string
  price: number
  image?: string
  category?: string
  light?: string
}

// Order.ts
interface Order {
  id: number
  user_id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  total: number
}
```

---

### `src/styles/` - CSS FILES
Global styles for each page/feature:
- `plants.css` → Plant listing styles
- `cart.css` → Shopping cart styles
- `contact.css` → Contact form styles
- Tailwind CSS classes in component files

---

## PART 5: MVC ARCHITECTURE EXPLAINED

### What is MVC?
MVC = **Model-View-Controller**

A pattern to separate concerns:
- **Model** (M) = Data (database)
- **View** (V) = UI (what user sees)
- **Controller** (C) = Logic (processes requests)

### In Laravel (Backend):
```
REQUEST COMES IN
      ↓
routes/api.php (finds which controller)
      ↓
Controllers/Api/*.php (handles request)
      ↓
Models/*.php (queries database)
      ↓
database (stores/retrieves data)
      ↓
RESPONSE RETURNED (JSON)
```

**Example: User adds plant to cart**

1. **View** (Frontend React)
   - User clicks "Add to Cart" button
   - `Cart.tsx` sends request: `POST /api/cart`

2. **Controller** (CartController.php)
   ```php
   public function store(Request $request) {
       $validated = $request->validate([
           'plant_id' => 'required|integer',
           'quantity' => 'required|integer'
       ]);
       
       Cart::create($validated);
       
       return response()->json(['success' => true]);
   }
   ```

3. **Model** (Cart.php)
   ```php
   class Cart extends Model {
       protected $fillable = ['user_id', 'plant_id', 'quantity'];
       
       public function plant() {
           return $this->belongsTo(Plant::class);
       }
   }
   ```

4. **Database** (carts table)
   - Inserts: `user_id`, `plant_id`, `quantity`

5. **Response** (back to View)
   - Frontend receives JSON `{'success': true}`
   - Updates UI to show "Item added"

---

### In React (Frontend):
```
USER INTERACTION
       ↓
Component (Page like Plants.tsx, Cart.tsx)
       ↓
Update state (useState)
       ↓
Render UI (return JSX)
       ↓
Fetch API (call backend)
       ↓
Display data
```

**Example: User views plants list**

1. **User Action**
   - Visits `/plants`

2. **Component** (Plants.tsx)
   ```tsx
   const [plants, setPlants] = useState([])
   
   useEffect(() => {
     fetch('/api/plants')
       .then(res => res.json())
       .then(data => setPlants(data.data))  // Update state
   }, [])
   ```

3. **Render**
   ```tsx
   return (
     <ProductGrid plants={plants} />  // Pass data to child
   )
   ```

4. **Child Component** (ProductGrid.tsx)
   ```tsx
   export function ProductGrid({ plants }) {
     return (
       <div className="grid">
         {plants.map(plant => (
           <ProductCard key={plant.id} plant={plant} />
         ))}
       </div>
     )
   }
   ```

5. **Display**
   - User sees plants on screen

---

## PART 6: DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                       USER INTERACTION                      │
│                  (Clicks button, fills form)                │
└────────────────────────┬────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │  React (Frontend) Page/Component│  ← src/pages/*.tsx
        │  - Manages state (useState)     │
        │  - Handles user events          │
        └────────────────┬────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │   Fetch API Call (HTTP POST)   │
        │   fetch('/api/plants', ...)    │  ← src/services or direct
        └────────────────┬────────────────┘
                         ↓
         ┌───────────────────────────────┐
         │ NETWORK REQUEST TO BACKEND    │
         │ 🌐 Internet/Network           │
         └────────────────┬────────────────┘
                          ↓
        ┌──────────────────────────────────┐
        │  Laravel Backend (API)           │
        │  public/index.php starts here    │  ← Laravel entry point
        └─────────────────┬────────────────┘
                          ↓
        ┌──────────────────────────────────┐
        │  routes/api.php                  │  ← Matches route
        │  Route::get('/plants', ...)      │
        └──────────────────┬─────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  PlantController::index()        │  ← app/Http/Controllers/Api
        │  - Validates request             │
        │  - Calls model                   │
        └──────────────────┬─────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  Plant Model                     │  ← app/Models
        │  - Plant::where('is_active',true)│
        │  - Queries database              │
        └──────────────────┬─────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  Database (MySQL)                │  ← database/migrations
        │  plants table                    │
        │  Returns rows                    │
        └──────────────────┬─────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  Response: JSON Data             │  ← Laravel returns JSON
        │  [{id, name, price, image}, ...] │
        └──────────────────┬─────────────────┘
                           ↓
         ┌───────────────────────────────┐
         │ NETWORK RESPONSE TO FRONTEND  │
         │ 🌐 Internet/Network           │
         └────────────────┬───────────────┘
                          ↓
        ┌──────────────────────────────────┐
        │  React receives JSON             │
        │  + setPlants(data.data)          │  ← Update state
        └──────────────────┬─────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  Component re-renders            │  ← Now shows plants
        │  UI updates with new data        │
        └──────────────────────────────────┘
```

---

## PART 7: QUICK REFERENCE

| What              | Where                    | Purpose                  |
|-------------------|--------------------------|--------------------------|
| **Routes**        | `routes/api.php`         | Maps URLs to Controllers |
| **Controllers**   | `app/Http/Controllers/`  | Handles requests         |
| **Models**        | `app/Models/`            | Represents database      |
| **Database**      | `database/migrations/`   | Creates tables           |
| **React Pages**   | `src/pages/`             | Full page components     |
| **Components**    | `src/components/`        | Reusable UI parts        |
| **Styles**        | `src/styles/`            | CSS for components       |
| **Types**         | `src/types/`             | TypeScript interfaces    |
| **API Client**    | `src/services/api.ts`    | Backend communication    |
| **Entry Point**   | Backend: `public/index.php` | Where requests start |
|                   | Frontend: `src/main.tsx` | Where React starts       |

---

## PART 8: SUMMARY

### Backend (Laravel):
- **File entry point:** `public/index.php`
- **Request path:** Request → `routes/api.php` → `Controllers` → `Models` → `Database` → Response
- **Pattern:** MVC (Model-View-Controller)

### Frontend (React):
- **File entry point:** `src/main.tsx`
- **Component path:** Pages call `fetch()` → Backend API → Response processed → State updated → UI renders
- **Pattern:** Component-based

### Communication:
- Frontend makes HTTP requests (GET, POST, PUT, DELETE)
- Backend receives, processes, returns JSON
- Frontend displays to user

---

**This is everything you need to explain to your supervisor!** ✅

# NEPAL COZY CARE - Complete Project Viva Guide

## Executive Summary
Nepal Cozy Care is a full-stack e-commerce web application designed for selling indoor plants with comprehensive care information. It's built using modern web technologies with a Laravel backend and React frontend, featuring user authentication, shopping cart, order management, wishlists, reviews, blogs, and plant care tips.

---

## 1. PROJECT OVERVIEW

### Project Name
**Nepal Cozy Care** - An Indoor Plant E-Commerce Platform

### Technologies Used
- **Backend**: Laravel 11 (PHP framework)
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (Token-based API authentication)
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Build Tool**: Vite (modern frontend build tool)

### Project Purpose
Create a user-friendly e-commerce platform where:
- Users can browse and purchase indoor plants
- Users can learn about plant care through blogs and care tips
- Users can manage wishlist and cart
- Users can track orders
- Admin users can manage products, orders, blogs, and user data
- Users can leave reviews and ratings for plants

### Key Features
1. **Authentication**: User registration, login, logout with roles (customer/admin)
2. **Plant Catalog**: Browse plants by category with detailed care information
3. **Shopping Cart**: Add/remove items, manage quantities
4. **Order Management**: Place orders, track status, view order history
5. **Wishlist**: Save favorite plants for later purchase
6. **Reviews & Ratings**: User reviews for plants with 1-5 star ratings
7. **Blog & Care Tips**: Educational content about plant care
8. **Admin Dashboard**: Manage plants, orders, blogs, and users
9. **Plant Health Checker**: Tool to diagnose plant health issues
10. **Plant Finder**: Recommendations based on user preferences

---

## 2. FOLDER STRUCTURE AND COMPONENTS

### 2.1 ROOT DIRECTORY
```
Nepal-Cozy-Care/
├── Nepal-Cozy-Care-backend/          # Laravel API backend
├── Nepal-Cozy-Care-frontend/         # React web interface
├── BACKEND_DOCUMENTATION.txt         # Detailed backend documentation
├── CONNECTION_GUIDE.md               # Setup instructions
├── CREATE_DATABASE.sql               # Database initialization script
└── DATABASE_SETUP.md                 # Database setup steps
```

---

### 2.2 BACKEND STRUCTURE (Laravel)

#### Location: `Nepal-Cozy-Care-backend/`

```
Nepal-Cozy-Care-backend/
│
├── app/                              # Application source code
│   ├── Http/
│   │   ├── Controllers/Api/          # API Request handlers
│   │   │   ├── AuthController.php    → User login/register
│   │   │   ├── PlantController.php   → Plant CRUD operations
│   │   │   ├── CartController.php    → Shopping cart management
│   │   │   ├── OrderController.php   → Order processing & checkout
│   │   │   ├── WishlistController.php → Save plants for later
│   │   │   ├── ReviewController.php  → User ratings & reviews
│   │   │   ├── BlogController.php    → Blog articles
│   │   │   ├── CareTipController.php → Plant care guidance
│   │   │   ├── AdminController.php   → Admin operations
│   │   │   └── UploadController.php  → File/image handling
│   │   │
│   │   └── Middleware/
│   │       └── AdminMiddleware.php   → Protect admin routes
│   │
│   ├── Models/                       # Database models (Eloquent ORM)
│   │   ├── User.php                  → User accounts (customer/admin)
│   │   ├── Plant.php                 → Plant products
│   │   ├── Cart.php                  → Shopping cart
│   │   ├── CartItem.php              → Individual cart items
│   │   ├── Order.php                 → Customer orders
│   │   ├── OrderItem.php             → Items within orders
│   │   ├── Review.php                → Plant reviews & ratings
│   │   ├── Wishlist.php              → Saved plants
│   │   ├── Blog.php                  → Blog articles
│   │   └── CareTip.php               → Plant care tips
│   │
│   └── Providers/
│       └── AppServiceProvider.php    → App configuration bootstrap
│
├── database/                         # Database layer
│   ├── migrations/                   # Database schema definitions
│   │   ├── create_users_table.php
│   │   ├── create_plants_table.php
│   │   ├── create_carts_table.php
│   │   ├── create_orders_table.php
│   │   ├── create_order_items_table.php
│   │   ├── create_reviews_table.php
│   │   ├── create_wishlists_table.php
│   │   ├── create_blogs_table.php
│   │   └── create_care_tips_table.php
│   │
│   ├── factories/                    # Test data factories
│   │   └── UserFactory.php
│   │
│   └── seeders/                      # Database seed data
│       └── AdminUserSeeder.php
│
├── routes/                           # URL routing
│   ├── api.php                       → All API endpoints definition
│   ├── web.php                       → Web routes (if any)
│   └── console.php                   → Command routes
│
├── config/                           # Configuration files
│   ├── app.php                       → App configuration
│   ├── database.php                  → Database connection settings
│   ├── auth.php                      → Authentication config
│   ├── cors.php                      → Cross-origin settings
│   ├── sanctum.php                   → Token authentication config
│   └── filesystems.php               → File storage config
│
├── bootstrap/                        # Bootstrap application
│   ├── app.php                       → Bootstrap app instance
│   └── providers.php                 → Service provider registration
│
├── public/                           # Public assets
│   ├── index.php                     → Application entry point
│   ├── storage/                      → Uploaded files (symlink)
│   └── robots.txt
│
├── storage/                          # Runtime storage
│   ├── app/                          → Application files
│   ├── logs/                         → Application logs
│   └── framework/                    → Framework cache
│
├── tests/                            # Test suite
│   ├── Feature/                      → Feature tests
│   ├── Unit/                         → Unit tests
│   └── TestCase.php                  → Base test configuration
│
├── vendor/                           # Composer dependencies (auto-generated)
├── composer.json                     → PHP dependency manager config
├── artisan                           → Laravel command-line tool
├── phpunit.xml                       → Testing configuration
└── README.md                         → Original Laravel README
```

#### Key Backend Technologies:
- **Framework**: Laravel 11
- **ORM**: Eloquent (Object-Relational Mapping)
- **Authentication**: Laravel Sanctum for API tokens
- **Database**: MySQL with schema migrations
- **Testing**: PHPUnit
- **PHP Version**: ^8.2

---

### 2.3 FRONTEND STRUCTURE (React)

#### Location: `Nepal-Cozy-Care-frontend/`

```
Nepal-Cozy-Care-frontend/
│
├── src/                              # Source code directory
│   │
│   ├── pages/                        # Page components (routes)
│   │   ├── Home.tsx                  → Landing page
│   │   ├── Plants.tsx                → All plants catalog
│   │   ├── ProductDetail.tsx         → Single plant details
│   │   ├── PlantFinder.tsx           → Plant recommendation tool
│   │   ├── PlantHealthChecker.tsx    → Plant diagnosis tool
│   │   │
│   │   ├── Cart.tsx                  → Shopping cart page
│   │   ├── Checkout.tsx              → (implied) Order checkout
│   │   │
│   │   ├── CareTips.tsx              → Plant care tips list
│   │   ├── CareTipDetail.tsx         → Individual care tips
│   │   │
│   │   ├── Blogs.tsx                 → Blog articles list
│   │   │
│   │   ├── TrackOrder.tsx            → Order tracking
│   │   ├── ShippingDelivery.tsx       → Shipping info
│   │   │
│   │   ├── Login.tsx                 → User login page
│   │   ├── Register.tsx              → User registration page
│   │   │
│   │   ├── admin/                    → Admin panel pages
│   │   │   ├── ManageBlogs.tsx       → Blog management
│   │   │   ├── ManagePlants.tsx      → (implied) Product management
│   │   │   ├── ManageOrders.tsx      → (implied) Order management
│   │   │   └── ...other admin pages
│   │   │
│   │   ├── AdminDashboard.tsx        → Admin overview
│   │   ├── About.tsx                 → About page
│   │   ├── Contact.tsx               → Contact page
│   │   ├── PopularItemsPage.tsx      → Featured products
│   │   ├── Pots.tsx                  → Pot/container catalog
│   │   └── auth.css                  → Auth page styling
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── Header.tsx                → Navigation header
│   │   ├── Footer.tsx                → Page footer
│   │   ├── ProductCard.tsx           → Plant product card
│   │   ├── CartItem.tsx              → Cart item component
│   │   ├── ReviewCard.tsx            → Review display
│   │   ├── Navbar.tsx                → Navigation bar
│   │   └── ...other UI components
│   │
│   ├── services/                     # API communication layer
│   │   ├── api.ts                    → Axios API client setup
│   │   ├── authService.ts            → Authentication API calls
│   │   ├── plantService.ts           → Plant API calls
│   │   ├── cartService.ts            → Cart API calls
│   │   ├── orderService.ts           → Order API calls
│   │   └── ...other service modules
│   │
│   ├── types/                        # TypeScript interfaces/types
│   │   ├── index.ts                  → Type definitions
│   │   ├── Plant.ts                  → Plant type interface
│   │   ├── Order.ts                  → Order type interface
│   │   ├── User.ts                   → User type interface
│   │   └── ...other type definitions
│   │
│   ├── lib/                          # Utility functions
│   │   ├── utils.ts                  → Helper functions
│   │   └── constants.ts              → App constants
│   │
│   ├── styles/                       # Global styles
│   │   ├── index.css                 → Global CSS
│   │   └── components.css            → Component styles
│   │
│   ├── assets/                       # Static assets
│   │   ├── images/                   → Image files
│   │   └── icons/                    → Icon files
│   │
│   ├── App.tsx                       → Root component
│   ├── App.css                       → App-level styles
│   ├── main.tsx                      → Application entry point
│   └── index.css                     → Base styles
│
├── public/                           # Static files served as-is
│   └── images/                       → Public images
│
├── postcss.config.js                 → PostCSS configuration
├── tailwind.config.js                → Tailwind CSS configuration
├── tsconfig.json                     → TypeScript configuration
├── tsconfig.app.json                 → App-specific TypeScript config
├── tsconfig.node.json                → Node environment TypeScript config
├── vite.config.ts                    → Vite build tool configuration
├── eslint.config.js                  → Code linting rules
├── index.html                        → HTML entry point
├── package.json                      → NPM dependencies and scripts
└── README.md                         → Frontend README
```

#### Key Frontend Technologies:
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Routing**: React Router DOM v7
- **UI Icons**: Lucide React
- **HTTP Client**: Axios (for API calls)

---

## 3. DATABASE SCHEMA AND MODELS

### 3.1 Database Tables Overview

#### `users` Table
**Purpose**: Store user accounts (customers and admins)
**Key Columns**:
- `id` (Primary Key)
- `name` (User's full name)
- `email` (Unique email address)
- `password` (Hashed password)
- `role` (Enum: 'customer' or 'admin')
- `email_verified_at` (Email verification timestamp)
- `created_at`, `updated_at` (Timestamps)

**Relationships**:
- One user can have many orders
- One user can have many cart items
- One user can have many wishlist items
- One user can have many reviews
- One user can have many blogs (if admin)

---

#### `plants` Table
**Purpose**: Store plant products for sale
**Key Columns**:
- `id` (Primary Key)
- `name` (Plant name)
- `scientific_name` (Botanical name)
- `category` (Indoor, Outdoor, Flowering, Succulent, etc.)
- `difficulty` (Easy, Medium, Hard)
- `light` (Light requirement: Low, Medium, Bright)
- `water` (Watering frequency)
- `soil` (Soil type requirements)
- `temperature` (Temperature range)
- `humidity` (Humidity requirements)
- `rooms` (Array: suitable rooms - Bedroom, Living Room, Office, etc.)
- `quantity_categories` (Array: size variants)
- `fertilizer` (Fertilizer recommendations)
- `description` (Product description)
- `survival_guide` (Survival tips)
- `care_instructions` (Detailed care guide)
- `price` (Selling price in NPR)
- `stock` (Available quantity)
- `image` (Image URL/path)
- `is_active` (Boolean: available for sale)
- `created_at`, `updated_at` (Timestamps)

**Relationships**:
- One plant can have many reviews
- One plant can have many wishlist entries
- One plant can appear in many carts
- One plant can appear in many orders (via order_items)

---

#### `carts` Table
**Purpose**: Store shopping cart for each user (currently active items)
**Key Columns**:
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `plant_id` (Foreign Key to plants)
- `quantity` (Number of items)
- `created_at`, `updated_at` (Timestamps)

**Constraints**:
- UNIQUE(user_id, plant_id) - Only one cart entry per user per plant

**Relationships**:
- Belongs to user
- Belongs to plant

---

#### `orders` Table
**Purpose**: Store customer orders after checkout
**Key Columns**:
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `status` (pending, processing, shipped, delivered, cancelled)
- `payment_status` (unpaid, paid, failed, refunded)
- `subtotal` (Sum before fees)
- `delivery_fee` (Shipping charge)
- `tax` (Tax amount)
- `total` (Final total)
- `shipping_name` (Recipient name)
- `shipping_phone` (Contact phone)
- `shipping_address` (Delivery address)
- `created_at`, `updated_at` (Timestamps)

**Relationships**:
- Belongs to user
- Has many order_items
- Has many plants (through order_items)

---

#### `order_items` Table
**Purpose**: Store individual items within an order
**Key Columns**:
- `id` (Primary Key)
- `order_id` (Foreign Key to orders)
- `plant_id` (Foreign Key to plants)
- `quantity` (Items ordered)
- `price` (Price snapshot at purchase time)
- `line_total` (quantity × price)
- `created_at`, `updated_at` (Timestamps)

**Important Note**: Price is stored as snapshot to preserve historical data even if plant price changes later.

---

#### `wishlists` Table
**Purpose**: Save plants for later purchase (Like/Favorites)
**Key Columns**:
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `plant_id` (Foreign Key to plants)
- `created_at`, `updated_at` (Timestamps)

**Constraints**:
- UNIQUE(user_id, plant_id) - One wishlist entry per user per plant

---

#### `reviews` Table
**Purpose**: Store user reviews and ratings for plants
**Key Columns**:
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `plant_id` (Foreign Key to plants)
- `rating` (1-5 stars)
- `comment` (Optional review text)
- `created_at`, `updated_at` (Timestamps)

**Constraints**:
- UNIQUE(user_id, plant_id) - One review per user per plant

---

#### `blogs` Table
**Purpose**: Store blog articles and gardening tips
**Key Columns**:
- `id` (Primary Key)
- `user_id` (Foreign Key to users - admin author)
- `title` (Article title)
- `slug` (URL-friendly identifier)
- `excerpt` (Short summary)
- `content` (Full article content)
- `image` (Featured image)
- `published_at` (Publishing date)
- `created_at`, `updated_at` (Timestamps)

---

#### `care_tips` Table
**Purpose**: Store plant care tips and guides
**Key Columns**:
- `id` (Primary Key)
- `title` (Tip title)
- `description` (Tip content)
- `category` (Type of care: Watering, Lighting, Fertilizing, etc.)
- `image` (Tip image)
- `created_at`, `updated_at` (Timestamps)

---

### 3.2 Database Relationships Diagram

```
                    User (1)
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ↓             ↓             ↓
     Cart       Order (*)      Wishlist
        │             │
        │             ↓
        │         OrderItem (*)
        │             │
        └─────────┬───┘
                  ↓
               Plant (*)
                  │
        ┌─────────┼─────────┐
        │         │         │
        ↓         ↓         ↓
      Review  Wishlist  OrderItem

User (1) ──→ (*) Blog (admin authors blogs)
```

---

## 4. API ENDPOINTS SUMMARY

### 4.1 Authentication Endpoints
```
POST   /api/auth/register       → Register new user
POST   /api/auth/login          → User login (returns token)
POST   /api/auth/logout         → User logout (invalidate token)
GET    /api/auth/user           → Get current user profile
POST   /api/auth/update-profile → Update user information
```

### 4.2 Plant Endpoints
```
GET    /api/plants              → Get all plants (with filters)
GET    /api/plants/{id}         → Get plant details
POST   /api/plants              → Create plant (Admin only)
PUT    /api/plants/{id}         → Update plant (Admin only)
DELETE /api/plants/{id}         → Delete plant (Admin only)
```

### 4.3 Cart Endpoints
```
GET    /api/cart                → Get user's cart items
POST   /api/cart                → Add item to cart
PUT    /api/cart/{id}           → Update cart item quantity
DELETE /api/cart/{id}           → Remove item from cart
```

### 4.4 Order Endpoints
```
POST   /api/checkout            → Create new order from cart
GET    /api/orders              → Get user's orders
GET    /api/orders/{id}         → Get order details
PUT    /api/orders/{id}         → Update order status (Admin)
GET    /api/orders/{id}/items   → Get items in order
```

### 4.5 Wishlist Endpoints
```
GET    /api/wishlist            → Get user's wishlist
POST   /api/wishlist            → Add plant to wishlist
DELETE /api/wishlist/{id}       → Remove from wishlist
```

### 4.6 Review Endpoints
```
GET    /api/plants/{id}/reviews → Get plant reviews
POST   /api/reviews             → Create review
PUT    /api/reviews/{id}        → Update review
DELETE /api/reviews/{id}        → Delete review
```

### 4.7 Blog Endpoints
```
GET    /api/blogs               → Get all blogs
GET    /api/blogs/{id}          → Get blog details
POST   /api/blogs               → Create blog (Admin only)
PUT    /api/blogs/{id}          → Update blog (Admin only)
DELETE /api/blogs/{id}          → Delete blog (Admin only)
```

### 4.8 Care Tips Endpoints
```
GET    /api/care-tips           → Get all care tips
GET    /api/care-tips/{id}      → Get care tip details
POST   /api/care-tips           → Create care tip (Admin only)
PUT    /api/care-tips/{id}      → Update care tip (Admin only)
DELETE /api/care-tips/{id}      → Delete care tip (Admin only)
```

### 4.9 Admin Endpoints
```
GET    /api/admin/users         → Get all users (Admin only)
GET    /api/admin/orders        → Get all orders (Admin only)
GET    /api/admin/dashboard     → Dashboard statistics (Admin only)
DELETE /api/admin/users/{id}    → Delete user (Admin only)
```

### 4.10 Upload Endpoints
```
POST   /api/upload              → Upload image/file
POST   /api/upload/multiple     → Upload multiple files
```

---

## 5. KEY APPLICATION FEATURES

### 5.1 Authentication & Authorization
- **Token-based authentication** using Laravel Sanctum
- **Two user roles**: Customer and Admin
- **Middleware**: AdminMiddleware protects admin-only routes
- **Security**: Hashed passwords, CORS configuration

### 5.2 Plant Management System
- **Complete CRUD operations** for plant products
- **Rich plant data**: Scientific names, care requirements, images
- **Filtering & Searching**: By category, difficulty, light needs
- **Stock management**: Track available inventory
- **Product variants**: Different size quantities

### 5.3 Shopping Cart & Checkout
- **Dynamic cart**: Add/remove/update quantities
- **Persistent storage**: Cart saved to database
- **Checkout flow**: Convert cart to order with shipment details
- **Order history**: Users can view past orders

### 5.4 Order Management
- **Order lifecycle**: pending → processing → shipped → delivered
- **Payment tracking**: unpaid, paid, failed, refunded states
- **Order details**: Shipping info, totals, tax, delivery fees
- **Snapshot pricing**: Historical price records for orders

### 5.5 User Engagement Features
- **Wishlist**: Save favorite plants for later
- **Reviews & Ratings**: 1-5 star reviews with comments
- **Blog articles**: Educational content about gardening
- **Care tips**: Quick guides for plant maintenance
- **Plant finder**: Personalized plant recommendations
- **Health checker**: Diagnose plant issues

### 5.6 Admin Dashboard
- **Product management**: Add/edit/delete plants
- **Order management**: View and manage orders
- **Blog management**: Create and publish articles
- **User management**: View and manage user accounts
- **Statistics**: Dashboard with key metrics

---

## 6. DEVELOPMENT WORKFLOW

### 6.1 Backend Development
```
Laravel Application Lifecycle:
├── Request arrives at routes/api.php
├── Route matches to appropriate Controller
├── Controller processes request using Models
├── Model queries database using Eloquent ORM
├── Response formatted and returned (JSON)
└── Middleware applies validation/authentication
```

### 6.2 Frontend Development
```
React Application Lifecycle:
├── User interacts with Component/Page
├── Component dispatches an API call via Service
├── Service uses Axios to make HTTP request to Backend
├── Backend responds with data
├── Component receives data and updates UI
└── User sees changes rendered in browser
```

### 6.3 Data Flow Diagram
```
User → Frontend React App
          ↓
    (API Call via Service)
          ↓
    Backend Laravel API
          ↓
    (Middleware/Validation)
          ↓
    Controller → Model
          ↓
    Database (MySQL)
          ↓
    Response (JSON)
          ↓
    Frontend displays data
```

---

## 7. TECHNOLOGY STACK DETAILS

### 7.1 Backend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Laravel | 11 | Web application framework |
| Language | PHP | ^8.2 | Server-side programming |
| Database | MySQL | - | Data persistence |
| Authentication | Sanctum | 4.2 | API token authentication |
| ORM | Eloquent | Built-in | Database abstraction |
| Testing | PHPUnit | 11.5.3 | Unit & feature tests |
| Development | Laravel Sail | 1.41 | Docker-based environment |

### 7.2 Frontend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19 | UI component library |
| Language | TypeScript | ~5.9.3 | Type-safe JavaScript |
| Build Tool | Vite | 7.2.4 | Fast module bundler |
| Styling | Tailwind CSS | 4.1.18 | Utility-first CSS |
| Routing | React Router | 7.13 | Client-side routing |
| HTTP Client | Axios | - | API communication |
| Icons | Lucide React | 0.563 | Icon library |
| Linting | ESLint | 9.39.1 | Code quality |

---

## 8. IMPORTANT ARCHITECTURE CONCEPTS

### 8.1 MVC Pattern (Backend)
- **Model**: Eloquent models representing database tables
- **View**: JSON responses (REST API)
- **Controller**: Business logic and request handling

### 8.2 Component-Based Architecture (Frontend)
- **Pages**: Full page components for routing
- **Components**: Reusable UI components
- **Services**: API communication layer
- **Types**: TypeScript interfaces for type safety

### 8.3 REST API Design
- **Resource-oriented**: Endpoints represent entities (plants, orders, etc.)
- **HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Stateless**: Each request contains all necessary information
- **JSON responses**: Consistent data format

### 8.4 Database Design
- **Relational**: Tables with foreign key relationships
- **Timestamps**: Created_at and updated_at for auditing
- **Migrations**: Version control for database schema
- **Seeders**: Automated data population for testing

---

## 9. SECURITY FEATURES

### 9.1 Authentication
- **Sanctum tokens**: API token-based authentication
- **Password hashing**: Laravel's hash facades for security
- **Role-based access control**: Admin vs Customer roles

### 9.2 Data Protection
- **CORS configuration**: Cross-Origin Resource Sharing rules
- **Middleware validation**: Request validation before processing
- **SQL injection prevention**: Using Eloquent ORM (parameterized queries)
- **XSS protection**: React automatically escapes content

### 9.3 Environment Security
- **Environment variables**: Sensitive data in .env file
- **Not in version control**: .env file should be in .gitignore

---

## 10. SETUP AND DEPLOYMENT

### 10.1 Backend Setup
```bash
# 1. Install dependencies
composer install

# 2. Create environment file
cp .env.example .env

# 3. Generate app key
php artisan key:generate

# 4. Create database (MySQL)
# Update DATABASE_URL in .env

# 5. Run migrations
php artisan migrate

# 6. Seed data (optional)
php artisan db:seed

# 7. Start server
php artisan serve
```

### 10.2 Frontend Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure API endpoint
# Update services/api.ts with backend URL

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

### 10.3 Database Setup
```bash
# 1. Create MySQL database
CREATE DATABASE nepal_cozy_care;

# 2. Run migrations
php artisan migrate

# 3. Admin setup
php artisan db:seed --class=AdminUserSeeder
```

---

## 11. COMMON QUESTIONS FOR VIVA

### Q1: What is the main purpose of Nepal Cozy Care?
**A**: Nepal Cozy Care is an e-commerce platform for buying indoor plants with comprehensive care information. It helps users browse plants, make purchases, learn about plant care through blogs and tips, and track their orders.

### Q2: Why did you choose Laravel and React?
**A**: 
- **Laravel**: Robust PHP framework with built-in features like Sanctum (authentication), Eloquent ORM, migrations, and a mature ecosystem
- **React**: Modern, component-based frontend framework that makes building interactive UI easier with reusable components and efficient rendering

### Q3: Explain the authentication system
**A**: We use Laravel Sanctum for token-based API authentication. When users register/login, they receive a token. This token is sent with subsequent requests to authenticate the user. The backend validates the token before processing protected routes. We have two roles: customer and admin.

### Q4: How does the shopping cart work?
**A**: The cart is stored in the database (carts table). When a user adds a plant, it creates a cart entry with user_id, plant_id, and quantity. The UNIQUE constraint ensures only one entry per user per plant - adding same plant again just updates quantity. During checkout, cart items are converted to an order.

### Q5: Explain the order system
**A**: When users checkout, a new order is created with status "pending". The cart items are copied to order_items table (preserving price as snapshot). Orders track status (pending→processing→shipped→delivered) and payment_status (unpaid→paid). This allows order history and tracking.

### Q6: What is the purpose of the plant health checker and plant finder?
**A**: 
- **Plant Finder**: Recommends plants based on user's room lighting, space, experience level
- **Health Checker**: Diagnostic tool where users can describe plant symptoms and get troubleshooting advice

### Q7: How is the database structured?
**A**: The database uses relational design with 9 main tables (users, plants, carts, orders, order_items, wishlists, reviews, blogs, care_tips). Tables are connected via foreign keys. For example, orders belongs to users, and order_items belongs to both orders and plants. This maintains referential integrity and data consistency.

### Q8: Explain the role of Controllers and Models
**A**: 
- **Controllers**: Handle incoming requests, perform business logic, interact with models, and return responses
- **Models**: Represent database tables, define relationships with other models, and provide methods to query/manipulate data through Eloquent ORM

### Q9: How do you handle image uploads?
**A**: The UploadController handles image uploads. Images are stored in the storage/app directory (or S3 in production). Plant images, blog featured images, and care tip images are stored this way. The frontend sends multipart/form-data requests with the file.

### Q10: What is the significance of price snapshot in order_items?
**A**: We store the price at the time of purchase in order_items table. This preserves the historical record - even if a plant's price changes later, the order shows what the user actually paid. This is important for accurate financial reporting and order history.

---

## 12. FILE NAMING CONVENTIONS AND STANDARDS

### 12.1 Backend (Laravel/PHP)
- **Controllers**: `NameController.php`, PascalCase
- **Models**: `ModelName.php`, PascalCase, Singular
- **Migrations**: `YYYY_MM_DD_hhmmss_action.php`, snake_case
- **Tables**: Plural (users, plants, orders, etc.)
- **Namespaces**: Follow PSR-4 standard (App\Http\Controllers\Api)

### 12.2 Frontend (React/TypeScript)
- **Components**: `ComponentName.tsx`, PascalCase
- **Pages**: `PageName.tsx`, PascalCase
- **Services**: `serviceName.ts`, camelCase
- **Types**: `TypeName.ts`, PascalCase
- **Styles**: `filename.css`, kebab-case or camelCase

---

## 13. PROJECT METRICS

### Code Statistics
- **Backend Files**: ~10 Controllers, ~9 Models, ~9 Migrations
- **Frontend Pages**: ~15+ pages
- **Components**: Multiple reusable components
- **Database Tables**: 9 main tables
- **API Endpoints**: 30+ endpoints

### Complexity Areas
1. **Cart to Order Conversion**: Complex snapshot logic
2. **Admin Middleware**: Route protection system  
3. **Plant Filtering**: Multiple filter criteria
4. **Order Management**: Status and payment tracking
5. **Image Handling**: File upload and storage

---

## 14. FUTURE ENHANCEMENTS

Potential areas for improvement:
1. **Payment Gateway Integration**: Khalti, esewa, StripeNPR
2. **Email Notifications**: Order confirmations, password resets
3. **Real-time Features**: WebSockets for live chat support
4. **Advanced Analytics**: Dashboard metrics and reporting
5. **Mobile App**: Native iOS/Android versions
6. **Machine Learning**: Plant disease detection from photos
7. **Inventory Management**: Automated reorder notifications
8. **Multi-language Support**: Nepali and English UI

---

## 15. QUICK REFERENCE CHEAT SHEET

### File Locations
- **Backend Entry**: `Nepal-Cozy-Care-backend/public/index.php`
- **Frontend Entry**: `Nepal-Cozy-Care-frontend/src/main.tsx`
- **Routes**: `Nepal-Cozy-Care-backend/routes/api.php`
- **DB Config**: `Nepal-Cozy-Care-backend/config/database.php`
- **API Services**: `Nepal-Cozy-Care-frontend/src/services/`

### Key Commands
```bash
# Backend
php artisan serve              # Start Laravel server
php artisan migrate            # Run migrations
php artisan db:seed            # Seed database
php artisan tinker             # Interactive shell

# Frontend
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run lint                    # Check code quality
npm run preview                 # Preview production build
```

### Key Models & Relationships
- User hasMany Orders, Carts, Wishlists, Reviews
- Plant hasMany Reviews, Wishlists, OrderItems
- Order hasMany OrderItems, belongsTo User
- OrderItem belongsTo Order, Plant

---

## 16. CONCLUSION

Nepal Cozy Care is a well-architected, full-stack e-commerce application demonstrating:
- Modern web development practices
- Clean code principles and design patterns
- Full CRUD operations
- User authentication and authorization
- Database design and relationships
- API design and integration
- Frontend component architecture

The project is suitable for learning and demonstrating software development skills across frontend, backend, and database layers.

---

**Document Version**: 1.0  
**Last Updated**: February 21, 2026  
**Project Status**: Complete and Functional

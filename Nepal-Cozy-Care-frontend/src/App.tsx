import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import SellerProtectedRoute from './components/seller/SellerProtectedRoute'
import Layout from './components/layout/Layout'
import SellerLayout from './components/seller/SellerLayout'

const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ProductDetail = lazy(() =>
  import('./pages/ProductDetail').then((module) => ({ default: module.ProductDetail }))
)
const PlantFinder = lazy(() =>
  import('./pages/PlantFinder').then((module) => ({ default: module.PlantFinder }))
)
const Home = lazy(() => import('./pages/Home'))
const ShippingDelivery = lazy(() => import('./pages/ShippingDelivery'))
const Plants = lazy(() => import('./pages/Plants'))
const Pots = lazy(() => import('./pages/Pots'))
const Blogs = lazy(() => import('./pages/Blogs'))
const Contact = lazy(() => import('./pages/Contact'))
const Cart = lazy(() => import('./pages/Cart'))
const About = lazy(() => import('./pages/About'))
const CareTips = lazy(() => import('./pages/CareTips'))
const CareTipDetail = lazy(() => import('./pages/CareTipDetail'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const PlantHealthChecker = lazy(() => import('./pages/PlantHealthChecker'))
const RoomDesigner = lazy(() => import('./pages/RoomDesigner'))
const PopularItemsPage = lazy(() => import('./pages/PopularItemsPage'))
const BestSellersPage = lazy(() => import('./pages/BestSellersPage'))
const HelpCenter = lazy(() => import('./pages/HelpCenter'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OurMission = lazy(() => import('./pages/OurMission'))
const MyAccount = lazy(() => import('./pages/MyAccount'))
const MyGarden = lazy(() => import('./pages/MyGarden'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ManagePlants = lazy(() => import('./pages/admin/ManagePlants'))
const ManageDecorations = lazy(() => import('./pages/admin/ManageDecorations'))
const ManageAccessories = lazy(() => import('./pages/admin/ManageAccessories'))
const ManageBlogs = lazy(() => import('./pages/admin/ManageBlogs'))
const ManageCareTips = lazy(() => import('./pages/admin/ManageCareTips'))
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const ManageSeasonalReminders = lazy(() => import('./pages/admin/ManageSeasonalReminders'))
const ManageContactMessages = lazy(() => import('./pages/admin/ManageContactMessages'))
const ManageGardenEntries = lazy(() => import('./pages/admin/ManageGardenEntries'))
const ManageHomepage = lazy(() => import('./pages/admin/ManageHomepage'))
const ManagePageContent = lazy(() => import('./pages/admin/ManagePageContent'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettings'))
const ManageSellerApplications = lazy(() => import('./pages/admin/ManageSellerApplications'))
const ManageShops = lazy(() => import('./pages/admin/ManageShops'))
const ManageMarketplaceProducts = lazy(() => import('./pages/admin/ManageMarketplaceProducts'))
const ShopsDirectory = lazy(() => import('./pages/shops/ShopsDirectory'))
const ShopDetail = lazy(() => import('./pages/shops/ShopDetail'))
const BecomeASeller = lazy(() => import('./pages/seller/BecomeASeller'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerShop = lazy(() => import('./pages/seller/SellerShop'))
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'))
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'))
const SellerBlogs = lazy(() => import('./pages/seller/SellerBlogs'))
const SellerCareTips = lazy(() => import('./pages/seller/SellerCareTips'))

function RouteLoading() {
  return (
    <div role="status" aria-live="polite" className="route-loading">
      Loading page...
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/plants/:id" element={<ProductDetail />} />
        <Route path="/pots" element={<Pots />} />
        <Route path="/popular-items" element={<PopularItemsPage />} />
        <Route path="/best-sellers" element={<BestSellersPage />} />
        <Route path="/plant-finder" element={<PlantFinder />} />
        <Route path="/plant-health-checker" element={<PlantHealthChecker />} />
        <Route path="/room-designer" element={<RoomDesigner />} />
        <Route path="/care-tips" element={<CareTips />} />
        <Route path="/care-tips/:id" element={<CareTipDetail />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/shipping" element={<ShippingDelivery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/mission" element={<OurMission />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/my-garden" element={<MyGarden />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/shops" element={<ShopsDirectory />} />
        <Route path="/shops/:slug" element={<ShopDetail />} />
        <Route path="/become-a-seller" element={<BecomeASeller />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/homepage"
        element={
          <AdminProtectedRoute>
            <ManageHomepage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/page-content"
        element={
          <AdminProtectedRoute>
            <ManagePageContent />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/page_content"
        element={
          <AdminProtectedRoute>
            <ManagePageContent />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/plants"
        element={
          <AdminProtectedRoute>
            <ManagePlants />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/decorations"
        element={
          <AdminProtectedRoute>
            <ManageDecorations />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/accessories"
        element={
          <AdminProtectedRoute>
            <ManageAccessories />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/blogs"
        element={
          <AdminProtectedRoute>
            <ManageBlogs />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/care-tips"
        element={
          <AdminProtectedRoute>
            <ManageCareTips />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminProtectedRoute>
            <ManageOrders />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <ManageUsers />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminProtectedRoute>
            <Reports />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/seasonal-reminders"
        element={
          <AdminProtectedRoute>
            <ManageSeasonalReminders />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/contact-messages"
        element={
          <AdminProtectedRoute>
            <ManageContactMessages />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/garden-entries"
        element={
          <AdminProtectedRoute>
            <ManageGardenEntries />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <AdminSettingsPage />
          </AdminProtectedRoute>
        }
      />

      {/* Super Admin Marketplace Routes */}
      <Route
        path="/admin/seller-applications"
        element={
          <AdminProtectedRoute>
            <ManageSellerApplications />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/shops"
        element={
          <AdminProtectedRoute>
            <ManageShops />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/marketplace-products"
        element={
          <AdminProtectedRoute>
            <ManageMarketplaceProducts />
          </AdminProtectedRoute>
        }
      />

      {/* Seller Dashboard Routes */}
      <Route
        path="/seller"
        element={
          <SellerProtectedRoute>
            <SellerLayout />
          </SellerProtectedRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="shop" element={<SellerShop />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="blogs" element={<SellerBlogs />} />
        <Route path="care-tips" element={<SellerCareTips />} />
        <Route path="settings" element={<SellerShop />} />
      </Route>
      </Routes>
    </Suspense>
  )
}
export default App

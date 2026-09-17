import { Routes, Route } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import Login from './pages/Login'
import { ProductDetail } from './pages/ProductDetail'
import { PlantFinder } from './pages/PlantFinder'
import Home from './pages/Home'
import ShippingDelivery from './pages/ShippingDelivery'
import Plants from './pages/Plants'
import Pots from './pages/Pots'
import Blogs from './pages/Blogs'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import About from './pages/About'
import CareTips from './pages/CareTips'
import CareTipDetail from './pages/CareTipDetail'
import TrackOrder from './pages/TrackOrder'
import PlantHealthChecker from './pages/PlantHealthChecker'
import PopularItemsPage from './pages/PopularItemsPage'
import AdminDashboard from './pages/AdminDashboard'
import ManagePlants from './pages/admin/ManagePlants'
import ManageAccessories from './pages/admin/ManageAccessories'
import ManageBlogs from './pages/admin/ManageBlogs'
import ManageCareTips from './pages/admin/ManageCareTips'
import ManageOrders from './pages/admin/ManageOrders'
import ManageUsers from './pages/admin/ManageUsers'
import Reports from './pages/admin/Reports'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import BestSellersPage from './pages/BestSellersPage'
import HelpCenter from './pages/HelpCenter'
import Checkout from './pages/Checkout'
import OurMission from './pages/OurMission'
import MyAccount from './pages/MyAccount'
import MyGarden from './pages/MyGarden'
import BlogDetail from './pages/BlogDetail'
import ManageSeasonalReminders from './pages/admin/ManageSeasonalReminders'
import ManageContactMessages from './pages/admin/ManageContactMessages'
import ManageGardenEntries from './pages/admin/ManageGardenEntries'
import ForgotPassword from './pages/ForgotPassword'
import ManageHomepage from './pages/admin/ManageHomepage'
import ManagePageContent from './pages/admin/ManagePageContent'
import AdminSettingsPage from './pages/admin/AdminSettings'
import ManageSellerApplications from './pages/admin/ManageSellerApplications'
import ManageShops from './pages/admin/ManageShops'
import ManageMarketplaceProducts from './pages/admin/ManageMarketplaceProducts'
import ShopsDirectory from './pages/shops/ShopsDirectory'
import ShopDetail from './pages/shops/ShopDetail'
import BecomeASeller from './pages/seller/BecomeASeller'
import SellerProtectedRoute from './components/seller/SellerProtectedRoute'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerShop from './pages/seller/SellerShop'
import SellerProducts from './pages/seller/SellerProducts'
import SellerOrders from './pages/seller/SellerOrders'
function App() {
  return (
    <Routes>
      {}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {}
      <Route path="/plants" element={<Plants />} />
      <Route path="/plants/:id" element={<ProductDetail />} />
      <Route path="/pots" element={<Pots />} />
      <Route path="/popular-items" element={<PopularItemsPage />} />
      <Route path="/best-sellers" element={<BestSellersPage />} />
      {}
      <Route path="/plant-finder" element={<PlantFinder />} />
      <Route path="/plant-health-checker" element={<PlantHealthChecker />} />
      <Route path="/care-tips" element={<CareTips />} />
      <Route path="/care-tips/:id" element={<CareTipDetail />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:id" element={<BlogDetail />} />
      {}
      <Route path="/shipping" element={<ShippingDelivery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/mission" element={<OurMission />} />
      <Route path="/help-center" element={<HelpCenter />} />
      {}
      <Route path="/cart" element={<Cart />} />
      <Route path="/account" element={<MyAccount />} />
      <Route path="/my-garden" element={<MyGarden />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/track-order" element={<TrackOrder />} />
      {}
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

      {/* Public Marketplace Routes */}
      <Route path="/shops" element={<ShopsDirectory />} />
      <Route path="/shops/:slug" element={<ShopDetail />} />
      <Route path="/become-a-seller" element={<BecomeASeller />} />

      {/* Seller Dashboard Routes */}
      <Route
        path="/seller"
        element={
          <SellerProtectedRoute>
            <SellerDashboard />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <SellerProtectedRoute>
            <SellerDashboard />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/shop"
        element={
          <SellerProtectedRoute>
            <SellerShop />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/products"
        element={
          <SellerProtectedRoute>
            <SellerProducts />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <SellerProtectedRoute>
            <SellerOrders />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <SellerProtectedRoute>
            <SellerShop />
          </SellerProtectedRoute>
        }
      />
    </Routes>
  )
}
export default App

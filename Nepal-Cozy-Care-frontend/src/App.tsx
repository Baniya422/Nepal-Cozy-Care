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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/plants" element={<Plants />} />
      <Route path="/plants/:id" element={<ProductDetail />} />
      <Route path="/pots" element={<Pots />} />
      <Route path="/popular-items" element={<PopularItemsPage />} />
      <Route path="/plant-finder" element={<PlantFinder />} />
      <Route path="/shipping" element={<ShippingDelivery />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/about" element={<About />} />
      <Route path="/care-tips" element={<CareTips />} />
      <Route path="/care-tips/:id" element={<CareTipDetail />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/help-center" element={<HelpCenter />} />
      <Route path="/plant-health-checker" element={<PlantHealthChecker />} />
      <Route path="/best-sellers" element={<BestSellersPage />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
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
    </Routes>
  )
}

export default App

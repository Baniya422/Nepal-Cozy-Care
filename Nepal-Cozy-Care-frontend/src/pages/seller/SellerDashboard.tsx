import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Plus,
  Store,
  ChevronRight,
  Inbox,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import "../../components/seller/seller.css";
import type { SellerStats, Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/seller/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setStats(json.data.stats);
          setShop(json.data.shop);
          setRecentOrders(json.data.recent_orders || []);
        }
      } catch (err) {
        console.error("Failed to load seller dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <SellerLayout>
      <div className="seller-page-content">
        {/* Welcome Banner */}
        <div className="seller-banner">
          <div>
            <div className="seller-banner-badge">
              <Store size={14} />
              <span>{shop?.name || "Partner Nursery"}</span>
            </div>
            <h2 className="seller-banner-title">Seller Overview</h2>
            <p className="seller-banner-desc">
              Track your nursery products, approval requests, and customer shipments in real time.
            </p>
          </div>
          <div className="seller-banner-actions">
            <Link to="/seller/products?action=new" className="seller-banner-btn-main">
              <Plus size={16} />
              <span>Add Product</span>
            </Link>
            <Link to="/seller/shop" className="seller-banner-btn-secondary">
              <Store size={15} />
              <span>Edit Shop</span>
            </Link>
          </div>
        </div>

        {/* 6 Stats Grid */}
        {loading ? (
          <div className="seller-stats-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="seller-stat-card" style={{ minHeight: "110px", opacity: 0.6 }}>
                <div style={{ width: "60%", height: "12px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "12px" }} />
                <div style={{ width: "40%", height: "24px", background: "#cbd5e1", borderRadius: "6px" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="seller-stats-grid">
            <div className="seller-stat-card">
              <div className="seller-stat-head">
                <span className="seller-stat-label">Total Products</span>
                <div className="seller-stat-icon" style={{ background: "#f1f5f9", color: "#475569" }}>
                  <Package size={16} />
                </div>
              </div>
              <div>
                <div className="seller-stat-value">{stats?.total_products ?? 0}</div>
                <div className="seller-stat-caption">In your shop</div>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-head">
                <span className="seller-stat-label">Active Live</span>
                <div className="seller-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div>
                <div className="seller-stat-value" style={{ color: "#059669" }}>
                  {stats?.active_products ?? 0}
                </div>
                <div className="seller-stat-caption" style={{ color: "#059669", fontWeight: 600 }}>
                  Visible to buyers
                </div>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-head">
                <span className="seller-stat-label">Pending Review</span>
                <div className="seller-stat-icon" style={{ background: "#fefce8", color: "#ca8a04" }}>
                  <Clock size={16} />
                </div>
              </div>
              <div>
                <div className="seller-stat-value" style={{ color: "#ca8a04" }}>
                  {stats?.pending_products ?? 0}
                </div>
                <div className="seller-stat-caption" style={{ color: "#a16207", fontWeight: 600 }}>
                  Awaiting approval
                </div>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-head">
                <span className="seller-stat-label">Low Stock</span>
                <div className="seller-stat-icon" style={{ background: "#fef2f2", color: "#e11d48" }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div>
                <div className="seller-stat-value" style={{ color: "#e11d48" }}>
                  {stats?.low_stock_products ?? 0}
                </div>
                <div className="seller-stat-caption" style={{ color: "#e11d48", fontWeight: 600 }}>
                  &lt; 5 units left
                </div>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-head">
                <span className="seller-stat-label">Total Orders</span>
                <div className="seller-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div>
                <div className="seller-stat-value" style={{ color: "#2563eb" }}>
                  {stats?.total_orders ?? 0}
                </div>
                <div className="seller-stat-caption" style={{ color: "#2563eb", fontWeight: 600 }}>
                  Order shipments
                </div>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-head">
                <span className="seller-stat-label">Total Sales</span>
                <div className="seller-stat-icon" style={{ background: "#ecfdf5", color: "#047857" }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div>
                <div className="seller-stat-value" style={{ color: "#0f172a", fontSize: "1.45rem" }}>
                  Rs. {(stats?.total_sales ?? 0).toLocaleString()}
                </div>
                <div className="seller-stat-caption" style={{ color: "#059669", fontWeight: 600 }}>
                  Earned revenue
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders Section */}
        <div className="seller-card">
          <div className="seller-card-header">
            <div>
              <h3>Recent Order Items</h3>
              <p>Products recently purchased from your nursery</p>
            </div>
            <Link to="/seller/orders" className="seller-card-link">
              <span>View All Orders</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon">
                <Inbox size={26} />
              </div>
              <h4>No orders received yet</h4>
              <p>Once customers place orders for your approved nursery plants, they will appear right here.</p>
            </div>
          ) : (
            <div className="seller-table-container">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Line Total</th>
                    <th>Recipient</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: "#047857" }}>#{item.order_id}</td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {Number(item.price).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>
                        Rs. {Number(item.line_total).toLocaleString()}
                      </td>
                      <td>{item.customer_name}</td>
                      <td>
                        <span className={`seller-badge seller-badge-${item.status?.toLowerCase() || "pending"}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}

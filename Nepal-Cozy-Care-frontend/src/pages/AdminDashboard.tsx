import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import "../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface DashboardStats {
  totalPlants: number;
  totalOrders: number;
  totalUsers: number;
  totalSales: number;
  plantsChange: number;
  ordersChange: number;
  usersChange: number;
  salesChange: number;
}

interface RecentOrder {
  id: number;
  order_id: string;
  customer: string;
  amount: number;
  status: string;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlants: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0,
    plantsChange: 0,
    ordersChange: 0,
    usersChange: 0,
    salesChange: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch dashboard stats
      const statsRes = await fetch(`${API}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const data = statsData.data;
        setStats({
          totalPlants: data.total_plants,
          totalOrders: data.total_orders,
          totalUsers: data.total_users,
          totalSales: data.total_sales,
          plantsChange: data.changes.plants,
          ordersChange: data.changes.orders,
          usersChange: data.changes.users,
          salesChange: data.changes.sales,
        });
      }

      // Fetch recent orders
      const ordersRes = await fetch(`${API}/api/admin/dashboard/recent-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.data || []);
      }

      // Fetch top products
      const productsRes = await fetch(`${API}/api/admin/dashboard/top-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const products = productsData.data || [];
        const topProductsData = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          sales: product.total_sales,
          revenue: parseFloat(product.total_revenue),
        }));
        setTopProducts(topProductsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "status-completed";
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Plants",
      value: stats.totalPlants,
      change: stats.plantsChange,
      icon: Leaf,
      color: "green",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: stats.ordersChange,
      icon: ShoppingBag,
      color: "blue",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: stats.usersChange,
      icon: Users,
      color: "purple",
    },
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalSales),
      change: stats.salesChange,
      icon: DollarSign,
      color: "orange",
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Welcome Section */}
        <div className="admin-welcome">
          <h2>Dashboard Overview</h2>
          <p>Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          {loading ? (
            // Skeleton loading for stat cards
            <>
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="admin-stat-card skeleton">
                  <div className="admin-stat-icon skeleton-icon"></div>
                  <div className="admin-stat-content">
                    <div className="admin-stat-value skeleton-text"></div>
                    <div className="admin-stat-title skeleton-text-small"></div>
                  </div>
                  <div className="admin-stat-change skeleton-badge"></div>
                </div>
              ))}
            </>
          ) : (
            statCards.map((stat, index) => (
              <div key={index} className={`admin-stat-card ${stat.color}`}>
                <div className="admin-stat-icon">
                  <stat.icon size={24} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{stat.value}</div>
                  <div className="admin-stat-title">{stat.title}</div>
                </div>
                <div
                  className={`admin-stat-change ${
                    stat.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <span>{stat.change >= 0 ? "+" : ""}{stat.change}%</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="admin-dashboard-grid">
          {/* Recent Orders */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="admin-view-all">
                View All
              </Link>
            </div>
            <div className="admin-card-body">
              {loading ? (
                <div className="admin-loading">Loading...</div>
              ) : recentOrders.length === 0 ? (
                <div className="admin-empty">No recent orders</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">{order.order_id}</td>
                        <td>{order.customer}</td>
                        <td className="amount">{formatCurrency(order.amount)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Top Products</h3>
              <Link to="/admin/plants" className="admin-view-all">
                View All
              </Link>
            </div>
            <div className="admin-card-body">
              {loading ? (
                <div className="admin-loading">Loading...</div>
              ) : topProducts.length === 0 ? (
                <div className="admin-empty">No products data</div>
              ) : (
                <div className="admin-top-products">
                  {topProducts.map((product) => (
                    <div key={product.id} className="admin-product-item">
                      <div className="admin-product-info">
                        <h4>{product.name}</h4>
                        <span className="admin-product-sales">
                          {product.sales} sales
                        </span>
                      </div>
                      <div className="admin-product-revenue">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

export default function Reports() {
  const [dateRange, setDateRange] = useState("last30days");

  // Mock report data
  const reportData = {
    sales: {
      total: 24567.89,
      change: 12.5,
      orders: 892,
      avgOrderValue: 27.54,
    },
    products: {
      topSelling: [
        { name: "Monstera Deliciosa", sales: 145, revenue: 4345.55 },
        { name: "Snake Plant", sales: 132, revenue: 3298.68 },
        { name: "Peace Lily", sales: 98, revenue: 1959.02 },
        { name: "Fiddle Leaf Fig", sales: 87, revenue: 4345.65 },
        { name: "Pothos", sales: 76, revenue: 1215.24 },
      ],
      lowStock: [
        { name: "Fiddle Leaf Fig", stock: 5 },
        { name: "Rubber Plant", stock: 8 },
        { name: "Pruning Shears", stock: 3 },
      ],
    },
    customers: {
      new: 234,
      returning: 156,
      total: 1234,
    },
    ordersByStatus: {
      pending: 23,
      processing: 45,
      shipped: 67,
      delivered: 756,
      cancelled: 12,
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const totalOrders = Object.values(reportData.ordersByStatus).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Reports & Analytics</h2>
            <p>View detailed reports about your store performance</p>
          </div>
          <div className="admin-header-actions">
            <select
              className="admin-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisYear">This Year</option>
            </select>
            <button className="admin-btn admin-btn-secondary">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card blue">
            <div className="admin-stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-value">
                {formatPrice(reportData.sales.total)}
              </div>
              <div className="admin-stat-title">Total Sales</div>
            </div>
            <div
              className={`admin-stat-change ${
                reportData.sales.change >= 0 ? "positive" : "negative"
              }`}
            >
              {reportData.sales.change >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>{reportData.sales.change >= 0 ? "+" : ""}
                {reportData.sales.change}%</span>
            </div>
          </div>

          <div className="admin-stat-card green">
            <div className="admin-stat-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-value">{reportData.sales.orders}</div>
              <div className="admin-stat-title">Total Orders</div>
            </div>
            <div className="admin-stat-change positive">
              <TrendingUp size={14} />
              <span>+8%</span>
            </div>
          </div>

          <div className="admin-stat-card purple">
            <div className="admin-stat-icon">
              <Users size={24} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-value">
                {reportData.customers.new}
              </div>
              <div className="admin-stat-title">New Customers</div>
            </div>
            <div className="admin-stat-change positive">
              <TrendingUp size={14} />
              <span>+15%</span>
            </div>
          </div>

          <div className="admin-stat-card orange">
            <div className="admin-stat-icon">
              <Package size={24} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-value">
                {formatPrice(reportData.sales.avgOrderValue)}
              </div>
              <div className="admin-stat-title">Avg. Order Value</div>
            </div>
            <div className="admin-stat-change negative">
              <TrendingDown size={14} />
              <span>-3%</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="admin-dashboard-grid">
          {/* Top Selling Products */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Top Selling Products</h3>
            </div>
            <div className="admin-card-body">
              <div className="admin-top-products">
                {reportData.products.topSelling.map((product, index) => (
                  <div key={index} className="admin-product-item">
                    <div className="admin-product-rank">{index + 1}</div>
                    <div className="admin-product-info">
                      <h4>{product.name}</h4>
                      <span className="admin-product-sales">
                        {product.sales} sales
                      </span>
                    </div>
                    <div className="admin-product-revenue">
                      {formatPrice(product.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Orders by Status</h3>
            </div>
            <div className="admin-card-body">
              <div className="admin-status-chart">
                {Object.entries(reportData.ordersByStatus).map(
                  ([status, count]) => {
                    const percentage = (count / totalOrders) * 100;
                    return (
                      <div key={status} className="admin-status-bar-item">
                        <div className="admin-status-bar-header">
                          <span className="admin-status-label">{status}</span>
                          <span className="admin-status-count">{count}</span>
                        </div>
                        <div className="admin-status-bar-bg">
                          <div
                            className={`admin-status-bar-fill status-${status}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="admin-card admin-alert-card">
          <div className="admin-card-header">
            <h3>
              <Package size={18} />
              Low Stock Alert
            </h3>
          </div>
          <div className="admin-card-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reportData.products.lowStock.map((product) => (
                  <tr key={product.name}>
                    <td>{product.name}</td>
                    <td className="admin-stock-low">{product.stock}</td>
                    <td>
                      <span className="admin-status-badge admin-status-pending">
                        Low Stock
                      </span>
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-sm admin-btn-primary">
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Customer Insights</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-insights-grid">
              <div className="admin-insight-item">
                <div className="admin-insight-label">Total Customers</div>
                <div className="admin-insight-value">
                  {reportData.customers.total}
                </div>
              </div>
              <div className="admin-insight-item">
                <div className="admin-insight-label">New Customers</div>
                <div className="admin-insight-value">
                  {reportData.customers.new}
                </div>
                <div className="admin-insight-sub">
                  {Math.round(
                    (reportData.customers.new / reportData.customers.total) * 100
                  )}
                  % of total
                </div>
              </div>
              <div className="admin-insight-item">
                <div className="admin-insight-label">Returning Customers</div>
                <div className="admin-insight-value">
                  {reportData.customers.returning}
                </div>
                <div className="admin-insight-sub">
                  {Math.round(
                    (reportData.customers.returning / reportData.customers.total) *
                      100
                  )}
                  % of total
                </div>
              </div>
              <div className="admin-insight-item">
                <div className="admin-insight-label">Customer Retention</div>
                <div className="admin-insight-value">67%</div>
                <div className="admin-insight-sub positive">+5% from last month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

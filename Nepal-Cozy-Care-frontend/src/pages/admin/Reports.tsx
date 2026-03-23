import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type DateRange = "today" | "last7days" | "last30days" | "last90days" | "thisYear";

interface SalesData {
  total: number;
  change: number;
  orders: number;
  avg_order_value: number;
}

interface ProductSales {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
}

interface CustomerData {
  new: number;
  returning: number;
  total: number;
  retention: number;
}

interface ReportsData {
  sales: SalesData;
  products: {
    top_selling: ProductSales[];
    low_stock: LowStockProduct[];
  };
  customers: CustomerData;
  orders_by_status: Record<string, number>;
}

const ORDER_STATUS_SEQUENCE = [
  "pending",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const formatStatusLabel = (status: string) =>
  status
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Reports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("last30days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportsData | null>(null);

  useEffect(() => {
    void fetchReports(dateRange);
  }, [dateRange]);

  const fetchReports = async (range: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin login required to view reports.");
      }

      const res = await fetch(`${API}/api/admin/reports?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.message || "Failed to load reports.");
      }

      setReportData(payload.data);
    } catch (fetchError) {
      console.error("Error fetching reports:", fetchError);
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const totalOrders = ORDER_STATUS_SEQUENCE.reduce(
    (sum, status) => sum + (reportData?.orders_by_status?.[status] ?? 0),
    0
  );

  const handleExport = () => {
    if (!reportData) return;

    const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = window.URL.createObjectURL(reportBlob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `cozy-care-report-${dateRange}.json`;
    anchor.click();
    window.URL.revokeObjectURL(downloadUrl);
  };

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
              onChange={(event) => setDateRange(event.target.value as DateRange)}
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisYear">This Year</option>
            </select>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleExport}
              disabled={!reportData}
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div
              className="admin-card-body"
              style={{ padding: "1rem 1.25rem", color: "#dc2626" }}
            >
              {error}
            </div>
          </div>
        )}

        {loading && !reportData ? (
          <div className="admin-table-container">
            <div className="admin-loading">Loading report data...</div>
          </div>
        ) : reportData ? (
          <>
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
                  <span>
                    {reportData.sales.change >= 0 ? "+" : ""}
                    {reportData.sales.change}%
                  </span>
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
                <div className="admin-stat-change">
                  <span>Selected range</span>
                </div>
              </div>

              <div className="admin-stat-card purple">
                <div className="admin-stat-icon">
                  <Users size={24} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{reportData.customers.new}</div>
                  <div className="admin-stat-title">New Customers</div>
                </div>
                <div className="admin-stat-change">
                  <span>{reportData.customers.total} total customers</span>
                </div>
              </div>

              <div className="admin-stat-card orange">
                <div className="admin-stat-icon">
                  <Package size={24} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">
                    {formatPrice(reportData.sales.avg_order_value)}
                  </div>
                  <div className="admin-stat-title">Avg. Order Value</div>
                </div>
                <div className="admin-stat-change">
                  <span>{reportData.customers.retention}% retention</span>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-grid">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Top Selling Products</h3>
                </div>
                <div className="admin-card-body">
                  <div className="admin-top-products">
                    {reportData.products.top_selling.length > 0 ? (
                      reportData.products.top_selling.map((product, index) => (
                        <div key={product.id} className="admin-product-item">
                          <div className="admin-product-rank">{index + 1}</div>
                          <div className="admin-product-info">
                            <h4>{product.name}</h4>
                            <span className="admin-product-sales">
                              {product.sales} sales
                            </span>
                          </div>
                          <div className="admin-product-revenue">
                            {formatPrice(Number(product.revenue))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="admin-empty-state">
                        <p>No sales recorded in this range.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Orders by Status</h3>
                </div>
                <div className="admin-card-body">
                  <div className="admin-status-chart">
                    {ORDER_STATUS_SEQUENCE.map((status) => {
                      const count = reportData.orders_by_status?.[status] ?? 0;
                      const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;

                      return (
                        <div key={status} className="admin-status-bar-item">
                          <div className="admin-status-bar-header">
                            <span className="admin-status-label">
                              {formatStatusLabel(status)}
                            </span>
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
                    })}
                  </div>
                </div>
              </div>
            </div>

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
                    {reportData.products.low_stock.length > 0 ? (
                      reportData.products.low_stock.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td className="admin-stock-low">{product.stock}</td>
                          <td>
                            <span className="admin-status-badge admin-status-pending">
                              Low Stock
                            </span>
                          </td>
                          <td>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-primary"
                              onClick={() => navigate("/admin/plants")}
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="admin-empty-state">
                          No low-stock items right now.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
                      {reportData.customers.total > 0
                        ? Math.round(
                            (reportData.customers.new / reportData.customers.total) * 100
                          )
                        : 0}
                      % of total
                    </div>
                  </div>
                  <div className="admin-insight-item">
                    <div className="admin-insight-label">Returning Customers</div>
                    <div className="admin-insight-value">
                      {reportData.customers.returning}
                    </div>
                    <div className="admin-insight-sub">
                      {reportData.customers.total > 0
                        ? Math.round(
                            (reportData.customers.returning / reportData.customers.total) *
                              100
                          )
                        : 0}
                      % of total
                    </div>
                  </div>
                  <div className="admin-insight-item">
                    <div className="admin-insight-label">Customer Retention</div>
                    <div className="admin-insight-value">
                      {reportData.customers.retention}%
                    </div>
                    <div className="admin-insight-sub positive">
                      Customers with repeat orders
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

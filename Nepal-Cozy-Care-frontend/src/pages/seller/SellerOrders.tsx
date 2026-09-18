import { useEffect, useState } from "react";
import { ShoppingBag, Search, MapPin, Phone, User, Calendar } from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import "../../components/seller/seller.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function SellerOrders() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/seller/orders?per_page=50`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOrderItems(json.data.order_items || []);
      }
    } catch (err) {
      console.error("Failed to load seller order items", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = orderItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.product_name?.toLowerCase().includes(q) ||
      item.order_id?.toString().includes(q) ||
      item.shipping_name?.toLowerCase().includes(q) ||
      item.shipping_city?.toLowerCase().includes(q)
    );
  });

  const pendingCount = orderItems.filter((i) => i.order_status === "pending" || i.order_status === "packed").length;
  const shippedCount = orderItems.filter((i) => i.order_status === "shipped").length;
  const deliveredCount = orderItems.filter((i) => i.order_status === "delivered").length;

  return (
    <SellerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header */}
        <div className="seller-form-card">
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Customer Orders & Fulfillment
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0.2rem 0 0" }}>
            Track ordered plants belonging to your nursery, view shipping destinations, and manage customer fulfillment.
          </p>
        </div>

        {/* 4 KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Shipments</span>
            <div className="seller-stat-value">{orderItems.length}</div>
            <div className="seller-stat-caption">All customer purchases</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Awaiting Packing</span>
            <div className="seller-stat-value" style={{ color: "#ca8a04" }}>{pendingCount}</div>
            <div className="seller-stat-caption" style={{ color: "#ca8a04" }}>Action required</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">In Transit</span>
            <div className="seller-stat-value" style={{ color: "#0284c7" }}>{shippedCount}</div>
            <div className="seller-stat-caption" style={{ color: "#0284c7" }}>Out for delivery</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Delivered</span>
            <div className="seller-stat-value" style={{ color: "#059669" }}>{deliveredCount}</div>
            <div className="seller-stat-caption" style={{ color: "#059669" }}>Completed safely</div>
          </div>
        </div>

        {/* Toolbar with Tabs */}
        <div className="seller-toolbar">
          <div className="seller-tab-group">
            {[
              { key: "all", label: "All Shipments" },
              { key: "pending", label: "Pending" },
              { key: "packed", label: "Packed" },
              { key: "shipped", label: "Shipped" },
              { key: "delivered", label: "Delivered" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`seller-tab-btn ${statusFilter === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="seller-search" style={{ width: "260px" }}>
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by ID, product, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Order Items List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div className="seller-card" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              Loading customer order items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="seller-card">
              <div className="seller-empty-state">
                <div className="seller-empty-icon">
                  <ShoppingBag size={26} />
                </div>
                <h4>No order items found</h4>
                <p>There are no customer orders matching your search or filter selection.</p>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="seller-card"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                }}
              >
                {/* Product & Order Meta */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "260px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: "#f1f5f9",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {item.product_image ? (
                      <img
                        src={
                          item.product_image.startsWith("http")
                            ? item.product_image
                            : `${API}/storage/${item.product_image}`
                        }
                        alt={item.product_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontWeight: 700,
                        }}
                      >
                        {item.product_name?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, color: "#047857", fontSize: "0.85rem" }}>
                        Order #{item.order_id}
                      </span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={12} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", margin: "0.15rem 0" }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Qty: <strong style={{ color: "#0f172a" }}>{item.quantity}</strong> × Rs. {Number(item.price).toLocaleString()} ={" "}
                      <strong style={{ color: "#047857" }}>Rs. {Number(item.line_total).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Customer Shipping Address Box */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.78rem",
                    color: "#334155",
                    maxWidth: "360px",
                    flex: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    <User size={13} style={{ color: "#047857" }} />
                    <span>{item.shipping_name || "Customer"}</span>
                    {item.shipping_phone && (
                      <span style={{ fontWeight: 500, color: "#64748b", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <Phone size={11} />
                        {item.shipping_phone}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", color: "#64748b" }}>
                    <MapPin size={13} style={{ color: "#047857", flexShrink: 0, marginTop: "2px" }} />
                    <span>{item.shipping_address ? `${item.shipping_address}, ` : ""}{item.shipping_city || "Kathmandu Valley"}</span>
                  </div>
                </div>

                {/* Status & Fulfillment */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                  <span className={`seller-badge seller-badge-${item.order_status || "pending"}`}>
                    {item.order_status}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "capitalize" }}>
                    Payment: <strong style={{ color: item.payment_status === "paid" ? "#059669" : "#334155" }}>{item.payment_status}</strong>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SellerLayout>
  );
}

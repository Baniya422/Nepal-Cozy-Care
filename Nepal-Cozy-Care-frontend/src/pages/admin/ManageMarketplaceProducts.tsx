import { useEffect, useState } from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  Search,
  Store,
  ShieldCheck,
  AlertCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
import type { Plant } from "../../types/plant";
import type { Shop } from "../../types/shop";
import {
  DEFAULT_PLANT_IMAGE,
  handleImageError,
  resolveImageUrl,
} from "../../utils/imageUrl";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ManageMarketplaceProducts() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [rejectingPlant, setRejectingPlant] = useState<Plant | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, shopFilter]);

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setShops(json.data.shops || []);
      }
    } catch (err) {
      console.error("Failed to load shops filter", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/admin/marketplace/products?per_page=100`;
      if (statusFilter !== "all") {
        url += `&approval_status=${statusFilter}`;
      }
      if (shopFilter !== "all") {
        url += `&shop_id=${shopFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPlants(json.data.plants || []);
      }
    } catch (err) {
      console.error("Failed to load marketplace products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (plant: Plant) => {
    setProcessingId(plant.id);
    setFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/marketplace/products/${plant.id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: json.message });
        fetchProducts();
      } else {
        setFeedback({ type: "error", text: json.message || "Approval failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPlant || !rejectReason.trim()) return;

    setProcessingId(rejectingPlant.id);
    setFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/marketplace/products/${rejectingPlant.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: json.message });
        setRejectingPlant(null);
        setRejectReason("");
        fetchProducts();
      } else {
        setFeedback({ type: "error", text: json.message || "Rejection failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPlants = plants.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.shop?.name.toLowerCase().includes(q)
    );
  });

  const pendingCount = plants.filter((p) => p.approval_status === "pending").length;
  const approvedCount = plants.filter((p) => p.approval_status === "approved" || !p.approval_status).length;
  const rejectedCount = plants.filter((p) => p.approval_status === "rejected").length;

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <div className="admin-header-badge">
              <Package size={14} />
              <span>Super Admin Marketplace Oversight</span>
            </div>
            <h2>All Marketplace Products</h2>
            <p>
              Identify owning nurseries, review newly submitted plant stock, and manage platform-wide catalog approvals.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`admin-feedback-alert ${feedback.type}`}>
            {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Catalog Items</div>
            <div className="admin-stat-value">{plants.length}</div>
            <div className="admin-stat-change">Across all partner sellers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Pending Approval</div>
            <div className="admin-stat-value" style={{ color: "#ca8a04" }}>{pendingCount}</div>
            <div className="admin-stat-change" style={{ color: "#ca8a04" }}>
              <Clock size={13} /> Needs admin verification
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Approved & Public</div>
            <div className="admin-stat-value" style={{ color: "#059669" }}>{approvedCount}</div>
            <div className="admin-stat-change" style={{ color: "#059669" }}>
              <CheckCircle2 size={13} /> Live in store
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Rejected / Edits Required</div>
            <div className="admin-stat-value" style={{ color: "#dc2626" }}>{rejectedCount}</div>
            <div className="admin-stat-change">Returned with guidance</div>
          </div>
        </div>

        {/* Toolbar with Filters */}
        <div className="admin-toolbar">
          <div className="admin-tab-group">
            {[
              { key: "all", label: "All Statuses" },
              { key: "pending", label: "Pending Review" },
              { key: "approved", label: "Approved" },
              { key: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`admin-tab-btn ${statusFilter === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="admin-select"
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", fontWeight: 600 }}
            >
              <option value="all">All Partner Nurseries</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="admin-search" style={{ maxWidth: "260px" }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products or nursery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading marketplace catalog...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="admin-empty-state">
              <ShoppingBag size={40} style={{ color: "#94a3b8", margin: "0 auto 0.75rem", display: "block" }} />
              <h4>No products match your filters</h4>
              <p>Try switching the status tab or selecting a different partner nursery.</p>
            </div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Owning Nursery</th>
                  <th>Price</th>
                  <th>Inventory</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant) => (
                  <tr key={plant.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            overflow: "hidden",
                            flexShrink: 0,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {plant.image ? (
                            <img
                              src={resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE)}
                              alt={plant.name}
                              onError={(event) => handleImageError(event, DEFAULT_PLANT_IMAGE)}
                              loading="lazy"
                              decoding="async"
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
                              {plant.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{plant.name}</div>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {plant.category || "Indoor Foliage"}
                          </span>
                          {plant.rejection_reason && (
                            <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "#dc2626" }}>
                              Reason: {plant.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <Store size={14} style={{ color: "#047857" }} />
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {plant.shop?.name || "Nepal Cozy Care"}
                        </span>
                        {plant.shop?.is_verified && (
                          <span title="Verified Nursery" style={{ display: "inline-flex" }}>
                            <ShieldCheck size={13} style={{ color: "#059669" }} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>Rs. {plant.price.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ color: (plant.stock ?? 0) < 5 ? "#dc2626" : "#334155", fontWeight: 600 }}>
                        {plant.stock ?? 0}
                      </span>{" "}
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>units</span>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${plant.approval_status || "approved"}`}>
                        {plant.approval_status === "approved" && <CheckCircle2 size={11} />}
                        {plant.approval_status === "pending" && <Clock size={11} />}
                        {plant.approval_status === "rejected" && <AlertCircle size={11} />}
                        <span>{plant.approval_status || "approved"}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                        {plant.approval_status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(plant)}
                            disabled={processingId === plant.id}
                            className="admin-btn admin-btn-sm admin-btn-primary"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                        )}
                        {plant.approval_status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingPlant(plant);
                              setRejectReason("");
                            }}
                            disabled={processingId === plant.id}
                            className="admin-btn admin-btn-sm"
                            style={{
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                            }}
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Reject Modal */}
        {rejectingPlant && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Reject Product: {rejectingPlant.name}</h3>
                <button
                  type="button"
                  onClick={() => setRejectingPlant(null)}
                  className="admin-modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="admin-form">
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>
                  Provide constructive feedback for the nursery (e.g. unclear photo, incorrect plant category, or excessive pricing).
                </p>

                <div className="admin-form-group">
                  <label htmlFor="prodRejectReason">Rejection Feedback *</label>
                  <textarea
                    id="prodRejectReason"
                    rows={4}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter clear reason..."
                  />
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={() => setRejectingPlant(null)}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectingPlant.id}
                    className="admin-btn admin-btn-danger"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

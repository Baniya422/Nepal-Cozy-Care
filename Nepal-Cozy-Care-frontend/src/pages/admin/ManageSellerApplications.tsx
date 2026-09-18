import { useEffect, useState } from "react";
import {
  Store,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ManageSellerApplications() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingShop, setRejectingShop] = useState<Shop | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchShops();
  }, [statusFilter]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/admin/shops?per_page=50`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setShops(json.data.shops || []);
      }
    } catch (err) {
      console.error("Failed to load seller applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shop: Shop) => {
    if (!window.confirm(`Approve seller application for "${shop.name}"? This will grant nursery seller permissions to ${shop.email}.`)) {
      return;
    }
    setProcessingId(shop.id);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      } else {
        setActionFeedback({ type: "error", text: json.message || "Approval failed" });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingShop || !rejectReason.trim()) return;

    setProcessingId(rejectingShop.id);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${rejectingShop.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        setRejectingShop(null);
        setRejectReason("");
        fetchShops();
      } else {
        setActionFeedback({ type: "error", text: json.message || "Rejection failed" });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredShops = shops.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.user?.name?.toLowerCase().includes(q)
    );
  });

  const pendingCount = shops.filter((s) => s.status === "pending").length;
  const approvedCount = shops.filter((s) => s.status === "approved").length;
  const rejectedCount = shops.filter((s) => s.status === "rejected").length;

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <div className="admin-header-badge">
              <Store size={14} />
              <span>Super Admin Marketplace Oversight</span>
            </div>
            <h2>Partner Seller Applications</h2>
            <p>
              Review, verify, and approve nursery farm businesses wanting to sell on Nepal Cozy Care.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className={`admin-feedback-alert ${actionFeedback.type}`}>
            {actionFeedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{actionFeedback.text}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Applications Shown</div>
            <div className="admin-stat-value">{filteredShops.length}</div>
            <div className="admin-stat-change">Total in current view</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Pending Review</div>
            <div className="admin-stat-value" style={{ color: "#ca8a04" }}>{pendingCount}</div>
            <div className="admin-stat-change" style={{ color: "#ca8a04" }}>
              <Clock size={13} /> Requires action
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Approved Partners</div>
            <div className="admin-stat-value" style={{ color: "#059669" }}>{approvedCount}</div>
            <div className="admin-stat-change" style={{ color: "#059669" }}>
              <ShieldCheck size={13} /> Live on platform
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Rejected / Changes Needed</div>
            <div className="admin-stat-value" style={{ color: "#dc2626" }}>{rejectedCount}</div>
            <div className="admin-stat-change">Awaiting applicant update</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-tab-group">
            {[
              { key: "pending", label: "Pending" },
              { key: "approved", label: "Approved" },
              { key: "rejected", label: "Rejected" },
              { key: "suspended", label: "Suspended" },
              { key: "all", label: "All Applications" },
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

          <div className="admin-search" style={{ maxWidth: "320px" }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search applicant, nursery, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="admin-applications-list">
          {loading ? (
            <div className="admin-card">
              <div className="admin-loading">Loading seller applications...</div>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="admin-card">
              <div className="admin-empty-state">
                <Store size={44} style={{ color: "#94a3b8", margin: "0 auto 0.75rem", display: "block" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.35rem" }}>
                  No applications found
                </h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>
                  There are currently no partner seller applications matching the "{statusFilter}" filter.
                </p>
              </div>
            </div>
          ) : (
            filteredShops.map((shop) => (
              <div key={shop.id} className="admin-application-card">
                <div className="admin-application-content">
                  {/* Head */}
                  <div className="admin-application-head">
                    <div className="admin-application-logo">
                      {shop.logo ? (
                        <img
                          src={shop.logo.startsWith("http") ? shop.logo : `${API}/storage/${shop.logo}`}
                          alt={shop.name}
                        />
                      ) : (
                        shop.name.charAt(0)
                      )}
                    </div>
                    <div className="admin-application-title-wrap">
                      <h3>
                        <span>{shop.name}</span>
                        <span className={`admin-badge admin-badge-${shop.status}`}>
                          {shop.status}
                        </span>
                      </h3>
                      <p>{shop.short_description || "Partner Nursery & Botanical Specialist"}</p>
                    </div>
                  </div>

                  {/* Description if present */}
                  {shop.description && (
                    <div className="admin-application-box">
                      <strong style={{ display: "block", color: "#0f172a", marginBottom: "0.25rem" }}>
                        Nursery Background & Qualifications:
                      </strong>
                      <span>{shop.description}</span>
                    </div>
                  )}

                  {/* Rejection feedback if present */}
                  {shop.rejection_reason && (
                    <div
                      className="admin-application-box"
                      style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}
                    >
                      <strong>Rejection Feedback Given: </strong>
                      <span>{shop.rejection_reason}</span>
                    </div>
                  )}

                  {/* Meta tags */}
                  <div className="admin-application-meta">
                    <span className="admin-application-meta-item">
                      <MapPin size={14} style={{ color: "#047857" }} />
                      <span>{shop.address ? `${shop.address}, ` : ""}{shop.city}</span>
                    </span>
                    <span className="admin-application-meta-item">
                      <Phone size={14} style={{ color: "#047857" }} />
                      <span>{shop.phone || "No phone provided"}</span>
                    </span>
                    <span className="admin-application-meta-item">
                      <Mail size={14} style={{ color: "#047857" }} />
                      <span>{shop.email}</span>
                    </span>
                    {shop.establishment_year && (
                      <span className="admin-application-meta-item">
                        <Calendar size={14} style={{ color: "#94a3b8" }} />
                        <span>Est. {shop.establishment_year}</span>
                      </span>
                    )}
                    {shop.user && (
                      <span className="admin-application-meta-item">
                        <UserCheck size={14} style={{ color: "#047857" }} />
                        <span>
                          Account: <strong>{shop.user.name}</strong> ({shop.user.email})
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="admin-application-actions">
                  {shop.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleApprove(shop)}
                      disabled={processingId === shop.id}
                      className="admin-btn admin-btn-primary"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Approve & Grant Access</span>
                    </button>
                  )}

                  {shop.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingShop(shop);
                        setRejectReason("");
                      }}
                      disabled={processingId === shop.id}
                      className="admin-btn admin-btn-secondary"
                      style={{ color: "#dc2626", borderColor: "#fecaca", whiteSpace: "nowrap" }}
                    >
                      <XCircle size={16} />
                      <span>Reject Application</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {rejectingShop && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Reject Application: {rejectingShop.name}</h3>
                <button
                  type="button"
                  onClick={() => setRejectingShop(null)}
                  className="admin-modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="admin-form">
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>
                  Provide constructive guidance so the applicant can submit valid nursery documents or correct their shop information.
                </p>

                <div className="admin-form-group">
                  <label htmlFor="rejectReason">Rejection Reason / Guidance *</label>
                  <textarea
                    id="rejectReason"
                    rows={4}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Please provide a registered nursery PAN or clearer photos of your live stock."
                  />
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={() => setRejectingShop(null)}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectingShop.id}
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

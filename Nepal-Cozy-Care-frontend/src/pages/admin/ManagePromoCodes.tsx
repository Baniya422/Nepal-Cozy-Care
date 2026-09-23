import { useEffect, useState } from "react";
import { Tag, Plus, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface PromoCode {
  id: number;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_subtotal: number;
  max_discount_amount?: number;
  starts_at?: string;
  expires_at?: string;
  usage_limit_total?: number;
  usage_limit_per_customer?: number;
  first_order_only: boolean;
  is_active: boolean;
  times_used?: number;
}

export default function ManagePromoCodes() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_subtotal: "0",
    max_discount_amount: "",
    starts_at: "",
    expires_at: "",
    usage_limit_total: "",
    usage_limit_per_customer: "1",
    first_order_only: false,
    is_active: true,
  });

  const token = localStorage.getItem("token") || "";

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/promo-codes`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.data?.promo_codes)
          ? data.data.promo_codes
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setPromos(list);
      }
    } catch (e) {
      console.error("Error fetching promo codes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPromos();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_subtotal: "0",
      max_discount_amount: "",
      starts_at: "",
      expires_at: "",
      usage_limit_total: "",
      usage_limit_per_customer: "1",
      first_order_only: false,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || "",
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      min_subtotal: String(promo.min_subtotal || 0),
      max_discount_amount: promo.max_discount_amount ? String(promo.max_discount_amount) : "",
      starts_at: promo.starts_at ? promo.starts_at.slice(0, 16) : "",
      expires_at: promo.expires_at ? promo.expires_at.slice(0, 16) : "",
      usage_limit_total: promo.usage_limit_total ? String(promo.usage_limit_total) : "",
      usage_limit_per_customer: String(promo.usage_limit_per_customer || 1),
      first_order_only: promo.first_order_only,
      is_active: promo.is_active,
    });
    setShowModal(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPromo
        ? `${API}/api/admin/promo-codes/${editingPromo.id}`
        : `${API}/api/admin/promo-codes`;
      const method = editingPromo ? "PUT" : "POST";

      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_subtotal: parseFloat(formData.min_subtotal || "0"),
        first_order_only: Boolean(formData.first_order_only),
        is_active: Boolean(formData.is_active),
      };

      if (formData.max_discount_amount) {
        payload.max_discount_amount = parseFloat(formData.max_discount_amount);
      } else {
        payload.max_discount_amount = null;
      }

      if (formData.starts_at) payload.starts_at = formData.starts_at;
      if (formData.expires_at) payload.expires_at = formData.expires_at;

      if (formData.usage_limit_total) {
        payload.usage_limit_total = parseInt(formData.usage_limit_total, 10);
      } else {
        payload.usage_limit_total = null;
      }

      if (formData.usage_limit_per_customer) {
        payload.usage_limit_per_customer = parseInt(formData.usage_limit_per_customer, 10);
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save promo code");
      }

      setStatusMessage({
        type: "success",
        text: `Promo code ${editingPromo ? "updated" : "created"} successfully!`,
      });
      setShowModal(false);
      void fetchPromos();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleToggleStatus = async (promo: PromoCode) => {
    try {
      const res = await fetch(`${API}/api/admin/promo-codes/${promo.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ is_active: !promo.is_active }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      void fetchPromos();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Promo Codes & Discounts</h1>
          <p className="admin-page-subtitle">
            Configure coupons, percentage & fixed discounts, usage caps, and first-order promotions.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateModal}>
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.85rem 1.25rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: statusMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: statusMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${statusMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {statusMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Subtotal</th>
                <th>Limits</th>
                <th>Validity</th>
                <th>Restrictions</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    Loading promo codes...
                  </td>
                </tr>
              ) : !Array.isArray(promos) || promos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    No promo codes found. Create your first campaign above!
                  </td>
                </tr>
              ) : (
                (Array.isArray(promos) ? promos : []).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Tag size={16} color="#059669" />
                        <strong style={{ letterSpacing: "1px" }}>{p.code}</strong>
                      </div>
                      {p.description && (
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{p.description}</div>
                      )}
                    </td>
                    <td>
                      <strong>
                        {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `NPR ${p.discount_value} OFF`}
                      </strong>
                      {p.max_discount_amount && (
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          Up to NPR {p.max_discount_amount}
                        </div>
                      )}
                    </td>
                    <td>{p.min_subtotal > 0 ? `NPR ${p.min_subtotal.toLocaleString()}` : "No min"}</td>
                    <td>
                      <div>Used: {p.times_used || 0} {p.usage_limit_total ? `/ ${p.usage_limit_total}` : "(Unlimited)"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Per customer: {p.usage_limit_per_customer || 1}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>
                      {p.starts_at ? new Date(p.starts_at).toLocaleDateString() : "Anytime"}
                      {" → "}
                      {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "No expiry"}
                    </td>
                    <td>
                      {p.first_order_only ? (
                        <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                          First Order Only
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>All orders</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          color: p.is_active ? "#059669" : "#9ca3af",
                          fontWeight: 600,
                        }}
                      >
                        {p.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        <span>{p.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                        onClick={() => openEditModal(p)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "550px" }}>
            <div className="admin-modal-header">
              <h3>{editingPromo ? `Edit ${editingPromo.code}` : "Create Promo Code"}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSavePromo}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="admin-label">Promo Code *</label>
                  <input
                    type="text"
                    required
                    style={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}
                    className="admin-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MONSOON20 or WELCOME500"
                  />
                </div>

                <div>
                  <label className="admin-label">Description / Campaign Purpose</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 10% discount on order above NPR 2,000"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="admin-label">Discount Type *</label>
                    <select
                      className="admin-select"
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value as "percentage" | "fixed",
                        })
                      }
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (NPR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">
                      Discount Value {formData.discount_type === "percentage" ? "(%)" : "(NPR)"} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      max={formData.discount_type === "percentage" ? "100" : undefined}
                      className="admin-input"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      placeholder={formData.discount_type === "percentage" ? "e.g. 15" : "e.g. 250"}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="admin-label">Minimum Subtotal (NPR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formData.min_subtotal}
                      onChange={(e) => setFormData({ ...formData, min_subtotal: e.target.value })}
                      placeholder="0 for no minimum"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Max Discount Cap (NPR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      disabled={formData.discount_type !== "percentage"}
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                      placeholder="Optional cap for %"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="admin-label">Total Uses Allowed</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.usage_limit_total}
                      onChange={(e) => setFormData({ ...formData, usage_limit_total: e.target.value })}
                      placeholder="Leave blank for unlimited"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Uses Per Customer *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="admin-input"
                      value={formData.usage_limit_per_customer}
                      onChange={(e) => setFormData({ ...formData, usage_limit_per_customer: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="admin-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Expiry Date & Time</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.first_order_only}
                      onChange={(e) => setFormData({ ...formData, first_order_only: e.target.checked })}
                    />
                    <span>First-order only restriction (customers who have never completed an order)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span>Active and available for checkout</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingPromo ? "Save Changes" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

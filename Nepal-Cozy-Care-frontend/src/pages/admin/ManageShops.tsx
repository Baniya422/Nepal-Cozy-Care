import { useEffect, useState } from "react";
import {
  Store,
  ShieldCheck,
  Search,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldAlert,
  Building2,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
import type { Shop } from "../../types/shop";
import { DEFAULT_PLANT_IMAGE, handleImageError, resolveImageUrl } from "../../utils/imageUrl";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  shop?: { id: number; name: string } | null;
}

export default function ManageShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create & Assign Shop Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newShopName, setNewShopName] = useState("");
  const [newShopCity, setNewShopCity] = useState("Kathmandu");
  const [newShopPhone, setNewShopPhone] = useState("");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopShortDesc, setNewShopShortDesc] = useState("");
  const [newShopVerified, setNewShopVerified] = useState(true);
  const [creatingShop, setCreatingShop] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const users = (json.data?.users || []) as AdminUser[];
        setUsersList(users);
        if (users.length > 0) {
          setSelectedUserId(String(users[0].id));
          setNewShopName(`${users[0].name} Nursery`);
        }
      }
    } catch (err) {
      console.error("Failed to load users for shop assignment", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelectChange = (userIdStr: string) => {
    setSelectedUserId(userIdStr);
    const chosenUser = usersList.find((u) => String(u.id) === userIdStr);
    if (chosenUser && (!newShopName || newShopName.includes("Nursery"))) {
      setNewShopName(`${chosenUser.name} Nursery`);
    }
  };

  const handleCreateShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newShopName.trim()) return;

    setCreatingShop(true);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(selectedUserId),
          name: newShopName.trim(),
          city: newShopCity.trim(),
          phone: newShopPhone.trim() || null,
          address: newShopAddress.trim() || null,
          short_description: newShopShortDesc.trim() || null,
          is_verified: newShopVerified,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to create vendor shop.");
      }

      setActionFeedback({ type: "success", text: json.message });
      setShowCreateModal(false);
      fetchShops();
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setCreatingShop(false);
    }
  };

  const fetchShops = async () => {
    setLoading(true);
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
      console.error("Failed to load marketplace shops", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (shop: Shop) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    }
  };

  const handleSuspend = async (shop: Shop) => {
    if (!window.confirm(`Are you sure you want to suspend "${shop.name}"? Products from this shop will no longer appear publicly.`)) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/suspend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      } else {
        setActionFeedback({ type: "error", text: json.message || "Suspension failed." });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    }
  };

  const handleReactivate = async (shop: Shop) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/reactivate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    }
  };

  const filteredShops = shops.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const verifiedCount = shops.filter((s) => s.is_verified).length;
  const activeCount = shops.filter((s) => s.status === "approved").length;
  const suspendedCount = shops.filter((s) => s.status === "suspended").length;

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <div className="admin-header-badge">
              <Building2 size={14} />
              <span>Super Admin Nursery Directory</span>
            </div>
            <h2>Manage Marketplace Shops</h2>
            <p>
              Verify partner nurseries, manage store status, assign vendor shops, and oversee plant sellers.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              onClick={openCreateModal}
              className="admin-btn admin-btn-primary"
            >
              <Plus size={16} />
              <span>Assign & Create Shop</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className={`admin-feedback-alert ${actionFeedback.type}`}>
            {actionFeedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{actionFeedback.text}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Nurseries</div>
            <div className="admin-stat-value">{shops.length}</div>
            <div className="admin-stat-change">Registered sellers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Verified Badges</div>
            <div className="admin-stat-value" style={{ color: "#059669" }}>{verifiedCount}</div>
            <div className="admin-stat-change" style={{ color: "#059669" }}>
              <ShieldCheck size={13} /> Trusted partners
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Active & Live</div>
            <div className="admin-stat-value" style={{ color: "#0284c7" }}>{activeCount}</div>
            <div className="admin-stat-change">Publicly listed</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Suspended Stores</div>
            <div className="admin-stat-value" style={{ color: "#7c3aed" }}>{suspendedCount}</div>
            <div className="admin-stat-change">
              <ShieldAlert size={13} /> Temporarily inactive
            </div>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search" style={{ maxWidth: "360px" }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search nursery by name, city, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500 }}>
            Showing {filteredShops.length} of {shops.length} nurseries
          </div>
        </div>

        {/* Shops Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading marketplace shops...</div>
          ) : filteredShops.length === 0 ? (
            <div className="admin-empty-state">
              <Store size={40} style={{ color: "#94a3b8", margin: "0 auto 0.75rem", display: "block" }} />
              <h4>No shops found</h4>
              <p>No marketplace nurseries match your search criteria.</p>
            </div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Shop / Nursery</th>
                  <th>Owner Account</th>
                  <th>Location</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Verified Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <div className="admin-shop-cell">
                        <div className="admin-shop-cell-avatar">
                          {shop.logo ? (
                            <img
                              src={resolveImageUrl(shop.logo, DEFAULT_PLANT_IMAGE)}
                              alt={shop.name}
                              onError={(event) => handleImageError(event, DEFAULT_PLANT_IMAGE)}
                            />
                          ) : (
                            shop.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span className="admin-shop-cell-name">{shop.name}</span>
                            {shop.slug === "nepal-cozy-care" && (
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  fontSize: "0.65rem",
                                  padding: "0.15rem 0.4rem",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                }}
                              >
                                Default Platform
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{shop.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {shop.user?.name || "System Admin"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {shop.user?.email || "cozycare@gmail.com"}
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#334155" }}>
                        <MapPin size={13} style={{ color: "#047857" }} />
                        <span>{shop.city || "Nepal"}</span>
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{shop.plants_count ?? 0}</strong>{" "}
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>plants</span>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${shop.status}`}>
                        {shop.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleVerify(shop)}
                        className={`admin-verify-btn ${shop.is_verified ? "verified" : "unverified"}`}
                        title="Click to toggle verified partner badge"
                      >
                        <ShieldCheck
                          size={13}
                          style={{ color: shop.is_verified ? "#059669" : "#94a3b8" }}
                        />
                        <span>{shop.is_verified ? "Verified" : "Unverified"}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <a
                          href={`/seller/dashboard?admin_shop_id=${shop.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn-sm"
                          style={{
                            background: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                          title="Open Vendor Dashboard for this shop"
                        >
                          <Store size={13} />
                          <span>Vendor View</span>
                        </a>

                        <a
                          href={`/shops/${shop.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-action-btn admin-action-view"
                          title="Visit Public Storefront"
                        >
                          <ExternalLink size={14} />
                        </a>

                        {shop.slug !== "nepal-cozy-care" && (
                          <>
                            {shop.status === "suspended" ? (
                              <button
                                type="button"
                                onClick={() => handleReactivate(shop)}
                                className="admin-btn admin-btn-sm admin-btn-primary"
                              >
                                Reactivate
                              </button>
                            ) : shop.status === "approved" ? (
                              <button
                                type="button"
                                onClick={() => handleSuspend(shop)}
                                className="admin-btn admin-btn-sm"
                                style={{
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                }}
                              >
                                Suspend
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create & Assign Vendor Shop Modal */}
        {showCreateModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal-large">
              <div className="admin-modal-header">
                <div>
                  <h3>Assign & Create Vendor Shop</h3>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0.2rem 0 0" }}>
                    Register a verified nursery shop directly to any user account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="admin-modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateShopSubmit} className="admin-form">
                <div className="admin-form-group">
                  <label htmlFor="shopOwner">Select Shop Owner (User) *</label>
                  {loadingUsers ? (
                    <div style={{ color: "#64748b", fontSize: "0.85rem", padding: "0.5rem 0" }}>
                      Loading registered users...
                    </div>
                  ) : (
                    <select
                      id="shopOwner"
                      value={selectedUserId}
                      onChange={(e) => handleUserSelectChange(e.target.value)}
                      required
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) {u.shop ? `[Already owns ${u.shop.name}]` : `[${u.role}]`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="newShopName">Shop / Nursery Name *</label>
                  <input
                    id="newShopName"
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Kathmandu Botanical Nursery"
                  />
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="newShopCity">City / Region *</label>
                    <input
                      id="newShopCity"
                      type="text"
                      required
                      value={newShopCity}
                      onChange={(e) => setNewShopCity(e.target.value)}
                      placeholder="e.g. Kathmandu"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="newShopPhone">Contact Phone</label>
                    <input
                      id="newShopPhone"
                      type="text"
                      value={newShopPhone}
                      onChange={(e) => setNewShopPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="newShopAddress">Physical Address</label>
                  <input
                    id="newShopAddress"
                    type="text"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    placeholder="e.g. Ward 4, Baluwatar"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="newShopShortDesc">Tagline / Short Summary</label>
                  <input
                    id="newShopShortDesc"
                    type="text"
                    value={newShopShortDesc}
                    onChange={(e) => setNewShopShortDesc(e.target.value)}
                    placeholder="e.g. Specialist in indoor foliage, organic potting soil, and exotic orchids"
                  />
                </div>

                <div className="admin-form-checkbox" style={{ margin: "0.75rem 0" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={newShopVerified}
                      onChange={(e) => setNewShopVerified(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>
                      Grant Verified Partner Badge immediately
                    </span>
                  </label>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingShop}
                    className="admin-btn admin-btn-primary"
                  >
                    {creatingShop ? "Creating..." : "Create & Activate Shop"}
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

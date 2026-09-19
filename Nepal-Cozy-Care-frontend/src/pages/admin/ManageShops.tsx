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
  Edit,
  Upload,
  Image as ImageIcon,
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

  // Edit Shop Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    establishment_year: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
    is_verified: false,
    status: "approved",
  });
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setEditFormData({
      name: shop.name || "",
      short_description: shop.short_description || "",
      description: shop.description || "",
      establishment_year: shop.establishment_year?.toString() || "",
      email: shop.email || "",
      phone: shop.phone || "",
      address: shop.address || "",
      city: shop.city || "Kathmandu",
      website: shop.website || "",
      is_verified: !!shop.is_verified,
      status: shop.status || "approved",
    });
    setEditLogoFile(null);
    setEditBannerFile(null);
    setEditLogoPreview(shop.logo ? resolveImageUrl(shop.logo, DEFAULT_PLANT_IMAGE) : null);
    setEditBannerPreview(shop.banner ? resolveImageUrl(shop.banner, DEFAULT_PLANT_IMAGE) : null);
    setShowEditModal(true);
  };

  const handleEditShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    setSavingEdit(true);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.entries(editFormData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          data.append(k, String(v));
        }
      });
      if (editLogoFile) data.append("logo", editLogoFile);
      if (editBannerFile) data.append("banner", editBannerFile);

      const res = await fetch(`${API}/api/admin/shops/${editingShop.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update shop details.");
      }

      setActionFeedback({ type: "success", text: json.message || "Shop updated successfully!" });
      setShowEditModal(false);
      fetchShops();
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setSavingEdit(false);
    }
  };

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
                        <button
                          type="button"
                          onClick={() => openEditModal(shop)}
                          className="admin-btn admin-btn-sm"
                          style={{
                            background: "#f0fdf4",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                            fontWeight: 600,
                          }}
                          title="Edit Nursery Details, Logo & Banner"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>

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

        {/* Edit Shop Modal */}
        {showEditModal && editingShop && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal-large" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
              <div className="admin-modal-header">
                <div>
                  <h3>Edit Nursery & Storefront Details</h3>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0.2rem 0 0" }}>
                    Update branding, banner, logo, and contact info for <strong>{editingShop.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="admin-modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditShopSubmit} className="admin-form">
                {/* Visual Imagery Section */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ImageIcon size={16} style={{ color: "#059669" }} />
                    Storefront Brand Imagery
                  </h4>

                  {/* Banner Upload */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                      Storefront Banner Image (Recommended: 1200x350)
                    </label>
                    <div style={{ height: "130px", background: "#f1f5f9", borderRadius: "8px", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1" }}>
                      {editBannerPreview ? (
                        <img
                          src={editBannerPreview}
                          alt="Banner Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
                        />
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No banner image uploaded</span>
                      )}
                      <label
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          background: "rgba(255,255,255,0.95)",
                          color: "#1e293b",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.35rem 0.75rem",
                          borderRadius: "6px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <Upload size={13} />
                        <span>{editBannerPreview ? "Change Banner" : "Upload Banner"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditBannerFile(file);
                              setEditBannerPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                      Shop Logo (Recommended: Square 400x400)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "10px", background: "#ffffff", border: "2px solid #e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {editLogoPreview ? (
                          <img
                            src={editLogoPreview}
                            alt="Logo Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
                          />
                        ) : (
                          <Store size={24} style={{ color: "#94a3b8" }} />
                        )}
                      </div>
                      <div>
                        <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: "pointer", display: "inline-flex" }}>
                          <Upload size={13} />
                          <span>{editLogoPreview ? "Change Logo" : "Upload Logo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditLogoFile(file);
                                setEditLogoPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                        <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0.3rem 0 0" }}>
                          Supports PNG, JPG, or WEBP up to 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="admin-form-group">
                  <label htmlFor="editName">Shop / Nursery Name *</label>
                  <input
                    id="editName"
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="editShortDesc">Tagline / Short Summary</label>
                  <input
                    id="editShortDesc"
                    type="text"
                    value={editFormData.short_description}
                    onChange={(e) => setEditFormData({ ...editFormData, short_description: e.target.value })}
                    placeholder="e.g. Specialized in rare house plants and organic potting supplies"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="editDescription">Full Nursery Story & About</label>
                  <textarea
                    id="editDescription"
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Detailed information about the nursery history, varieties, and fulfillment..."
                  />
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="editCity">City / Region *</label>
                    <input
                      id="editCity"
                      type="text"
                      required
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="editAddress">Physical Address</label>
                    <input
                      id="editAddress"
                      type="text"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="editEmail">Official Contact Email *</label>
                    <input
                      id="editEmail"
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="editPhone">Contact Phone</label>
                    <input
                      id="editPhone"
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="editWebsite">Website (Optional)</label>
                    <input
                      id="editWebsite"
                      type="text"
                      value={editFormData.website}
                      onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="editEstablishment">Establishment Year</label>
                    <input
                      id="editEstablishment"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={editFormData.establishment_year}
                      onChange={(e) => setEditFormData({ ...editFormData, establishment_year: e.target.value })}
                      placeholder="e.g. 2018"
                    />
                  </div>
                </div>

                <div className="admin-form-grid" style={{ marginTop: "0.5rem" }}>
                  <div className="admin-form-group">
                    <label htmlFor="editStatus">Shop Status</label>
                    <select
                      id="editStatus"
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="approved">Approved (Live)</option>
                      <option value="pending">Pending Review</option>
                      <option value="suspended">Suspended</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="admin-form-checkbox" style={{ display: "flex", alignItems: "center", marginTop: "1.75rem" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editFormData.is_verified}
                        onChange={(e) => setEditFormData({ ...editFormData, is_verified: e.target.checked })}
                      />
                      <span style={{ fontWeight: 600, color: "#065f46", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <ShieldCheck size={15} style={{ color: "#059669" }} />
                        Verified Partner Nursery Badge
                      </span>
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer" style={{ marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="admin-btn admin-btn-primary"
                  >
                    {savingEdit ? "Saving Changes..." : "Save Shop Changes"}
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

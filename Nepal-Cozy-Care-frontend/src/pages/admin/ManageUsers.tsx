import { useEffect, useState } from "react";
import { Search, Eye, EyeOff, Shield, Store, CheckCircle2, AlertCircle, UserPlus, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface UserShop {
  id: number;
  name: string;
  slug: string;
  city: string;
  status: string;
  is_verified: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin" | "seller" | "customer" | "user";
  join_date: string;
  orders_count: number;
  total_spent: number;
  status: "active" | "inactive";
  shop?: UserShop | null;
}

interface UserStats {
  total: number;
  active: number;
  avg_orders: number;
  new_this_month: number;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Create Admin Modal State
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState<"admin" | "super_admin">("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createAdminFeedback, setCreateAdminFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Assign Vendor & Role Modal State
  const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("customer");
  const [shopName, setShopName] = useState("");
  const [shopCity, setShopCity] = useState("Kathmandu");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [roleFeedback, setRoleFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    avg_orders: 0,
    new_this_month: 0,
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setCreateAdminFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/users/create-admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: adminRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create administrator");
      setCreateAdminFeedback({ type: "success", text: data.message || "Administrator created successfully!" });
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      void fetchUsers();
      setTimeout(() => {
        setShowCreateAdminModal(false);
        setCreateAdminFeedback(null);
      }, 1400);
    } catch (err: any) {
      setCreateAdminFeedback({ type: "error", text: err.message || "Failed to create administrator" });
    } finally {
      setCreatingAdmin(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const openRoleModal = (user: User) => {
    setEditingRoleUser(user);
    setSelectedRole(user.role === "user" ? "customer" : user.role);
    setShopName(user.shop?.name || `${user.name} Nursery`);
    setShopCity(user.shop?.city || "Kathmandu");
    setShopPhone("");
    setShopAddress("");
    setRoleFeedback(null);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleUser) return;
    setSavingRole(true);
    setRoleFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/users/${editingRoleUser.id}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          shop_name: shopName,
          city: shopCity,
          phone: shopPhone,
          address: shopAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user role");
      setRoleFeedback({ type: "success", text: data.message });
      void fetchUsers();
      setTimeout(() => {
        setEditingRoleUser(null);
      }, 1200);
    } catch (err: any) {
      setRoleFeedback({ type: "error", text: err.message });
    } finally {
      setSavingRole(false);
    }
  };
  const fetchUsers = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin login required to view users.");
      }
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Failed to load users.");
      }
      setUsers(payload.data?.users ?? []);
      setStats(
        payload.data?.stats ?? {
          total: 0,
          active: 0,
          avg_orders: 0,
          new_this_month: 0,
        }
      );
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const formatPrice = (price: number) => {
    const num = Number(price) || 0;
    return `Rs. ${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const formatId = (id: number) => `#${String(id).padStart(3, "0")}`;
  const activePercentage =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2>Users Management</h2>
            <p>View and manage registered users and administrators</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCreateAdminModal(true);
              setCreateAdminFeedback(null);
            }}
            className="admin-btn admin-btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#10b981",
              color: "#ffffff",
              border: "none",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
            }}
          >
            <UserPlus size={18} /> + Create Admin
          </button>
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
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Users</div>
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-change">{stats.new_this_month} joined this month</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Active Users</div>
            <div className="admin-stat-value">{stats.active}</div>
            <div className="admin-stat-change">{activePercentage}% of total</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Avg. Orders Per User</div>
            <div className="admin-stat-value">{stats.avg_orders}</div>
            <div className="admin-stat-change">Across all users</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Inactive Users</div>
            <div className="admin-stat-value">{Math.max(stats.total - stats.active, 0)}</div>
            <div className="admin-stat-change">No active session right now</div>
          </div>
        </div>
        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading users...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="admin-id">{formatId(user.id)}</td>
                    <td>
                      <div className="admin-user-info">
                        <span className="admin-user-name">{user.name}</span>
                        {user.role === "admin" || user.role === "super_admin" ? (
                          <span className="admin-role-badge" style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                            <Shield size={12} /> Admin
                          </span>
                        ) : user.role === "seller" ? (
                          <span className="admin-role-badge" style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                            <Store size={12} /> Vendor ({user.shop?.name || "Nursery"})
                          </span>
                        ) : (
                          <span className="admin-role-badge" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                            Customer
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="admin-email">{user.email}</td>
                    <td>{formatDate(user.join_date)}</td>
                    <td>{user.orders_count}</td>
                    <td className="admin-price">{formatPrice(user.total_spent)}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          user.status === "active"
                            ? "admin-status-active"
                            : "admin-status-inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn"
                          style={{ color: "#059669", background: "#ecfdf5" }}
                          title="Assign Vendor Role / Edit Shop"
                          onClick={() => openRoleModal(user)}
                        >
                          <Store size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-view"
                          title="View Details"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredUsers.length === 0 && (
            <div className="admin-empty-state">
              <p>No users found.</p>
            </div>
          )}
        </div>

        {/* Assign Vendor & Role Modal */}
        {editingRoleUser && (
          <div className="admin-modal-overlay" onClick={() => setEditingRoleUser(null)}>
            <div
              className="admin-modal"
              style={{ maxWidth: "520px", width: "100%" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <div>
                  <h3 style={{ margin: 0 }}>Assign Role / Vendor</h3>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Configure permissions and storefront for <strong>{editingRoleUser.name}</strong> ({editingRoleUser.email})
                  </p>
                </div>
                <button className="admin-modal-close" onClick={() => setEditingRoleUser(null)}>
                  &times;
                </button>
              </div>

              {roleFeedback && (
                <div
                  style={{
                    margin: "1rem 1.5rem 0",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.88rem",
                    background: roleFeedback.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: roleFeedback.type === "success" ? "#065f46" : "#991b1b",
                    border: `1px solid ${roleFeedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                  }}
                >
                  {roleFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{roleFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveRole} style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>
                    Account Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                      background: "#ffffff",
                    }}
                  >
                    <option value="customer">Customer (Standard Buyer)</option>
                    <option value="seller">Seller / Vendor Partner (Owns Nursery Shop)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {selectedRole === "seller" && (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem", color: "#065f46", fontWeight: 600, fontSize: "0.9rem" }}>
                      <Store size={18} />
                      <span>Vendor Nursery Details</span>
                    </div>

                    <div style={{ marginBottom: "0.85rem" }}>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#334155", marginBottom: "0.25rem" }}>
                        Shop / Nursery Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Kathmandu Valley Botanical Nursery"
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.88rem",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#334155", marginBottom: "0.25rem" }}>
                          City / Region *
                        </label>
                        <input
                          type="text"
                          required
                          value={shopCity}
                          onChange={(e) => setShopCity(e.target.value)}
                          placeholder="e.g. Kathmandu"
                          style={{
                            width: "100%",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#334155", marginBottom: "0.25rem" }}>
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          value={shopPhone}
                          onChange={(e) => setShopPhone(e.target.value)}
                          placeholder="98XXXXXXXX"
                          style={{
                            width: "100%",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#334155", marginBottom: "0.25rem" }}>
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="e.g. Ward 4, Baluwatar"
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.88rem",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingRoleUser(null)}
                    style={{
                      padding: "0.6rem 1.1rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "0.88rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRole}
                    style={{
                      padding: "0.6rem 1.3rem",
                      borderRadius: "6px",
                      border: "none",
                      background: "#059669",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      opacity: savingRole ? 0.7 : 1,
                    }}
                  >
                    {savingRole ? "Saving..." : "Save Role & Assign Vendor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && selectedUser && (
          <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>User Details - {selectedUser.name}</h3>
                <button className="admin-modal-close" onClick={() => setShowDetailModal(false)}>
                  &times;
                </button>
              </div>
              <div className="admin-order-detail">
                <div className="admin-order-info">
                  <div className="admin-info-section">
                    <h4>Profile</h4>
                    <p><strong>ID:</strong> {formatId(selectedUser.id)}</p>
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    {selectedUser.shop && (
                      <p><strong>Vendor Nursery:</strong> {selectedUser.shop.name} ({selectedUser.shop.city})</p>
                    )}
                  </div>
                  <div className="admin-info-section">
                    <h4>Account Activity</h4>
                    <p><strong>Status:</strong> {selectedUser.status}</p>
                    <p><strong>Joined:</strong> {formatDate(selectedUser.join_date)}</p>
                    <p><strong>Orders:</strong> {selectedUser.orders_count}</p>
                    <p><strong>Total Spent:</strong> {formatPrice(selectedUser.total_spent)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCreateAdminModal && (
          <div className="admin-modal-overlay" onClick={() => setShowCreateAdminModal(false)}>
            <div className="admin-modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Shield size={20} color="#10b981" /> Create New Administrator
                </h3>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setShowCreateAdminModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {createAdminFeedback && (
                <div
                  style={{
                    margin: "1rem 1.25rem 0",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.88rem",
                    background: createAdminFeedback.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: createAdminFeedback.type === "success" ? "#065f46" : "#991b1b",
                    border: `1px solid ${createAdminFeedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                  }}
                >
                  {createAdminFeedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{createAdminFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateAdmin} style={{ padding: "1.25rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#334155" }}>
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roshan Baniya"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#334155" }}>
                    Email Address <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@nepalcozycare.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#334155" }}>
                    Password <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b",
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#334155" }}>
                    Admin Privileges / Role
                  </label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value as "admin" | "super_admin")}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      background: "#ffffff",
                    }}
                  >
                    <option value="admin">Cozy Care Admin (Orders, Catalog, CMS, Messages)</option>
                    <option value="super_admin">Super Admin (Full System & User Management)</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateAdminModal(false)}
                    style={{
                      padding: "0.6rem 1.1rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "0.88rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAdmin}
                    style={{
                      padding: "0.6rem 1.4rem",
                      borderRadius: "6px",
                      border: "none",
                      background: "#10b981",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      cursor: creatingAdmin ? "not-allowed" : "pointer",
                      opacity: creatingAdmin ? 0.7 : 1,
                    }}
                  >
                    {creatingAdmin ? "Creating..." : "Create Administrator"}
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

import { useEffect, useState } from "react";
import { Search, Eye, Shield } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  join_date: string;
  orders_count: number;
  total_spent: number;
  status: "active" | "inactive";
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
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    avg_orders: 0,
    new_this_month: 0,
  });

  useEffect(() => {
    void fetchUsers();
  }, []);

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

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
        <div className="admin-page-header">
          <div>
            <h2>Users Management</h2>
            <p>View and manage registered users</p>
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
                        {user.role === "admin" && (
                          <span className="admin-role-badge">
                            <Shield size={12} /> Admin
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
      </div>
    </AdminLayout>
  );
}

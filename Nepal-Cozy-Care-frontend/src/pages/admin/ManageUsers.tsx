import { useEffect, useState } from "react";
import { Search, Eye, UserCheck, UserX, Shield } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

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

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgOrders: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Since we don't have a users API endpoint, we'll use mock data
      // In production, you would fetch from `/api/admin/users`
      const mockUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "customer",
          join_date: "2024-11-15",
          orders_count: 12,
          total_spent: 495.78,
          status: "active",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "customer",
          join_date: "2024-10-20",
          orders_count: 8,
          total_spent: 324.50,
          status: "active",
        },
        {
          id: 3,
          name: "Mike Johnson",
          email: "mike@example.com",
          role: "customer",
          join_date: "2024-12-05",
          orders_count: 5,
          total_spent: 189.35,
          status: "active",
        },
        {
          id: 4,
          name: "Sarah Williams",
          email: "sarah@example.com",
          role: "customer",
          join_date: "2024-09-10",
          orders_count: 15,
          total_spent: 678.90,
          status: "active",
        },
        {
          id: 5,
          name: "Tom Brown",
          email: "tom@example.com",
          role: "customer",
          join_date: "2024-08-30",
          orders_count: 3,
          total_spent: 88.97,
          status: "inactive",
        },
        {
          id: 6,
          name: "Lisa Anderson",
          email: "lisa@example.com",
          role: "customer",
          join_date: "2024-11-28",
          orders_count: 7,
          total_spent: 234.56,
          status: "active",
        },
        {
          id: 7,
          name: "David Wilson",
          email: "david@example.com",
          role: "admin",
          join_date: "2024-07-14",
          orders_count: 20,
          total_spent: 1245.00,
          status: "active",
        },
        {
          id: 8,
          name: "Emma Taylor",
          email: "emma@example.com",
          role: "customer",
          join_date: "2024-12-10",
          orders_count: 2,
          total_spent: 59.98,
          status: "active",
        },
      ];

      setUsers(mockUsers);
      setStats({
        total: mockUsers.length,
        active: mockUsers.filter((u) => u.status === "active").length,
        avgOrders: Math.round(
          mockUsers.reduce((acc, u) => acc + u.orders_count, 0) / mockUsers.length
        ),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus as User["status"] } : user
      )
    );
    setStats((prev) => ({
      ...prev,
      active: newStatus === "active" ? prev.active + 1 : prev.active - 1,
    }));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatId = (id: number) => {
    return `#${String(id).padStart(3, "0")}`;
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Users Management</h2>
            <p>View and manage registered users</p>
          </div>
        </div>

        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Users</div>
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-change positive">+22 this month</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Active Users</div>
            <div className="admin-stat-value">{stats.active}</div>
            <div className="admin-stat-change">
              {Math.round((stats.active / stats.total) * 100)}% of total
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Avg. Orders Per User</div>
            <div className="admin-stat-value">{stats.avgOrders}</div>
            <div className="admin-stat-change">Across all users</div>
          </div>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={`admin-action-btn ${
                            user.status === "active"
                              ? "admin-action-delete"
                              : "admin-action-edit"
                          }`}
                          title={user.status === "active" ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                          {user.status === "active" ? (
                            <UserX size={16} />
                          ) : (
                            <UserCheck size={16} />
                          )}
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
      </div>
    </AdminLayout>
  );
}

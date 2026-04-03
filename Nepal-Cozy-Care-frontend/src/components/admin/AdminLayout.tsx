import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Leaf,
  Package,
  BookOpen,
  Lightbulb,
  ShoppingCart,
  Users,
  BarChart3,
  Bell,
  User,
  LogOut,
  Flower2,
  Mail,
  CloudSun,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import "./admin.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/plants", icon: Leaf, label: "Manage Plants" },
  { path: "/admin/accessories", icon: Package, label: "Manage Accessories" },
  { path: "/admin/blogs", icon: BookOpen, label: "Manage Care Blogs" },
  { path: "/admin/care-tips", icon: Lightbulb, label: "Manage Care Tips" },
  { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { path: "/admin/garden-entries", icon: Flower2, label: "Garden Entries" },
  { path: "/admin/seasonal-reminders", icon: CloudSun, label: "Seasonal Reminders" },
  { path: "/admin/contact-messages", icon: Mail, label: "Contact Inbox" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/reports", icon: BarChart3, label: "Reports" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState(3);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <Leaf size={28} />
            <span>Cozy Care Admin</span>
          </Link>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${isActive(item.path) ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {isActive(item.path) && <ChevronRight size={16} className="admin-link-arrow" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-page-title">
              {menuItems.find((item) => isActive(item.path))?.label || "Dashboard"}
            </h1>
          </div>

          <div className="admin-header-right">
            <button className="admin-header-btn">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="admin-notification-badge">{notifications}</span>
              )}
            </button>

            <div className="admin-user-menu">
              <div className="admin-user-avatar">
                <User size={20} />
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">Admin User</span>
                <span className="admin-user-role">Administrator</span>
              </div>
              <button className="admin-logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

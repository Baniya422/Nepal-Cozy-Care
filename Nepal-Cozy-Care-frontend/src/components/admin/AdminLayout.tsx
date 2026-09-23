import { useState, useEffect } from "react";
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
  Globe,
  Settings,
  Store,
  Building2,
  PackageCheck,
  ExternalLink,
  Box,
  Tag,
} from "lucide-react";
import "./admin.css";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const getMenuGroups = (vendorMarketplaceEnabled: boolean) => [
  {
    group: "Overview",
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/admin/reports", icon: BarChart3, label: "Reports & Stats" },
    ],
  },
  ...(vendorMarketplaceEnabled
    ? [
        {
          group: "Marketplace & Vendors",
          items: [
            { path: "/admin/seller-applications", icon: Store, label: "Seller Applications" },
            { path: "/admin/shops", icon: Building2, label: "Manage Shops" },
            { path: "/admin/marketplace-products", icon: PackageCheck, label: "Marketplace Products" },
            { path: "/seller/dashboard", icon: ExternalLink, label: "Vendor Dashboard (Live)" },
          ],
        },
      ]
    : []),
  {
    group: "Store & Operations",
    items: [
      { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
      { path: "/admin/suppliers", icon: Building2, label: "Nursery Suppliers" },
      { path: "/admin/promo-codes", icon: Tag, label: "Promo Codes" },
      { path: "/admin/plants", icon: Leaf, label: "Manage Plants" },
      { path: "/admin/decorations", icon: Box, label: "3D Decorations" },
      { path: "/admin/accessories", icon: Package, label: "Accessories" },
    ],
  },

  {
    group: "Website & Content",
    items: [
      { path: "/admin/page-content", icon: Globe, label: "Website Pages (CMS)" },
      { path: "/admin/blogs", icon: BookOpen, label: "Care Blogs" },
      { path: "/admin/care-tips", icon: Lightbulb, label: "Care Tips" },
      { path: "/admin/seasonal-reminders", icon: CloudSun, label: "Seasonal Reminders" },
    ],
  },
  {
    group: "Customers & Support",
    items: [
      { path: "/admin/contact-messages", icon: Mail, label: "Contact Inbox" },
      { path: "/admin/users", icon: Users, label: "Users" },
      { path: "/admin/garden-entries", icon: Flower2, label: "Garden Entries" },
    ],
  },
  {
    group: "System",
    items: [
      { path: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { vendor_marketplace_enabled } = useFeatureFlags();
  const menuGroups = getMenuGroups(vendor_marketplace_enabled);
  const allMenuItems = menuGroups.flatMap((g) => g.items);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 1024;
    }
    return true;
  });
  const [notifications] = useState(3);
  let adminName = "Admin User";
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null") as { name?: string } | null;
    adminName = storedUser?.name || adminName;
  } catch {
    // Use the safe fallback when local storage contains invalid JSON.
  }
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

  // Close sidebar on mobile route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo" onClick={handleNavClick}>
            <Leaf size={26} />
            <span>Cozy Care Super Admin</span>
          </Link>
          <button
            type="button"
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Close sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          {menuGroups.map((group) => (
            <div key={group.group} className="admin-sidebar-group">
              <div className="admin-sidebar-group-title">{group.group}</div>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`admin-sidebar-link ${isActive(item.path) ? "active" : ""}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {isActive(item.path) && <ChevronRight size={15} className="admin-link-arrow" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className={`admin-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-page-title">
              {allMenuItems.find((item) => isActive(item.path))?.label || "Dashboard"}
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
                <span className="admin-user-name">{adminName}</span>
                <span className="admin-user-role">Super Admin</span>
              </div>
              <button className="admin-logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        {}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

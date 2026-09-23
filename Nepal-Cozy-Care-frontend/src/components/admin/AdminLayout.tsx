import { useState, useEffect, useLayoutEffect, useRef, Component, type ErrorInfo, type ReactNode } from "react";
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
  ChevronDown,
  Globe,
  Settings,
  Store,
  Building2,
  PackageCheck,
  ExternalLink,
  Box,
  Tag,
  House,
  Info,
  Sparkles,
  Send,
  Truck,
  HelpCircle,
  Compass,
  Stethoscope,
  AlertCircle,
  RefreshCw,
  Palette,
  CircleDot,
} from "lucide-react";
import "./admin.css";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";
import { useSiteBranding } from "../../context/BrandingContext";

class AdminErrorBoundary extends Component<
  { children: ReactNode; resetKey?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; resetKey?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Admin error caught by boundary:", error, errorInfo);
  }

  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2.5rem 2rem",
            maxWidth: "600px",
            margin: "3rem auto",
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #fee2e2",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem auto",
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: "1.25rem", color: "#991b1b", marginBottom: "0.5rem", fontWeight: 700 }}>
            Unable to display this view
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            {this.state.error?.message || "An unexpected error occurred while rendering this section."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SubMenuItem {
  path: string;
  label: string;
  icon: any;
}

interface MenuItem {
  path: string;
  icon: any;
  label: string;
  subItems?: SubMenuItem[];
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

// Toggle to show/hide Marketplace & Vendors section in Admin Navigation.
// Set to false for now as requested; code and routes remain preserved for future re-enablement.
const SHOW_MARKETPLACE_VENDORS = false;

const getMenuGroups = (vendorMarketplaceEnabled: boolean): MenuGroup[] => [
  {
    group: "Overview",
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/admin/reports", icon: BarChart3, label: "Reports & Stats" },
    ],
  },
  ...(SHOW_MARKETPLACE_VENDORS && vendorMarketplaceEnabled
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
      {
        path: "/admin/page-content",
        icon: Globe,
        label: "Website Pages (CMS)",
        subItems: [
          { path: "/admin/page-content", icon: Globe, label: "Visual Directory Hub" },
          { path: "/admin/pages/branding", icon: Palette, label: "Website Logo & Name" },
          { path: "/admin/pages/category-bubbles", icon: CircleDot, label: "Catalog Category Circles" },
          { path: "/admin/homepage", icon: House, label: "Homepage Builder" },
          { path: "/admin/pages/about", icon: Info, label: "About Us" },
          { path: "/admin/pages/mission", icon: Sparkles, label: "Our Mission" },
          { path: "/admin/pages/contact", icon: Send, label: "Contact & Support" },
          { path: "/admin/pages/shipping", icon: Truck, label: "Shipping & Delivery" },
          { path: "/admin/pages/help-center", icon: HelpCircle, label: "Help Center & FAQs" },
          { path: "/admin/pages/blogs-hub", icon: BookOpen, label: "Care Blogs Hub Header" },
          { path: "/admin/pages/navigation", icon: Compass, label: "Navbar & Menus" },
          { path: "/admin/pages/plant-finder", icon: Sparkles, label: "Plant Finder Quiz" },
          { path: "/admin/pages/plant-health", icon: Stethoscope, label: "Plant Health Doctor" },
        ],
      },
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
  const { branding } = useSiteBranding();
  const menuGroups = getMenuGroups(vendor_marketplace_enabled);
  const allMenuItems = menuGroups.flatMap((g) => [
    ...g.items,
    ...(g.items.flatMap((i) => i.subItems || [])),
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  const isCmsRouteActive =
    location.pathname.startsWith("/admin/page-content") ||
    location.pathname.startsWith("/admin/homepage") ||
    location.pathname.startsWith("/admin/pages/");

  const [cmsDropdownOpen, setCmsDropdownOpen] = useState(() => isCmsRouteActive);

  useEffect(() => {
    if (isCmsRouteActive) {
      setCmsDropdownOpen(true);
    }
  }, [isCmsRouteActive]);

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

  const sidebarRef = useRef<HTMLElement | null>(null);

  // Restore sidebar scroll position synchronously before browser paint
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem("cozy_admin_sidebar_scroll");
    if (saved && sidebarRef.current) {
      sidebarRef.current.scrollTop = Number(saved);
    }
  }, [location.pathname]);

  // Keep the active link visible in viewport if it is outside
  useEffect(() => {
    if (sidebarRef.current) {
      const activeEl = sidebarRef.current.querySelector<HTMLElement>(
        ".admin-sidebar-link.active, .admin-sidebar-sublink.active"
      );
      if (activeEl) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        if (activeRect.top < sidebarRect.top || activeRect.bottom > sidebarRect.bottom) {
          activeEl.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      }
    }
  }, [location.pathname]);

  const handleSidebarScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem("cozy_admin_sidebar_scroll", String(e.currentTarget.scrollTop));
  };

  // Close sidebar on mobile route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleNavClick = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem("cozy_admin_sidebar_scroll", String(sidebarRef.current.scrollTop));
    }
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
      <aside
        ref={sidebarRef}
        onScroll={handleSidebarScroll}
        className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}
      >
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo" onClick={handleNavClick}>
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt={branding.site_name}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Leaf size={26} />
            )}
            <span>{branding.admin_dashboard_title || `${branding.site_name} admin dashboard`}</span>
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
              {group.items.map((item) => {
                if (item.subItems && item.subItems.length > 0) {
                  return (
                    <div key={item.path} className="admin-sidebar-dropdown-group">
                      <button
                        type="button"
                        onClick={() => setCmsDropdownOpen((prev) => !prev)}
                        className={`admin-sidebar-link admin-sidebar-dropdown-toggle ${
                          isCmsRouteActive ? "active" : ""
                        }`}
                        aria-expanded={cmsDropdownOpen}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                        <ChevronDown
                          size={15}
                          className="admin-link-arrow"
                          style={{
                            transform: cmsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                      {cmsDropdownOpen && (
                        <div className="admin-sidebar-submenu">
                          {item.subItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            const SubIcon = sub.icon;
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={handleNavClick}
                                className={`admin-sidebar-sublink ${isSubActive ? "active" : ""}`}
                              >
                                {SubIcon && <SubIcon size={14} />}
                                <span>{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
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
                );
              })}
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
                <span className="admin-user-role">Admin</span>
              </div>
              <button className="admin-logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <AdminErrorBoundary resetKey={location.pathname}>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}

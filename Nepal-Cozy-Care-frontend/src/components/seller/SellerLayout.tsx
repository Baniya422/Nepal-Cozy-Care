import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Leaf,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import type { Shop } from "../../types/shop";
import "./seller.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);

  let userName = "Partner Seller";
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    userName = storedUser?.name || userName;
  } catch {
    // fallback
  }

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/seller/shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setShop(json.data.shop);
        }
      } catch (err) {
        console.error("Failed to load seller shop info", err);
      }
    };
    fetchShop();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/seller/shop", label: "Shop Profile", icon: Store },
    { path: "/seller/products", label: "My Catalog", icon: Leaf },
    { path: "/seller/orders", label: "Customer Orders", icon: ShoppingBag },
    { path: "/seller/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/seller/dashboard") {
      return location.pathname === "/seller" || location.pathname === "/seller/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="seller-layout">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`seller-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="seller-sidebar-header">
          <Link to="/seller/dashboard" className="seller-brand">
            <div className="seller-brand-icon">
              <Store size={20} />
            </div>
            <div>
              <div className="seller-brand-title">Seller Portal</div>
              <div className="seller-brand-sub">Nepal Cozy Care</div>
            </div>
          </Link>

          {shop && (
            <div className="seller-shop-pill">
              <div className="seller-shop-avatar">
                {shop.logo ? (
                  <img
                    src={shop.logo.startsWith("http") ? shop.logo : `${API}/storage/${shop.logo}`}
                    alt={shop.name}
                  />
                ) : (
                  shop.name.charAt(0)
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="seller-shop-name">{shop.name}</div>
                <div className="seller-shop-badge">
                  <ShieldCheck size={11} />
                  <span>{shop.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="seller-sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`seller-nav-link${active ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="seller-nav-link-arrow" />}
              </Link>
            );
          })}
        </nav>

        {shop?.slug && (
          <Link
            to={`/shops/${shop.slug}`}
            target="_blank"
            className="seller-sidebar-public-link"
          >
            <ExternalLink size={14} />
            <span>View Public Storefront</span>
          </Link>
        )}

        <div className="seller-sidebar-footer">
          <div className="seller-user-slot">
            <div className="seller-user-avatar">
              <UserIcon size={18} />
            </div>
            <div className="seller-user-info">
              <div className="seller-user-name">{userName}</div>
              <div className="seller-user-role">Partner Vendor</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="seller-logout-btn"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="seller-main">
        <header className="seller-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="seller-logout-btn"
              style={{ display: "none" }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="seller-topbar-title">
              <h1>Partner Merchant Dashboard</h1>
              <p>Manage your live catalog, incoming customer orders, and shop details</p>
            </div>
          </div>

          <div className="seller-topbar-actions">
            <Link to="/" className="seller-topbar-btn seller-topbar-btn-secondary">
              Main Store
            </Link>
            {shop?.slug && (
              <Link
                to={`/shops/${shop.slug}`}
                target="_blank"
                className="seller-topbar-btn seller-topbar-btn-primary"
              >
                <ExternalLink size={14} />
                <span>Live Shop</span>
              </Link>
            )}
          </div>
        </header>

        <div className="seller-page-content">{children}</div>
      </div>
    </div>
  );
}

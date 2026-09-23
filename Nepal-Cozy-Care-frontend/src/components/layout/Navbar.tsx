import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, Search, ShoppingCart, User, X, Store } from "lucide-react";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";
import "./navbar.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/plants", label: "Plants" },
  { to: "/shops", label: "Shops" },
  { to: "/pots", label: "Accessories" },
  { to: "/care-tips", label: "Care Tips" },
  { to: "/blogs", label: "Blogs" },
  { to: "/plant-finder", label: "Plant Finder" },
  { to: "/room-designer", label: "Room Designer" },
  { to: "/my-garden", label: "My Garden" },
  { to: "/mission", label: "Mission" },
  { to: "/about", label: "About" },
];

const readLocalAccessoryCartCount = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(stored)) return 0;
    return stored.reduce((total, item) => total + Number(item?.quantity ?? 0), 0);
  } catch {
    return 0;
  }
};

const readCurrentUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { vendor_marketplace_enabled } = useFeatureFlags();
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; role?: string } | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";
  const isSeller = currentUser?.role === "seller";
  const visibleNavItems = navItems.filter((item) => vendor_marketplace_enabled || item.to !== "/shops");

  const refreshCartCount = useCallback(async () => {
    if (!token) {
      setCartCount(readLocalAccessoryCartCount());
      return;
    }
    try {
      const response = await fetch(`${API}/api/cart`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        setCartCount(0);
        return;
      }
      if (!response.ok) {
        setCartCount(0);
        return;
      }
      const data = await response.json();
      const items = Array.isArray(data.data?.cart) ? data.data.cart : [];
      const totalItems = items.reduce(
        (total: number, item: { quantity?: number }) => total + Number(item.quantity ?? 0),
        0
      );
      setCartCount(totalItems);
    } catch {
      setCartCount(0);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshCartCount(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshCartCount]);

  useEffect(() => {
    const handleCartUpdate = () => {
      setCurrentUser(readCurrentUser());
      void refreshCartCount();
    };
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || ["cart", "token", "user"].includes(event.key)) {
        setCurrentUser(readCurrentUser());
        void refreshCartCount();
      }
    };
    window.addEventListener("cozycare:cart-updated", handleCartUpdate as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cozycare:cart-updated", handleCartUpdate as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshCartCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("cozycare:cart-updated"));
    navigate("/login");
  };
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link to="/" className="site-brand" aria-label="Cozy Care home">
          <span className="site-brand__mark">
            <Leaf size={18} />
          </span>
          <span className="site-brand__copy">
            <span className="site-brand__name">Cozy Care</span>
            <span className="site-brand__tag">Nepal Plant Studio</span>
          </span>
        </Link>

        {/* Mobile quick actions: Cart + Menu Toggle */}
        <div className="site-header__mobile-actions">
          <button
            type="button"
            className="site-icon-btn site-icon-btn--mobile-cart"
            onClick={() => {
              setMenuOpen(false);
              navigate("/cart");
            }}
            title="Open cart"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 ? (
              <span className="site-cart-count" aria-label={`${cartCount} items in cart`}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="site-menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls="site-navigation-panel"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div
          id="site-navigation-panel"
          className={`site-header__panel${menuOpen ? " is-open" : ""}`}
        >
          <nav className="site-nav" aria-label="Primary navigation">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `site-nav__link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="site-icon-btn site-icon-btn--search"
              onClick={() => {
                setMenuOpen(false);
                navigate("/plants");
              }}
              title="Search plants"
              aria-label="Search plants"
            >
              <Search size={17} />
            </button>
            <button
              type="button"
              className="site-icon-btn site-icon-btn--desktop-cart"
              onClick={() => {
                setMenuOpen(false);
                navigate("/cart");
              }}
              title="Open cart"
              aria-label="Open cart"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 ? (
                <span className="site-cart-count" aria-label={`${cartCount} items in cart`}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
            {token ? (
              <>
                {vendor_marketplace_enabled && !isSuperAdmin && !isSeller && (
                  <Link
                    to="/become-a-seller"
                    className="site-ghost-btn"
                    style={{ color: "#059669", fontWeight: 600 }}
                    onClick={() => setMenuOpen(false)}
                    title="Sell on Nepal Cozy Care"
                  >
                    <Store size={14} />
                    <span>Partner</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="site-ghost-btn site-account-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/account");
                  }}
                  title={`My Account (${currentUser?.name || "User"})`}
                >
                  <User size={15} />
                  <span>{currentUser?.name ? currentUser.name.split(" ")[0] : "Account"}</span>
                </button>
                <button
                  type="button"
                  className="site-primary-btn site-primary-btn--quiet site-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="site-primary-btn site-login-btn"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      {menuOpen && (
        <div
          className="site-header__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}

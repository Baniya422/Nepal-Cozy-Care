import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import "./navbar.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/plants", label: "Plants" },
  { to: "/pots", label: "Accessories" },
  { to: "/my-garden", label: "My Garden" },
  { to: "/care-tips", label: "Care Tips" },
  { to: "/blogs", label: "Blogs" },
  { to: "/plant-finder", label: "Plant Finder" },
  { to: "/mission", label: "Mission" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const readLocalAccessoryCartCount = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!Array.isArray(stored)) return 0;

      return stored.reduce((total, item) => total + Number(item?.quantity ?? 0), 0);
    } catch {
      return 0;
    }
  };

  const refreshCartCount = async () => {
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
  };

  useEffect(() => {
    void refreshCartCount();
    setMenuOpen(false);
  }, [location.pathname, token]);

  useEffect(() => {
    const handleCartUpdate = () => {
      void refreshCartCount();
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || ["cart", "token", "user"].includes(event.key)) {
        void refreshCartCount();
      }
    };

    window.addEventListener("cozycare:cart-updated", handleCartUpdate as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cozycare:cart-updated", handleCartUpdate as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

        <button
          type="button"
          className="site-menu-toggle"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="site-navigation-panel"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div
          id="site-navigation-panel"
          className={`site-header__panel${menuOpen ? " is-open" : ""}`}
        >
          <nav className="site-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
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
              className="site-icon-btn"
              onClick={() => {
                setMenuOpen(false);
                navigate("/plants");
              }}
              title="Search plants"
              aria-label="Search plants"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className="site-icon-btn"
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

            {token ? (
              <>
                <button
                  type="button"
                  className="site-ghost-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/account");
                  }}
                >
                  <User size={16} />
                  My Account
                </button>
                <button
                  type="button"
                  className="site-primary-btn site-primary-btn--quiet"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className="site-primary-btn"
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
    </header>
  );
}

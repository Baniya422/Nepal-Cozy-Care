import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, Search, ShoppingCart, User, X, ChevronRight, ChevronDown } from "lucide-react";
import { useSiteBranding } from "../../context/BrandingContext";
// import { useFeatureFlags } from "../../context/FeatureFlagsContext"; // preserved for later
import "./navbar.css";
import "./nav-dropdown.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type NavDropdownItem = {
  id: string;
  label: string;
  path: string;
  is_active: boolean;
};

export type NavigationMenuConfig = {
  plants_dropdown: NavDropdownItem[];
  location_dropdown: NavDropdownItem[];
  care_tips_dropdown: NavDropdownItem[];
  accessories_dropdown: NavDropdownItem[];
};

export const defaultNavMenuConfig: NavigationMenuConfig = {
  plants_dropdown: [
    { id: "indoor", label: "Indoor Plants", path: "/plants?type=indoor", is_active: true },
    { id: "xl_plants", label: "XL plants", path: "/plants?size=xl", is_active: true },
    { id: "bundles", label: "Bundles", path: "/plants?type=bundles", is_active: true },
    { id: "low_light", label: "Low Light Plants", path: "/plants?light=low-light", is_active: true },
    { id: "cacti_succulents", label: "Cacti and Succulents", path: "/plants?type=succulents", is_active: true },
    { id: "hanging", label: "Hanging Plants", path: "/plants?type=hanging", is_active: true },
    { id: "fruit", label: "Fruit Plants", path: "/plants?type=fruit", is_active: true },
  ],
  location_dropdown: [
    { id: "balcony", label: "Balcony", path: "/plants?location=balcony", is_active: true },
    { id: "workspace", label: "Workspace", path: "/plants?location=workspace", is_active: true },
    { id: "living_room", label: "Living Room", path: "/plants?location=living-room", is_active: true },
    { id: "bedroom", label: "Bedroom", path: "/plants?location=bedroom", is_active: true },
    { id: "kitchen", label: "Kitchen", path: "/plants?location=kitchen", is_active: true },
    { id: "bathroom", label: "Bathroom", path: "/plants?location=bathroom", is_active: true },
  ],
  care_tips_dropdown: [
    { id: "potting_soil", label: "Potting Mix & Fertilizers", path: "/pots?category=soil", is_active: true },
    { id: "tools", label: "Garden Tools", path: "/pots?category=tools", is_active: true },
    { id: "watering", label: "Watering Tools and Accessories", path: "/pots?category=watering", is_active: true },
    { id: "decor", label: "Garden Decor & Accessories", path: "/pots?category=pots", is_active: true },
    { id: "pest_control", label: "Pest Control", path: "/care-tips", is_active: true },
    { id: "doctor_green", label: "Video Consultation - Doctor Green", path: "/plant-health-checker", is_active: true },
  ],
  accessories_dropdown: [
    { id: "pots_planters", label: "Pots & Planters", path: "/pots?category=pots", is_active: true },
    { id: "soil_media", label: "Soil & Media", path: "/pots?category=soil", is_active: true },
    { id: "watering_tools", label: "Watering Tools", path: "/pots?category=watering", is_active: true },
    { id: "garden_tools", label: "Garden Tools", path: "/pots?category=tools", is_active: true },
    { id: "garden_decor", label: "Garden Decor", path: "/pots?category=decor", is_active: true },
    { id: "plant_care_acc", label: "Plant Care", path: "/pots?category=care", is_active: true },
  ],
};

const navItems = [
  { to: "/", label: "Home" },
  { to: "/plants", label: "Plants", hasDropdown: "plants" },
  // { to: "/shops", label: "Shops" }, // Hidden for now, preserved for later
  { to: "/pots", label: "Accessories", hasDropdown: "accessories" },
  { to: "/care-tips", label: "Care Tips", hasDropdown: "care_tips" },
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
  const { branding } = useSiteBranding();
  // const { vendor_marketplace_enabled } = useFeatureFlags(); // preserved for later
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

  // Dynamic dropdown menu configuration from Admin CMS
  const [menuConfig, setMenuConfig] = useState<NavigationMenuConfig>(() => {
    try {
      const cached = localStorage.getItem("cozycare_cache_nav_menu");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") return { ...defaultNavMenuConfig, ...parsed };
      }
    } catch {
      // ignore
    }
    return defaultNavMenuConfig;
  });

  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);
  const closeDropdown = () => setDesktopDropdown(null);

  const dropdownEvents = (name: string) => ({
    onMouseEnter: () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;

      setDesktopDropdown(name);
    },
    onMouseLeave: () => {
      setDesktopDropdown((current) => current === name ? null : current);
    },
    onFocus: () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;

      setDesktopDropdown(name);
    },
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) closeDropdown();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") closeDropdown();
    },
  });

  // Mobile accordion state
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileLocationExpanded, setMobileLocationExpanded] = useState(false);

  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";
  const visibleNavItems = navItems.filter((item) => item.to !== "/shops");

  // Fetch dynamic menu settings from backend
  useEffect(() => {
    if (import.meta.env.MODE === "test") {
      return;
    }
    const fetchNavMenu = async () => {
      try {
        const response = await fetch(`${API}/api/content-templates/navigation_menu`);
        if (response.ok) {
          const data = await response.json();
          const payload = data?.data?.payload;
          if (payload && typeof payload === "object") {
            const merged: NavigationMenuConfig = {
              plants_dropdown: Array.isArray(payload.plants_dropdown)
                ? payload.plants_dropdown
                : defaultNavMenuConfig.plants_dropdown,
              location_dropdown: Array.isArray(payload.location_dropdown)
                ? payload.location_dropdown
                : defaultNavMenuConfig.location_dropdown,
              care_tips_dropdown: Array.isArray(payload.care_tips_dropdown)
                ? payload.care_tips_dropdown
                : defaultNavMenuConfig.care_tips_dropdown,
              accessories_dropdown: Array.isArray(payload.accessories_dropdown)
                ? payload.accessories_dropdown
                : defaultNavMenuConfig.accessories_dropdown,
            };
            setMenuConfig(merged);
            localStorage.setItem("cozycare_cache_nav_menu", JSON.stringify(merged));
          }
        }
      } catch {
        // Fall back gracefully to cache / defaults
      }
    };

    void fetchNavMenu();
  }, []);

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

  const handleDropdownNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const activePlantsItems = menuConfig.plants_dropdown.filter((i) => i.is_active !== false);
  const activeLocationItems = menuConfig.location_dropdown.filter((i) => i.is_active !== false);
  const activeCareTipsItems = menuConfig.care_tips_dropdown.filter((i) => i.is_active !== false);
  const activeAccessoriesItems = menuConfig.accessories_dropdown.filter((i) => i.is_active !== false);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link to="/" className="site-brand" aria-label={`${branding.site_name} home`}>
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={branding.site_name}
              className="site-brand__img"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <span className="site-brand__mark">
              <Leaf size={18} />
            </span>
          )}
          <span className="site-brand__copy">
            <span className="site-brand__name">{branding.site_name}</span>
            {branding.site_tagline ? (
              <span className="site-brand__tag">{branding.site_tagline}</span>
            ) : null}
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
          <nav className="site-nav" aria-label="Primary navigation"
            onClickCapture={(event) => {
              if ((event.target as HTMLElement).closest("a")) {
                closeDropdown();
                setMobileExpanded(null);
                setMobileLocationExpanded(false);
              }
            }}>
            {visibleNavItems.map((item) => {
              // Plants dropdown with Shop by Location sub-menu (Images 1 & 2)
              if (item.hasDropdown === "plants") {
                const isExpanded = mobileExpanded === "plants";
                return (
                  <div key={item.to} {...dropdownEvents(item.hasDropdown)} className={`site-nav__item--dropdown ${desktopDropdown === item.hasDropdown ? "is-desktop-open" : ""}`}>
                    <div className="site-nav__link-row">
                      <NavLink
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `site-nav__link${isActive ? " is-active" : ""}`
                        }
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className="nav-mobile-toggle-btn lg:hidden"
                        onClick={() =>
                          setMobileExpanded((curr) => (curr === "plants" ? null : "plants"))
                        }
                        aria-label="Toggle Plants categories"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className={`nav-dropdown-menu ${isExpanded ? "is-mobile-open" : ""}`}>
                      {activePlantsItems.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.path}
                          className="nav-dropdown-item"
                          onClick={() => handleDropdownNavigate(sub.path)}
                        >
                          {sub.label}
                        </Link>
                      ))}

                      {/* Shop by Location with flyout sub-menu (Image 2) */}
                      {activeLocationItems.length > 0 && (
                        <div className="nav-dropdown-item nav-dropdown-item--has-sub">
                          <div
                            className="nav-dropdown-link"
                            onClick={() => setMobileLocationExpanded((curr) => !curr)}
                            role="button"
                            tabIndex={0}
                          >
                            <span>Shop by Location</span>
                            <ChevronRight size={14} className="nav-sub-arrow" />
                          </div>

                          <div
                            className={`nav-sub-menu ${
                              mobileLocationExpanded ? "is-mobile-open" : ""
                            }`}
                          >
                            {activeLocationItems.map((loc) => (
                              <Link
                                key={loc.id}
                                to={loc.path}
                                className="nav-sub-item"
                                onClick={() => handleDropdownNavigate(loc.path)}
                              >
                                {loc.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Care Tips dropdown (Image 3)
              if (item.hasDropdown === "care_tips") {
                const isExpanded = mobileExpanded === "care_tips";
                return (
                  <div key={item.to} {...dropdownEvents(item.hasDropdown)} className={`site-nav__item--dropdown ${desktopDropdown === item.hasDropdown ? "is-desktop-open" : ""}`}>
                    <div className="site-nav__link-row">
                      <NavLink
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `site-nav__link${isActive ? " is-active" : ""}`
                        }
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className="nav-mobile-toggle-btn lg:hidden"
                        onClick={() =>
                          setMobileExpanded((curr) => (curr === "care_tips" ? null : "care_tips"))
                        }
                        aria-label="Toggle Care Tips options"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className={`nav-dropdown-menu ${isExpanded ? "is-mobile-open" : ""}`}>
                      {activeCareTipsItems.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.path}
                          className="nav-dropdown-item"
                          onClick={() => handleDropdownNavigate(sub.path)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // Accessories dropdown (user request: "in asserories too")
              if (item.hasDropdown === "accessories") {
                const isExpanded = mobileExpanded === "accessories";
                return (
                  <div key={item.to} {...dropdownEvents(item.hasDropdown)} className={`site-nav__item--dropdown ${desktopDropdown === item.hasDropdown ? "is-desktop-open" : ""}`}>
                    <div className="site-nav__link-row">
                      <NavLink
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `site-nav__link${isActive ? " is-active" : ""}`
                        }
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className="nav-mobile-toggle-btn lg:hidden"
                        onClick={() =>
                          setMobileExpanded((curr) => (curr === "accessories" ? null : "accessories"))
                        }
                        aria-label="Toggle Accessories options"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className={`nav-dropdown-menu ${isExpanded ? "is-mobile-open" : ""}`}>
                      {activeAccessoriesItems.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.path}
                          className="nav-dropdown-item"
                          onClick={() => handleDropdownNavigate(sub.path)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // Standard Link
              return (
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
              );
            })}
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
                {/* "Become a Seller" Partner link - hidden for now, code preserved for later */}
                {/* {vendor_marketplace_enabled && !isSuperAdmin && !isSeller && (
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
                )} */}
                {/* Vendor Hub link - hidden for now, code preserved for later */}
                {/* {isSeller && (
                  <Link
                    to="/seller/dashboard"
                    className="site-ghost-btn"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Vendor Hub</span>
                  </Link>
                )} */}
                {isSuperAdmin ? (
                  <Link
                    to="/admin"
                    className="site-ghost-btn"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={15} />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <Link
                    to="/my-account"
                    className="site-ghost-btn"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={15} />
                    <span>{currentUser?.name?.split(" ")[0] || "Account"}</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="site-icon-btn site-icon-btn--logout"
                  onClick={handleLogout}
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="site-primary-btn"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}




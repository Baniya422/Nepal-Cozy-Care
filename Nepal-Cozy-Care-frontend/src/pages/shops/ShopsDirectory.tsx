import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Calendar,
  ShieldCheck,
  Search,
  ArrowRight,
  Package,
  Sparkles,
} from "lucide-react";
import type { Shop } from "../../types/shop";
import "../../styles/shops.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ShopsDirectory() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    fetchShops();
  }, [selectedCity]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/shops?per_page=30`;
      if (selectedCity !== "all") {
        url += `&city=${encodeURIComponent(selectedCity)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setShops(json.data.shops || []);
      }
    } catch (err) {
      console.error("Failed to load shops directory", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      shop.name.toLowerCase().includes(q) ||
      shop.city?.toLowerCase().includes(q) ||
      shop.short_description?.toLowerCase().includes(q)
    );
  });

  const cities = Array.from(new Set(shops.map((s) => s.city).filter(Boolean)));

  return (
    <div className="shops-directory-page">
      {/* Header Banner */}
      <section className="shops-hero">
        <div className="shops-hero-content">
          <div className="shops-hero-badge">
            <Store size={14} />
            Marketplace Directory
          </div>
          <h1 className="shops-hero-title">
            Partner Plant Nurseries & Farms
          </h1>
          <p className="shops-hero-subtext">
            Explore trusted independent plant growers, boutique nurseries, and botanical artisans across Nepal.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="shops-controls-container">
        <div className="shops-controls-card">
          <div className="shops-search-wrap">
            <Search className="shops-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by nursery name, specialty or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shops-search-input"
            />
          </div>

          <div className="shops-city-filter">
            <span className="shops-city-label">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="shops-city-select"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Shops Grid */}
      <main className="shops-main">
        {loading ? (
          <div className="shops-grid">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="shop-card"
                style={{ minHeight: "280px", opacity: 0.6, background: "#f1f5f9" }}
              />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div
            style={{
              padding: "4rem 1.5rem",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            <Store style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              No nurseries found
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: "24rem", margin: "0 auto" }}>
              We couldn’t find any approved nurseries matching your search criteria. Try a different city or query.
            </p>
          </div>
        ) : (
          <div className="shops-grid">
            {filteredShops.map((shop) => {
              const logoUrl = shop.logo
                ? shop.logo.startsWith("http")
                  ? shop.logo
                  : `${API}/storage/${shop.logo}`
                : null;
              const bannerUrl = shop.banner
                ? shop.banner.startsWith("http")
                  ? shop.banner
                  : `${API}/storage/${shop.banner}`
                : null;

              return (
                <div key={shop.id} className="shop-card">
                  {/* Banner header with logo */}
                  <div className="shop-card-banner">
                    {bannerUrl && (
                      <img
                        src={bannerUrl}
                        alt={`${shop.name} banner`}
                        className="shop-card-banner-img"
                      />
                    )}
                    <div className="shop-card-banner-scrim" />

                    {/* Logo avatar */}
                    <div className="shop-card-avatar">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={shop.name}
                          className="shop-card-avatar-img"
                        />
                      ) : (
                        <div className="shop-card-avatar-fallback">
                          {shop.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="shop-card-body">
                    <div className="shop-card-header">
                      <Link to={`/shops/${shop.slug}`} className="shop-card-name">
                        {shop.name}
                      </Link>
                      {shop.is_verified && (
                        <span
                          className="shop-verified-badge"
                          title="Verified Partner Nursery"
                        >
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="shop-card-desc">
                      {shop.short_description ||
                        "Specialized in native plants, succulents, and decorative greenery."}
                    </p>

                    {/* Meta tags */}
                    <div className="shop-card-meta">
                      {shop.city && (
                        <span className="shop-meta-item">
                          <MapPin size={13} style={{ color: "#059669" }} />
                          {shop.city}
                        </span>
                      )}
                      {shop.establishment_year && (
                        <span className="shop-meta-item">
                          <Calendar size={13} style={{ color: "#94a3b8" }} />
                          Est. {shop.establishment_year}
                        </span>
                      )}
                      <span className="shop-meta-count">
                        <Package size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {shop.plants_count ?? 0} Plants
                      </span>
                    </div>

                    {/* View Shop CTA */}
                    <div className="shop-card-action">
                      <Link
                        to={`/shops/${shop.slug}`}
                        className="shop-card-btn"
                      >
                        Visit Shop Storefront
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Become a partner banner */}
        <div className="shops-partner-banner">
          <div className="shops-partner-content">
            <span className="shops-partner-tag">
              <Sparkles size={12} />
              Nursery Owners & Plant Growers
            </span>
            <h3 className="shops-partner-title">Sell Your Plants on Nepal Cozy Care</h3>
            <p className="shops-partner-text">
              Create your free digital storefront, reach customers across Nepal, and manage your inventory with our partner tools.
            </p>
          </div>
          <Link
            to="/become-a-seller"
            className="shops-partner-cta"
          >
            Apply to Become a Partner
          </Link>
        </div>
      </main>

    </div>
  );
}

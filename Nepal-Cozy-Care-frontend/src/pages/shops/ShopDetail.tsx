import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  ShieldCheck,
  Package,
  Search,
  ArrowLeft,
  Heart,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import type { Shop } from "../../types/shop";
import type { Plant } from "../../types/plant";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";
import { useWishlist } from "../../hooks/useWishlist";
import "../../styles/shops.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ShopDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });

  useEffect(() => {
    if (!slug) return;

    const fetchShop = async () => {
      setLoadingShop(true);
      try {
        const res = await fetch(`${API}/api/shops/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setShop(json.data.shop);
        }
      } catch (err) {
        console.error("Failed to fetch shop profile", err);
      } finally {
        setLoadingShop(false);
      }
    };

    fetchShop();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchPlants = async () => {
      setLoadingPlants(true);
      try {
        let url = `${API}/api/shops/${slug}/plants?per_page=50&include_accessories=true`;
        if (categoryFilter !== "all") {
          url += `&category=${encodeURIComponent(categoryFilter)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setPlants(json.data.plants || []);
        }
      } catch (err) {
        console.error("Failed to fetch shop plants", err);
      } finally {
        setLoadingPlants(false);
      }
    };

    fetchPlants();
  }, [slug, categoryFilter]);

  const filteredPlants = plants.filter((plant) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      plant.name.toLowerCase().includes(q) ||
      plant.scientific_name?.toLowerCase().includes(q) ||
      plant.description?.toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(plants.map((p) => p.category).filter(Boolean)));

  if (loadingShop) {
    return (
      <div className="shop-detail-page">
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", color: "#94a3b8" }}>
          Loading nursery profile...
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="shop-detail-page">
        <Navbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem", textAlign: "center" }}>
          <Store style={{ width: "64px", height: "64px", color: "#cbd5e1", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>Nursery Not Found</h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}>
            The nursery you are looking for might be unavailable or currently undergoing verification.
          </p>
          <Link
            to="/shops"
            className="shop-card-btn"
            style={{ width: "auto", display: "inline-flex", marginTop: "1.5rem", padding: "0.625rem 1.5rem" }}
          >
            <ArrowLeft size={14} /> Back to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
    <div className="shop-detail-page">
      <Navbar />

      {/* Storefront Banner */}
      <section
        className="shop-storefront-hero"
        style={
          bannerUrl
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(2, 44, 34, 0.75), rgba(6, 78, 59, 0.9)), url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="shop-storefront-hero-inner">
          <Link to="/shops" className="shop-back-link">
            <ArrowLeft size={14} /> All Partner Shops
          </Link>
        </div>
      </section>

      {/* Shop Info Card Overlapping Banner */}
      <div className="shop-profile-card-wrap">
        <div className="shop-profile-card">
          <div className="shop-profile-top">
            {/* Logo */}
            <div className="shop-profile-avatar">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={shop.name}
                  className="shop-profile-avatar-img"
                />
              ) : (
                <div className="shop-profile-avatar-fallback">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="shop-profile-info">
              <div className="shop-profile-title-row">
                <h1 className="shop-profile-name">
                  {shop.name}
                </h1>
                {shop.is_verified && (
                  <span className="shop-chip verified-chip">
                    <ShieldCheck size={14} />
                    Verified Partner Nursery
                  </span>
                )}
              </div>

              <p className="shop-profile-tagline">
                {shop.short_description ||
                  "Specialized in healthy house plants, seasonal flowering varieties & gardening essentials."}
              </p>

              {/* Quick Meta Chips */}
              <div className="shop-chips-row">
                {shop.city && (
                  <span className="shop-chip">
                    <MapPin size={13} style={{ color: "#059669" }} />
                    {shop.address ? `${shop.address}, ` : ""}
                    {shop.city}
                  </span>
                )}
                {shop.establishment_year && (
                  <span className="shop-chip">
                    <Calendar size={13} style={{ color: "#64748b" }} />
                    Est. {shop.establishment_year}
                  </span>
                )}
                <span className="shop-chip" style={{ color: "#047857", background: "#ecfdf5" }}>
                  <Package size={13} />
                  {shop.plants_count ?? plants.length} Available Items
                </span>
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="shop-chip contact-chip">
                    <Phone size={13} />
                    {shop.phone}
                  </a>
                )}
                {shop.email && (
                  <a href={`mailto:${shop.email}`} className="shop-chip contact-chip">
                    <Mail size={13} />
                    {shop.email}
                  </a>
                )}
                {shop.website && (
                  <a
                    href={shop.website.startsWith("http") ? shop.website : `https://${shop.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shop-chip contact-chip"
                  >
                    <Globe size={13} />
                    {shop.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description Story */}
          {shop.description && (
            <div className="shop-story-section">
              <h3 className="shop-story-heading">
                About The Nursery
              </h3>
              <p className="shop-story-text">
                {shop.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Section */}
      <main className="shop-catalog-section">
        {/* Controls Bar */}
        <div className="shop-catalog-header">
          <div>
            <h2 className="shop-catalog-title">Products by {shop.name}</h2>
            <p className="shop-catalog-subtext">
              All items are prepared and dispatched directly from this nursery.
            </p>
          </div>

          <div className="shop-catalog-filters">
            {/* Search */}
            <div className="shop-catalog-search-wrap">
              <Search className="shops-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search shop items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shop-catalog-search-input"
              />
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="shop-catalog-select"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loadingPlants ? (
          <div className="shop-products-grid">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="shop-product-card"
                style={{ height: "300px", opacity: 0.6, background: "#f1f5f9" }}
              />
            ))}
          </div>
        ) : filteredPlants.length === 0 ? (
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
            <Package style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>No products currently available</h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem", maxWidth: "24rem", margin: "0.25rem auto 0" }}>
              This nursery hasn’t listed any products matching this filter yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="shop-products-grid">
            {filteredPlants.map((plant) => (
              <div key={plant.id} className="shop-product-card">
                {/* Fixed aspect ratio container so images NEVER stretch or blow up */}
                <div className="shop-product-image-container">
                  <img
                    src={resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE)}
                    alt={plant.name}
                    onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
                    className="shop-product-image"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(plant.id)}
                    disabled={wishlistBusyId === plant.id}
                    className={`shop-product-wishlist-btn ${
                      wishlistIds.includes(plant.id) ? "active" : ""
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={15}
                      fill={wishlistIds.includes(plant.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="shop-product-body">
                  <span className="shop-product-category">
                    {plant.category || "House Plant"}
                  </span>
                  <Link
                    to={`/plants/${plant.id}`}
                    className="shop-product-title"
                    title={plant.name}
                  >
                    {plant.name}
                  </Link>
                  {plant.scientific_name && (
                    <span className="shop-product-botanical">
                      {plant.scientific_name}
                    </span>
                  )}

                  <div className="shop-product-footer">
                    <span className="shop-product-price">
                      Rs. {Number(plant.price).toLocaleString()}
                    </span>
                    <Link
                      to={`/plants/${plant.id}`}
                      className="shop-product-view-btn"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

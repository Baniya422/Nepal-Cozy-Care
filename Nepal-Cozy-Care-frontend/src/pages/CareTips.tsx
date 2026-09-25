import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Shield,
  CloudRain,
  Sun,
  Sprout,
  Bug,
  Flower2,
  ArrowRight,
  CalendarHeart,
  Search,
  BookOpenText,
  SlidersHorizontal,
  X,
  ShoppingBag,
  Activity,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import SEO from "../components/common/SEO";
import TipsGrid from "../components/care-tips/TipsGrid";
import AIPlantHealthScanner from "../components/care-tips/AIPlantHealthScanner";
import CategoryBubbles from "../components/plants/CategoryBubbles";
import ProductCard from "../components/common/ProductCard";
import UgaooSortDropdown, { type UgaooSortOption } from "../components/plants/UgaooSortDropdown";
import AccessoriesFilterDrawer, {
  type AccessoriesFilterValues,
  defaultAccessoriesFilterValues,
} from "../components/pots/AccessoriesFilterDrawer";
import {
  type AccessoryItem,
  fallbackAccessories,
} from "../features/catalog/accessoriesData";
import { useWishlist } from "../hooks/useWishlist";
import { useAddToCart } from "../hooks/useAddToCart";
import type { CareTip, CareTipResponse } from "../types/careTip";
import "../styles/careTips.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function CareTips() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active view tab: "products" | "guides" | "scanner"
  const viewParam = searchParams.get("view");
  const [activeTab, setActiveTab] = useState<"products" | "guides" | "scanner">(
    viewParam === "guides" || viewParam === "scanner" ? viewParam : "products"
  );

  // Sync tab with URL
  const handleTabChange = (tab: "products" | "guides" | "scanner") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "products") next.delete("view");
      else next.set("view", tab);
      return next;
    });
  };

  // ================= CARE TIPS GUIDES STATE =================
  const appliedSearchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const guideSortBy = searchParams.get("sort_by") || "newest";
  const pageParam = Number(searchParams.get("page"));
  const currentGuidePage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [lastGuidePage, setLastGuidePage] = useState(1);
  const [totalGuides, setTotalGuides] = useState(0);
  const [searchQuery, setSearchQuery] = useState(appliedSearchQuery);
  const [guidesError, setGuidesError] = useState("");
  const [retryGuides, setRetryGuides] = useState(0);

  useEffect(() => setSearchQuery(appliedSearchQuery), [appliedSearchQuery]);

  const updateGuideFilter = (key: string, value: string) => {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      return params;
    });
  };

  const setCurrentGuidePage = (page: number) => updateGuideFilter("page", String(page));

  useEffect(() => {
    const controller = new AbortController();
    setLoadingGuides(true);
    setGuidesError("");
    const params = new URLSearchParams({
      search: appliedSearchQuery,
      category: selectedCategory,
      difficulty,
      sort_by: guideSortBy,
      page: String(currentGuidePage),
    });

    void (async () => {
      try {
        const response = await fetch(`${API}/api/care-tips?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Unable to load care tips (${response.status})`);
        }
        const data: CareTipResponse = await response.json();
        if (controller.signal.aborted) return;
        setCareTips(data.data.data || []);
        setLastGuidePage(data.data.last_page || 1);
        setTotalGuides(data.data.total || 0);
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          if (err instanceof Error && err.name === "AbortError") return;
          setGuidesError(err instanceof Error ? err.message : "Unable to load care tips. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingGuides(false);
      }
    })();
    return () => controller.abort();
  }, [appliedSearchQuery, selectedCategory, difficulty, guideSortBy, currentGuidePage, retryGuides]);

  const clearGuideFilters = () => {
    setSearchQuery("");
    setSearchParams(() => {
      const next = new URLSearchParams();
      if (activeTab !== "products") next.set("view", activeTab);
      return next;
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateGuideFilter("search", searchQuery.trim());
    if (activeTab !== "guides") handleTabChange("guides");
  };

  // ================= CARE PRODUCTS SHOP STATE (Ugaoo style) =================
  const [products, setProducts] = useState<AccessoryItem[]>(() => fallbackAccessories);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [productFilters, setProductFilters] = useState<AccessoriesFilterValues>({
    ...defaultAccessoriesFilterValues,
    categories: [],
  });
  const [productSortBy, setProductSortBy] = useState<UgaooSortOption>("featured");
  const PRODUCT_PAGE_SIZE = 16;
  const [currentProductPage, setCurrentProductPage] = useState(1);

  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  const { cartBusyId, addToCart } = useAddToCart(API);

  // Fetch real care products from database plants table
  useEffect(() => {
    fetch(`${API}/api/plants?per_page=100`)
      .then((res) => res.json())
      .then((data) => {
        const backendItems = data.data?.data ?? data.data ?? [];
        if (Array.isArray(backendItems) && backendItems.length > 0) {
          const mapped: AccessoryItem[] = backendItems.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            originalPrice: p.discount_percent ? Math.round((Number(p.price) || 0) * (1 + p.discount_percent / 100)) : undefined,
            category: p.category || "Plant Care",
            description: p.description || "",
            stock: p.stock ?? 10,
            views: p.views || 0,
            total_sold: p.total_sold || 0,
            badge: p.is_best_seller ? "Bestseller" : p.is_popular_item ? "Popular" : undefined,
            image: p.image || "/images/neem.webp",
          }));

          const merged = [...mapped];
          fallbackAccessories.forEach((fb) => {
            if (!merged.some((m) => m.name.toLowerCase() === fb.name.toLowerCase())) {
              merged.push(fb);
            }
          });
          setProducts(merged);
        }
      })
      .catch((err) => {
        console.warn("Using fallback accessories for care tips catalog:", err);
      });
  }, []);

  // Filter products matching active filters
  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      // Category filter
      if (productFilters.categories.length > 0) {
        const cat = (item.category || "").toLowerCase();
        const matchesCategory = productFilters.categories.some((f) => {
          if (f === "care") return cat.includes("care") || cat.includes("pest") || cat.includes("neem") || cat.includes("trap");
          if (f === "soil") return cat.includes("soil") || cat.includes("media") || cat.includes("compost") || cat.includes("perlite");
          if (f === "fertilizer") return cat.includes("fertiliz") || cat.includes("food") || cat.includes("seaweed") || cat.includes("stick");
          if (f === "seeds") return cat.includes("seed") || cat.includes("microgreen");
          if (f === "tools") return cat.includes("tool") || cat.includes("trowel") || cat.includes("shear") || cat.includes("prun");
          if (f === "watering") return cat.includes("water") || cat.includes("can") || cat.includes("spray") || cat.includes("mist");
          if (f === "decor") return cat.includes("decor") || cat.includes("pebble") || cat.includes("pole") || cat.includes("hanger");
          if (f === "pots") return cat.includes("pot") || cat.includes("planter");
          return cat.includes(f);
        });
        if (!matchesCategory) return false;
      }

      // Price filter
      const min = productFilters.priceMin !== "" ? Number(productFilters.priceMin) : null;
      const max = productFilters.priceMax !== "" ? Number(productFilters.priceMax) : null;
      if (min !== null && item.price < min) return false;
      if (max !== null && item.price > max) return false;

      // In stock
      if (productFilters.inStockOnly && (item.stock ?? 1) <= 0) return false;

      return true;
    });

    // Sorting compatible with UgaooSortOption
    switch (productSortBy) {
      case "relevant":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "best_selling":
        result.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      case "alpha_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alpha_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [productFilters, products, productSortBy]);

  const activeProductFilterCount = useMemo(() => {
    let count = 0;
    count += productFilters.categories.length;
    if (productFilters.priceMin !== "" || productFilters.priceMax !== "") count += 1;
    if (productFilters.inStockOnly) count += 1;
    return count;
  }, [productFilters]);

  const paginatedProducts = useMemo(() => {
    const start = (currentProductPage - 1) * PRODUCT_PAGE_SIZE;
    return filteredProducts.slice(start, start + PRODUCT_PAGE_SIZE);
  }, [filteredProducts, currentProductPage]);

  const removeCategoryChip = (cat: string) => {
    setProductFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  // Seasonal Checklist
  const getSeasonalAdvice = () => {
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) {
      return { title: "Spring Care Checklist", desc: "Spring is here! Plants are waking up. Begin fertilizing and consider repotting rootbound plants." };
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      return { title: "Summer Care Checklist", desc: "Summer heat is peak! Soil dries rapidly. Water in early mornings and protect from harsh midday sun." };
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      return { title: "Autumn Care Checklist", desc: "Autumn transition: as daylight shortens, reduce watering frequency and inspect leaf undersides for pests." };
    } else {
      return { title: "Winter Care Checklist", desc: "Winter dormancy: water sparingly when topsoil is bone dry and keep plants away from drafty windows." };
    }
  };
  const seasonal = getSeasonalAdvice();

  return (
    <Layout>
      <SEO
        title="Care Tips - Plant Care Guides & Essentials | Nepal Cozy Care"
        description="Master houseplant care with curated botanical guides, plant doctor scanner, and shop essential potting soils, organic neem sprays, fertilizers, and tools in Nepal."
        canonicalPath="/care-tips"
      />

      <div className="care-tips-page ugaoo-plants-page">
        {/* ================= HERO HEADER ================= */}
        <header className="ugaoo-plants-hero">
          <div className="ugaoo-plants-hero-inner">
            <h1 className="ugaoo-page-heading">Care Tips & Plant Essentials</h1>
            <p className="ugaoo-page-subtext">
              Shop authentic plant care products (soils, fertilizers, organic pest sprays, tools) & explore practical care guides designed for Nepal homes.
            </p>
          </div>
        </header>

        {/* Circular Categories Bubbles */}
        <CategoryBubbles />

        {/* ================= VIEW SELECTOR TABS ================= */}
        <div className="care-tips-container" style={{ margin: "1.25rem auto 0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              padding: "0.4rem",
              background: "#f1f5f9",
              borderRadius: "9999px",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange("products")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "9999px",
                border: "none",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === "products" ? "#0d4e3a" : "transparent",
                color: activeTab === "products" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "products" ? "0 2px 6px rgba(13, 78, 58, 0.25)" : "none",
              }}
            >
              <ShoppingBag size={16} />
              Care Products ({filteredProducts.length})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("guides")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "9999px",
                border: "none",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === "guides" ? "#0d4e3a" : "transparent",
                color: activeTab === "guides" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "guides" ? "0 2px 6px rgba(13, 78, 58, 0.25)" : "none",
              }}
            >
              <BookOpenText size={16} />
              Botanical Guides ({totalGuides || careTips.length})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("scanner")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "9999px",
                border: "none",
                fontWeight: 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === "scanner" ? "#0d4e3a" : "transparent",
                color: activeTab === "scanner" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "scanner" ? "0 2px 6px rgba(13, 78, 58, 0.25)" : "none",
              }}
            >
              <Activity size={16} />
              AI Leaf Scanner
            </button>
          </div>
        </div>

        {/* ================= SECTION 1: CARE PRODUCTS CATALOG ================= */}
        {activeTab === "products" && (
          <section className="ct-products-section" style={{ marginTop: "1rem" }}>
            {/* Action Bar matching Plants & Accessories */}
            <div className="ugaoo-action-bar-container">
              <div className="ugaoo-action-bar">
                <button
                  type="button"
                  className="ugaoo-filter-btn"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  aria-label="Open plant care filters"
                >
                  <SlidersHorizontal size={17} className="ugaoo-filter-icon" />
                  <span className="ugaoo-filter-text">FILTER</span>
                  {activeProductFilterCount > 0 && (
                    <span className="ugaoo-filter-badge">{activeProductFilterCount}</span>
                  )}
                </button>

                <div className="ugaoo-action-right">
                  <span className="ugaoo-count-label">
                    {filteredProducts.length} care product{filteredProducts.length === 1 ? "" : "s"}
                  </span>
                  <UgaooSortDropdown value={productSortBy} onChange={setProductSortBy} />
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeProductFilterCount > 0 && (
                <div className="ugaoo-active-chips-bar">
                  {productFilters.categories.map((c) => (
                    <span key={c} className="ugaoo-active-chip">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                      <button
                        type="button"
                        onClick={() => removeCategoryChip(c)}
                        aria-label={`Remove ${c} filter`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}

                  {(productFilters.priceMin !== "" || productFilters.priceMax !== "") && (
                    <span className="ugaoo-active-chip">
                      Price: Rs. {productFilters.priceMin || 0} - {productFilters.priceMax || "Max"}
                      <button
                        type="button"
                        onClick={() =>
                          setProductFilters((prev) => ({ ...prev, priceMin: "", priceMax: "" }))
                        }
                        aria-label="Remove price filter"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  {productFilters.inStockOnly && (
                    <span className="ugaoo-active-chip">
                      In Stock Only
                      <button
                        type="button"
                        onClick={() =>
                          setProductFilters((prev) => ({ ...prev, inStockOnly: false }))
                        }
                        aria-label="Remove in stock filter"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    className="ugaoo-clear-all-chip-btn"
                    onClick={() => setProductFilters(defaultAccessoriesFilterValues)}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <main className="ugaoo-plants-main">
              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    padding: "3.5rem 2rem",
                    textAlign: "center",
                    color: "#6b7280",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    margin: "2rem auto",
                    maxWidth: "600px",
                  }}
                >
                  <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>
                    No care products found matching your filters.
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "1.5rem" }}>
                    Try clearing your category or price filters to explore more soils, sprays, and plant foods.
                  </p>
                  <button
                    type="button"
                    onClick={() => setProductFilters(defaultAccessoriesFilterValues)}
                    style={{
                      background: "#0d4e3a",
                      color: "#ffffff",
                      padding: "0.55rem 1.25rem",
                      borderRadius: "9999px",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="plants-grid">
                  {paginatedProducts.map((item, index) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      index={index}
                      badge={item.badge}
                      isWishlisted={wishlistIds.includes(item.id)}
                      isWishlistBusy={wishlistBusyId === item.id}
                      onToggleWishlist={(id) => void toggleWishlist(id)}
                      onAddToCart={(id, name) => void addToCart({ id, name })}
                      isCartBusy={cartBusyId === item.id}
                      defaultFallbackImage="/images/neem.webp"
                    />
                  ))}
                </div>
              )}

              {/* Product Pagination */}
              {filteredProducts.length > PRODUCT_PAGE_SIZE && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "3rem",
                  }}
                >
                  {Array.from(
                    { length: Math.ceil(filteredProducts.length / PRODUCT_PAGE_SIZE) },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentProductPage(pageNum);
                        window.scrollTo({ top: 380, behavior: "smooth" });
                      }}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        border: pageNum === currentProductPage ? "none" : "1px solid #e2e8f0",
                        background: pageNum === currentProductPage ? "#0d4e3a" : "#ffffff",
                        color: pageNum === currentProductPage ? "#ffffff" : "#475569",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}
            </main>
          </section>
        )}

        {/* ================= SECTION 2: BOTANICAL CARE GUIDES ================= */}
        {activeTab === "guides" && (
          <div className="care-tips-container ct-ecosystem-body" style={{ marginTop: "1rem" }}>
            {/* Search Bar for Guides */}
            <form
              className="ct-hero-search-form"
              onSubmit={handleSearchSubmit}
              style={{ maxWidth: "720px", margin: "0 auto 2rem" }}
            >
              <label className="ct-hero-search-input">
                <Search size={18} />
                <input
                  type="search"
                  aria-label="Search care tips"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search watering, sunlight, fungus gnats, organic neem, repotting..."
                />
              </label>
              <button type="submit" className="ct-hero-search-btn">
                Search Guides
              </button>
            </form>

            <div className="ct-grid-layout">
              <aside className="ct-sidebar">
                <div className="ct-seasonal-widget">
                  <div className="ct-seasonal-header">
                    <CalendarHeart size={20} />
                    <span>Right Now</span>
                  </div>
                  <h4>{seasonal.title}</h4>
                  <p>{seasonal.desc}</p>
                </div>
                <div className="ct-quick-categories">
                  <h3>Care Categories</h3>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "")}
                  >
                    <Sprout size={16} /> All Topics
                  </button>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "watering" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "watering")}
                  >
                    <CloudRain size={16} /> Watering 101
                  </button>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "indoor" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "indoor")}
                  >
                    <Sun size={16} /> Lighting & Indoor
                  </button>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "pest_control" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "pest_control")}
                  >
                    <Bug size={16} /> Pest Control
                  </button>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "fertilizing" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "fertilizing")}
                  >
                    <Flower2 size={16} /> Fertilizing
                  </button>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "seasonal" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "seasonal")}
                  >
                    <CalendarHeart size={16} /> Seasonal & Climate
                  </button>
                  <button
                    className={`ct-quick-pill ${selectedCategory === "outdoor" ? "active" : ""}`}
                    onClick={() => updateGuideFilter("category", "outdoor")}
                  >
                    <Sprout size={16} /> Outdoor & Balcony
                  </button>
                </div>
              </aside>

              <main className="ct-main-content">
                <section className="ct-library-bar">
                  <div className="ct-library-bar-copy">
                    <span className="ct-library-bar-kicker">Cozy Care Library</span>
                    <h2>
                      {selectedCategory
                        ? `${selectedCategory.replace(/_/g, " ").toUpperCase()} Guides`
                        : "All Botanical Care Guides"}
                    </h2>
                    <p>
                      Click any guide to read detailed instructions, see linked essential products, and build a lasting routine.
                    </p>
                  </div>
                  {(appliedSearchQuery || selectedCategory || difficulty || guideSortBy !== "newest") && (
                    <button type="button" className="ct-library-reset-btn" onClick={clearGuideFilters}>
                      Clear Filters
                    </button>
                  )}
                </section>

                <div className="ct-library-controls">
                  <label>
                    Difficulty{" "}
                    <select
                      aria-label="Difficulty"
                      value={difficulty}
                      onChange={(e) => updateGuideFilter("difficulty", e.target.value)}
                    >
                      <option value="">All levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </label>
                  <label>
                    Sort by{" "}
                    <select
                      aria-label="Sort care tips"
                      value={guideSortBy}
                      onChange={(e) => updateGuideFilter("sort_by", e.target.value)}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="popular">Most read</option>
                    </select>
                  </label>
                </div>

                {guidesError ? (
                  <div role="alert" className="care-tips-empty">
                    <p>{guidesError}</p>
                    <button className="care-tips-clear-btn" onClick={() => setRetryGuides((n) => n + 1)}>
                      Try again
                    </button>
                  </div>
                ) : (
                  <TipsGrid
                    careTips={careTips}
                    loading={loadingGuides}
                    clearFilters={clearGuideFilters}
                    currentPage={currentGuidePage}
                    lastPage={lastGuidePage}
                    setCurrentPage={setCurrentGuidePage}
                  />
                )}
              </main>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: AI LEAF SCANNER & EMERGENCY ================= */}
        {activeTab === "scanner" && (
          <div className="care-tips-container ct-ecosystem-body" style={{ marginTop: "1.5rem" }}>
            <section className="ct-hospital-banner" style={{ marginBottom: "2rem" }}>
              <div className="ct-hospital-visual">
                <div className="ct-hospital-icon-wrap">
                  <Shield size={28} />
                </div>
                <div className="ct-hospital-text">
                  <h3>Plant Emergency? Let's Diagnose It</h3>
                  <p>Answer a few quick questions or upload a photo to identify leaf spots, yellowing, and bugs.</p>
                </div>
              </div>
              <button onClick={() => navigate("/plant-health-checker")} className="ct-hospital-btn">
                Open Health Diagnostic <ArrowRight size={18} />
              </button>
            </section>

            {/* AI Leaf Scanner */}
            <AIPlantHealthScanner />
          </div>
        )}

        {/* Filter Drawer for Products */}
        <AccessoriesFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={productFilters}
          onApply={(newFilters) => setProductFilters(newFilters)}
          totalProductsCount={filteredProducts.length}
        />
      </div>
    </Layout>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import CategoryBubbles from "../components/plants/CategoryBubbles";
import UgaooSortDropdown, {
  type UgaooSortOption,
} from "../components/plants/UgaooSortDropdown";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import AccessoriesFilterDrawer, {
  defaultAccessoriesFilterValues,
  type AccessoriesFilterValues,
} from "../components/pots/AccessoriesFilterDrawer";
import { useWishlist } from "../hooks/useWishlist";
import { useAddToCart } from "../hooks/useAddToCart";
import SEO from "../components/common/SEO";
import "../styles/plants.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

import {
  type AccessoryItem,
  fallbackAccessories,
} from "../features/catalog/accessoriesData";

export default function Pots() {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [items, setItems] = useState<AccessoryItem[]>(fallbackAccessories);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<AccessoriesFilterValues>(defaultAccessoriesFilterValues);
  const [sortBy, setSortBy] = useState<UgaooSortOption>("featured");
  const PAGE_SIZE = 16;
  const [currentPage, setCurrentPage] = useState(1);

  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  const { cartBusyId, addToCart } = useAddToCart(API);

  // Sync category from URL query param if present
  useEffect(() => {
    if (urlCategory) {
      let mapped = urlCategory.toLowerCase();
      if (mapped.includes("pot") || mapped.includes("planter")) mapped = "pots";
      else if (mapped.includes("seed")) mapped = "seeds";
      else if (mapped.includes("decor") || mapped.includes("pebble")) mapped = "decor";
      else if (mapped.includes("soil")) mapped = "soil";
      else if (mapped.includes("fertiliz")) mapped = "fertilizer";
      else if (mapped.includes("water")) mapped = "watering";
      else if (mapped.includes("tool")) mapped = "tools";
      
      else if (mapped.includes("pest") || mapped.includes("care")) mapped = "care";

      setFilters({
        ...defaultAccessoriesFilterValues,
        categories: [mapped],
      });
      setCurrentPage(1);
    } else {
      setFilters(defaultAccessoriesFilterValues);
      setCurrentPage(1);
    }
  }, [urlCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    // Show the bundled catalog immediately while refreshing from the server.
    const fetchAccessories = async () => {
      try {
        const response = await fetch(`${API}/api/plants?per_page=100&include_accessories=1`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load accessories (${response.status})`);
        }
        const data = await response.json();
        const rawList = data.data?.plants || data.data?.data || data.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const parsed = rawList.map((item: any) => ({
            ...item,
            price: typeof item.price === "string" ? parseFloat(item.price) : Number(item.price) || 0,
            avg_rating: Number(item.avg_rating) || 4.8,
            review_count: Number(item.review_count) || (60 + ((item.id * 13) % 90)),
            discount_percent: item.discount_percent ?? (12 + ((item.id * 3) % 11)),
            total_sold: Number(item.total_sold) || 0,
            views: Number(item.views) || 0,
          }));

          const onlyAccessories = parsed.filter((item: AccessoryItem) => {
            const cat = (item.category || "").toLowerCase();
            return (
              cat.includes("pot") ||
              cat.includes("tool") ||
              cat.includes("soil") ||
              cat.includes("fertilizer") ||
              cat.includes("accessory") ||
              cat.includes("watering")
            );
          });

          if (!controller.signal.aborted && onlyAccessories.length > 0) {
            setItems(onlyAccessories);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn("Could not fetch remote accessories, using catalog:", err);
        }
      }
    };

    void fetchAccessories();
    return () => controller.abort();
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.categories.length;
    if (filters.priceMin !== "" || filters.priceMax !== "") count += 1;
    if (filters.inStockOnly) count += 1;
    return count;
  }, [filters]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.categories.length > 0) {
      result = result.filter((item) => {
        const cat = (item.category || "").toLowerCase();
        return filters.categories.some((f) => {
          if (f === "pots") return cat.includes("pot") || cat.includes("planter");
          if (f === "soil") return cat.includes("soil") || cat.includes("media");
          if (f === "fertilizer") return cat.includes("fertiliz") || cat.includes("food");
          if (f === "tools") return cat.includes("tool") || cat.includes("trowel") || cat.includes("shovel");
          if (f === "watering") return cat.includes("water") || cat.includes("can") || cat.includes("spray");
          return cat.includes(f);
        });
      });
    }

    if (filters.priceMin !== "") {
      result = result.filter((item) => item.price >= Number(filters.priceMin));
    }
    if (filters.priceMax !== "") {
      result = result.filter((item) => item.price <= Number(filters.priceMax));
    }

    if (filters.inStockOnly) {
      result = result.filter((item) => (item.stock ?? 1) > 0);
    }

    switch (sortBy) {
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
  }, [filters, items, sortBy]);

  // Paginated accessories (16 items per page = 4 rows of 4)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const removeCategoryChip = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  return (
    <Layout>
      <SEO
        title="Pots & Accessories - Ceramic Pots, Soils & Tools | Nepal Cozy Care"
        description="Shop designer ceramic pots, terracotta planters, organic potting soils, and precision gardening tools in Nepal with doorstep delivery."
        canonicalPath="/pots"
      />

      <div className="plants-page ugaoo-plants-page">
        {/* ================= HERO HEADER (Consistent with Plants & Curated Pages) ================= */}
        <header className="ugaoo-plants-hero">
          <div className="ugaoo-plants-hero-inner">
            <h1 className="ugaoo-page-heading">Pots & Accessories</h1>
            <p className="ugaoo-page-subtext">
              Explore designer ceramic planters, organic potting soils, plant care tools and accessories
            </p>
          </div>
        </header>

        <CategoryBubbles />

        {/* ================= ACTION BAR ================= */}
        <div className="ugaoo-action-bar-container">
          <div className="ugaoo-action-bar">
            <button
              type="button"
              className="ugaoo-filter-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
              aria-label="Open accessories filters"
            >
              <SlidersHorizontal size={17} className="ugaoo-filter-icon" />
              <span className="ugaoo-filter-text">FILTER</span>
              {activeFilterCount > 0 && (
                <span className="ugaoo-filter-badge">{activeFilterCount}</span>
              )}
            </button>

            <div className="ugaoo-action-right">
              <span className="ugaoo-count-label">
                {filteredItems.length} product{filteredItems.length === 1 ? "" : "s"}
              </span>
              <UgaooSortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="ugaoo-active-chips-bar">
              {filters.categories.map((c) => (
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

              {(filters.priceMin !== "" || filters.priceMax !== "") && (
                <span className="ugaoo-active-chip">
                  Price: Rs. {filters.priceMin || 0} - {filters.priceMax || "Max"}
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, priceMin: "", priceMax: "" }))
                    }
                    aria-label="Remove price filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {filters.inStockOnly && (
                <span className="ugaoo-active-chip">
                  In Stock Only
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, inStockOnly: false }))
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
                onClick={() => setFilters(defaultAccessoriesFilterValues)}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* ================= MAIN PRODUCTS GRID ================= */}
        <main className="ugaoo-plants-main">
          {filteredItems.length === 0 ? (
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
                No accessories found matching your filters.
              </p>
              <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "1.5rem" }}>
                Try adjusting your category or price filters to explore more items.
              </p>
              <button
                type="button"
                onClick={() => setFilters(defaultAccessoriesFilterValues)}
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
              {paginatedItems.map((item, index) => (
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
                      defaultFallbackImage="/images/pot1.jpg"
                    />
                  ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={filteredItems.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 380, behavior: "smooth" });
            }}
          />
        </main>

        {/* ================= FILTER DRAWER ================= */}
        <AccessoriesFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onApply={(newFilters) => setFilters(newFilters)}
          totalProductsCount={filteredItems.length}
        />
      </div>
    </Layout>
  );
}

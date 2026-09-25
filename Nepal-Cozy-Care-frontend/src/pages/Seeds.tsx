import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Sparkles, Sprout, Sun, Droplets } from "lucide-react";
import CategoryBubbles from "../components/plants/CategoryBubbles";
import UgaooSortDropdown, {
  type UgaooSortOption,
} from "../components/plants/UgaooSortDropdown";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import SeedsFilterDrawer, {
  defaultSeedsFilterValues,
  type SeedsFilterValues,
} from "../components/seeds/SeedsFilterDrawer";
import { useWishlist } from "../hooks/useWishlist";
import { useAddToCart } from "../hooks/useAddToCart";
import SEO from "../components/common/SEO";
import { fallbackSeeds, type SeedItem } from "../features/catalog/seedsData";
import "../styles/plants.css";
import "../styles/seeds.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const QUICK_TABS = [
  { id: "all", label: "All Seeds", icon: "🌱" },
  { id: "vegetables", label: "Vegetables", icon: "🍅", category: "Vegetable Seeds" },
  { id: "flowers", label: "Flowers", icon: "🌸", category: "Flower Seeds" },
  { id: "herbs", label: "Herbs", icon: "🌿", category: "Herb Seeds" },
  { id: "microgreens", label: "Microgreens", icon: "🌱", category: "Microgreens" },
  { id: "fruits", label: "Exotic Fruits", icon: "🍓", category: "Fruit & Exotic Seeds" },
  { id: "kits", label: "Seed Kits", icon: "🎁", category: "Combo Kits" },
];

export default function Seeds() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [items, setItems] = useState<SeedItem[]>(fallbackSeeds);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<SeedsFilterValues>(defaultSeedsFilterValues);
  const [sortBy, setSortBy] = useState<UgaooSortOption>("featured");
  const [activeTab, setActiveTab] = useState<string>("all");
  const PAGE_SIZE = 16;
  const [currentPage, setCurrentPage] = useState(1);

  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  const { cartBusyId, addToCart } = useAddToCart(API);

  // Sync category from URL parameter
  useEffect(() => {
    if (urlCategory) {
      const lower = urlCategory.toLowerCase();
      let matchedTab = "all";
      let matchedCat = "";

      if (lower.includes("veg") || lower.includes("tomato") || lower.includes("chili")) {
        matchedTab = "vegetables";
        matchedCat = "Vegetable Seeds";
      } else if (lower.includes("flower") || lower.includes("marigold") || lower.includes("sunflower")) {
        matchedTab = "flowers";
        matchedCat = "Flower Seeds";
      } else if (lower.includes("herb") || lower.includes("basil") || lower.includes("coriander")) {
        matchedTab = "herbs";
        matchedCat = "Herb Seeds";
      } else if (lower.includes("microgreen")) {
        matchedTab = "microgreens";
        matchedCat = "Microgreens";
      } else if (lower.includes("fruit") || lower.includes("strawberry")) {
        matchedTab = "fruits";
        matchedCat = "Fruit & Exotic Seeds";
      } else if (lower.includes("kit") || lower.includes("combo")) {
        matchedTab = "kits";
        matchedCat = "Combo Kits";
      }

      setActiveTab(matchedTab);
      if (matchedCat) {
        setFilters((prev) => ({ ...prev, categories: [matchedCat] }));
      }
    }
  }, [urlCategory]);

  // Fetch remote items from backend and merge with fallback seeds
  useEffect(() => {
    const controller = new AbortController();
    const fetchRemoteSeeds = async () => {
      try {
        const response = await fetch(`${API}/api/plants?per_page=100&include_accessories=1`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          const raw = data.data?.plants || data.data?.data || data.data || [];
          if (Array.isArray(raw)) {
            const seedProducts = raw
              .filter((p: any) => {
                const cat = (p.category || "").toLowerCase();
                const name = (p.name || "").toLowerCase();
                return cat.includes("seed") || name.includes("seed") || name.includes("seeds");
              })
              .map((p: any): SeedItem => {
                let cat: SeedItem["category"] = "Vegetable Seeds";
                const catLower = (p.category || "").toLowerCase() + " " + (p.name || "").toLowerCase();
                if (catLower.includes("flower") || catLower.includes("sunflower") || catLower.includes("marigold") || catLower.includes("zinnia")) {
                  cat = "Flower Seeds";
                } else if (catLower.includes("herb") || catLower.includes("basil") || catLower.includes("coriander")) {
                  cat = "Herb Seeds";
                } else if (catLower.includes("microgreen")) {
                  cat = "Microgreens";
                } else if (catLower.includes("fruit") || catLower.includes("strawberry")) {
                  cat = "Fruit & Exotic Seeds";
                } else if (catLower.includes("kit") || catLower.includes("combo")) {
                  cat = "Combo Kits";
                }

                return {
                  id: p.id,
                  name: p.name,
                  category: cat,
                  scientific_name: p.scientific_name || "",
                  season: "All Season",
                  germination_days: "5 - 10 Days",
                  harvest_days: "45 - 60 Days",
                  germination_rate: "90%+",
                  sunlight: "Full Sun",
                  difficulty: (p.difficulty as any) || "Beginner",
                  price: typeof p.price === "string" ? parseFloat(p.price) : Number(p.price) || 150,
                  discount_percent: p.discount_percent ?? 12,
                  stock: Number(p.stock) ?? 25,
                  image: p.image || "/images/categories/seeds.webp",
                  subtitle: p.scientific_name || "High germination organic seed packet",
                  description: p.description || "Carefully harvested seeds suited for home gardens in Nepal.",
                  avg_rating: Number(p.avg_rating) || 4.8,
                  review_count: Number(p.review_count) || 45,
                  badge: p.is_best_seller ? "BESTSELLER" : p.is_popular_item ? "POPULAR" : undefined,
                  total_sold: Number(p.total_sold) || 0,
                  views: Number(p.views) || 0,
                  is_active: p.is_active ?? true,
                };
              });

            if (!controller.signal.aborted && seedProducts.length > 0) {
              // Merge remote seeds prioritizing backend items
              const remoteIds = new Set(seedProducts.map((s) => s.id));
              const combined = [
                ...seedProducts,
                ...fallbackSeeds.filter((s) => !remoteIds.has(s.id)),
              ];
              setItems(combined);
            }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn("Could not load backend seeds, using local catalog:", err);
        }
      }
    };

    void fetchRemoteSeeds();
    return () => controller.abort();
  }, []);

  const handleTabClick = (tabId: string, categoryName?: string) => {
    setActiveTab(tabId);
    if (!categoryName) {
      setFilters((prev) => ({ ...prev, categories: [] }));
      setSearchParams({});
    } else {
      setFilters((prev) => ({ ...prev, categories: [categoryName] }));
      setSearchParams({ category: tabId });
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.is_active === false) return false;

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(item.category)) return false;
      }

      // Sowing Season filter
      if (filters.seasons.length > 0) {
        if (!filters.seasons.includes(item.season) && item.season !== "All Season") return false;
      }

      // Sunlight filter
      if (filters.sunlights.length > 0) {
        if (!filters.sunlights.includes(item.sunlight)) return false;
      }

      // Difficulty filter
      if (filters.difficulties.length > 0) {
        if (!filters.difficulties.includes(item.difficulty)) return false;
      }

      // Price filter
      if (filters.priceMin !== "" && item.price < filters.priceMin) return false;
      if (filters.priceMax !== "" && item.price > filters.priceMax) return false;

      // Availability filter
      if (filters.inStockOnly && item.stock <= 0) return false;

      return true;
    });
  }, [items, filters]);

  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    switch (sortBy) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "best_selling":
        return list.sort((a, b) => (b.total_sold ?? 0) - (a.total_sold ?? 0));
      case "alpha_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "alpha_desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "date_desc":
        return list.sort((a, b) => b.id - a.id);
      case "featured":
      case "relevant":
      default:
        return list;
    }
  }, [filteredItems, sortBy]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  const activeFilterCount =
    filters.categories.length +
    filters.seasons.length +
    filters.sunlights.length +
    filters.difficulties.length +
    (filters.priceMin !== "" || filters.priceMax !== "" ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  const clearAllFilters = () => {
    setFilters(defaultSeedsFilterValues);
    setActiveTab("all");
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="seeds-page">
      <SEO
        title="Garden Seeds - Non-GMO Flower, Vegetable & Herb Seeds | Nepal Cozy Care"
        description="Shop certified non-GMO heirloom vegetable seeds, fragrant flower varieties, kitchen herb packets, and microgreen kits curated for Nepal's climate."
      />

      {/* Category Bubbles Navigation */}
      <CategoryBubbles />

      {/* Seeds Hero Section */}
      <section className="seeds-hero">
        <div className="seeds-hero-card">
          <span className="seeds-hero-kicker">
            <Sprout size={16} /> Certified Non-GMO Seeds
          </span>
          <h1 className="seeds-hero-title">Pure Garden Seeds & Germination Kits</h1>
          <p className="seeds-hero-desc">
            Cultivate your own organic kitchen produce, cheerful flowering balconies, and aromatic culinary herbs with high-germination seeds adapted for Nepal&apos;s climate.
          </p>
          <div className="seeds-hero-badges">
            <span className="seeds-hero-badge">
              <Sparkles size={15} /> 90%+ Germination Rate Guarantee
            </span>
            <span className="seeds-hero-badge">
              <Sun size={15} /> 100% Chemical-Free & Non-GMO
            </span>
            <span className="seeds-hero-badge">
              <Droplets size={15} /> Sowing & Scent Calendar Included
            </span>
          </div>
        </div>
      </section>

      {/* Quick Filter Variety Tabs */}
      <div className="seeds-pills-bar" role="tablist" aria-label="Seed varieties">
        {QUICK_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`seeds-pill-btn ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => handleTabClick(tab.id, tab.category)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Ugaoo Action Bar */}
      <div className="ugaoo-action-bar-container">
        <div className="ugaoo-action-bar">
          <button
            type="button"
            className="ugaoo-filter-btn"
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-label="Open seed filters"
          >
            <SlidersHorizontal size={16} />
            <span>FILTER</span>
            {activeFilterCount > 0 && (
              <span className="ugaoo-filter-badge">{activeFilterCount}</span>
            )}
          </button>

          <span className="ugaoo-count-label">
            {sortedItems.length} {sortedItems.length === 1 ? "seed packet" : "seed packets"}
          </span>

          <UgaooSortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="ugaoo-active-chips-bar">
            {filters.categories.map((c) => (
              <button
                key={c}
                type="button"
                className="ugaoo-active-chip"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    categories: prev.categories.filter((cat) => cat !== c),
                  }))
                }
              >
                <span>{c}</span>
                <X size={13} />
              </button>
            ))}

            {filters.seasons.map((s) => (
              <button
                key={s}
                type="button"
                className="ugaoo-active-chip"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    seasons: prev.seasons.filter((item) => item !== s),
                  }))
                }
              >
                <span>{s}</span>
                <X size={13} />
              </button>
            ))}

            {filters.difficulties.map((d) => (
              <button
                key={d}
                type="button"
                className="ugaoo-active-chip"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    difficulties: prev.difficulties.filter((item) => item !== d),
                  }))
                }
              >
                <span>{d}</span>
                <X size={13} />
              </button>
            ))}

            {(filters.priceMin !== "" || filters.priceMax !== "") && (
              <button
                type="button"
                className="ugaoo-active-chip"
                onClick={() => setFilters((prev) => ({ ...prev, priceMin: "", priceMax: "" }))}
              >
                <span>
                  Price: Rs. {filters.priceMin || 0} - {filters.priceMax || "Any"}
                </span>
                <X size={13} />
              </button>
            )}

            {filters.inStockOnly && (
              <button
                type="button"
                className="ugaoo-active-chip"
                onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
              >
                <span>In Stock Only</span>
                <X size={13} />
              </button>
            )}

            <button type="button" className="ugaoo-clear-all-link" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <section className="plants-grid-container" aria-label="Seeds Catalog">
        {paginatedItems.length === 0 ? (
          <div className="seeds-empty-state">
            <Sprout size={48} style={{ color: "#10b981", margin: "0 auto 1rem auto" }} />
            <h3>No seed packets matched your filter</h3>
            <p>Try clearing some filters or exploring all seed categories.</p>
            <button
              type="button"
              className="ugaoo-filter-apply-btn"
              onClick={clearAllFilters}
              style={{ padding: "0.6rem 1.5rem" }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="plants-grid">
            {paginatedItems.map((seed) => {
              const plantAdapted = {
                id: seed.id,
                name: seed.name,
                category: seed.category,
                price: seed.price,
                stock: seed.stock,
                image: seed.image,
                scientific_name: seed.scientific_name,
                avg_rating: seed.avg_rating,
                review_count: seed.review_count,
                discount_percent: seed.discount_percent,
                is_active: seed.is_active ?? true,
                badge: seed.badge,
                description: seed.subtitle,
              };

              const isWishlisted = wishlistIds.includes(seed.id);
              const isWishlistBusy = wishlistBusyId === seed.id;
              const isCartBusy = cartBusyId === seed.id;

              return (
                <ProductCard
                  key={seed.id}
                  product={plantAdapted}
                  isWishlisted={isWishlisted}
                  isWishlistBusy={isWishlistBusy}
                  isCartBusy={isCartBusy}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={(id, name) => addToCart({ id, name, quantity: 1 })}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div style={{ marginTop: "2.5rem" }}>
          <Pagination
            currentPage={currentPage}
            totalItems={sortedItems.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 380, behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* Sowing & Germination Guide Section */}
      <section className="seeds-guide-section">
        <div className="seeds-guide-card">
          <div className="seeds-guide-head">
            <h3>4 Golden Steps to 95% Germination</h3>
            <p>Follow our simple botanical protocol for strong, resilient seedlings every time.</p>
          </div>
          <div className="seeds-steps-grid">
            <div className="seeds-step-card">
              <span className="seeds-step-number">1</span>
              <h4>Soil & Media Prep</h4>
              <p>
                Use a lightweight, well-draining seedling mix (70% Cocopeat + 30% Vermicompost). Avoid heavy clay garden soils that compact tiny roots.
              </p>
            </div>
            <div className="seeds-step-card">
              <span className="seeds-step-number">2</span>
              <h4>Sowing Depth</h4>
              <p>
                A golden rule is to sow seeds at a depth roughly double their size. Tiny flower and herb seeds should only be lightly pressed into moist surface soil.
              </p>
            </div>
            <div className="seeds-step-card">
              <span className="seeds-step-number">3</span>
              <h4>Moisture & Mist</h4>
              <p>
                Never pour heavy water over delicate seeds. Use a fine mist sprayer to keep the top layer evenly moist until initial green sprouts appear.
              </p>
            </div>
            <div className="seeds-step-card">
              <span className="seeds-step-number">4</span>
              <h4>Sunlight & Transplant</h4>
              <p>
                Once sprouts emerge, move them into bright morning sun. Transplant into permanent pots or garden beds once 3-4 true leaves have fully developed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Drawer */}
      <SeedsFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        totalProductsCount={filteredItems.length}
      />
    </div>
  );
}

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

type AccessoryItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock?: number;
  image?: string;
  subtitle?: string;
  description?: string;
  avg_rating?: number;
  review_count?: number;
  badge?: string;
  discount_percent?: number;
  total_sold?: number;
  views?: number;
  created_at?: string;
};

const fallbackAccessories: AccessoryItem[] = [
  {
    id: 101,
    name: "Minimalist Ceramic Planter",
    category: "Pots & Planters",
    price: 850,
    image: "/images/pot1.jpg",
    subtitle: "Handcrafted ceramic planter with drainage tray",
    description: "Premium smooth-finish ceramic pot with matching drainage saucer for moisture balance.",
    avg_rating: 4.9,
    review_count: 84,
    badge: "BESTSELLER",
    discount_percent: 20,
    stock: 25,
    total_sold: 140,
    views: 450,
  },
  {
    id: 102,
    name: "Terracotta Earth Breath Pot",
    category: "Pots & Planters",
    price: 650,
    image: "/images/pot2.jpg",
    subtitle: "Porous natural clay for optimum root airflow",
    description: "Classic terracotta planter baked at high heat for porous breathability and root health.",
    avg_rating: 4.8,
    review_count: 62,
    badge: "TRENDING",
    discount_percent: 15,
    stock: 30,
    total_sold: 95,
    views: 320,
  },
  {
    id: 103,
    name: "Marble Finish Statement Pot",
    category: "Pots & Planters",
    price: 1200,
    image: "/images/pot4.jpg",
    subtitle: "Luxury glazed indoor decorative centerpiece",
    description: "Modern marble-swirl ceramic pot that elevates indoor living rooms and offices.",
    avg_rating: 4.9,
    review_count: 53,
    badge: "FEATURED",
    discount_percent: 18,
    stock: 15,
    total_sold: 80,
    views: 290,
  },
  {
    id: 104,
    name: "Pastel Nordic Planter",
    category: "Pots & Planters",
    price: 799,
    image: "/images/pot3.webp",
    subtitle: "Contemporary indoor planter with base saucer",
    description: "Soft matte finish pot designed for succulents, snake plants, and desktop foliage.",
    avg_rating: 4.7,
    review_count: 41,
    badge: "POPULAR",
    discount_percent: 12,
    stock: 20,
    total_sold: 65,
    views: 210,
  },
  {
    id: 105,
    name: "Organic Indoor Potting Mix (5kg)",
    category: "Soil & Media",
    price: 450,
    image: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp",
    subtitle: "Enriched nutrient mix with perlite & coco peat",
    description: "Sterilized organic potting substrate formulated to prevent root rot and promote growth.",
    avg_rating: 4.9,
    review_count: 128,
    badge: "BESTSELLER",
    discount_percent: 15,
    stock: 50,
    total_sold: 210,
    views: 600,
  },
  {
    id: 106,
    name: "Long-Spout Precision Watering Can",
    category: "Watering",
    price: 650,
    image: "/images/can.jpg",
    subtitle: "Ergonomic stainless steel precision spout",
    description: "Narrow spout directs water straight to soil without splashing leaves or furniture.",
    avg_rating: 4.8,
    review_count: 95,
    badge: "BESTSELLER",
    discount_percent: 20,
    stock: 22,
    total_sold: 110,
    views: 390,
  },
  {
    id: 107,
    name: "Heavy-Duty Garden Trowel",
    category: "Garden Tools",
    price: 380,
    image: "/images/sovel.webp",
    subtitle: "Rust-resistant stainless steel hand shovel",
    description: "Durable gardening hand shovel with ergonomic wooden grip for repotting and soil aeration.",
    avg_rating: 4.8,
    review_count: 73,
    badge: "FEATURED",
    discount_percent: 15,
    stock: 35,
    total_sold: 70,
    views: 240,
  },
  {
    id: 108,
    name: "Artisan Hand-Carved Ceramic Pot",
    category: "Pots & Planters",
    price: 950,
    image: "/images/Ceramic Plant Pot.jpg",
    subtitle: "Textured ceramic pot for indoor focal plants",
    description: "Unique artisan-textured planter with protective glaze and drainage hole.",
    avg_rating: 4.8,
    review_count: 59,
    badge: "TOP RATED",
    discount_percent: 17,
    stock: 18,
    total_sold: 88,
    views: 310,
  },
  {
    id: 109,
    name: "Indoor Plant Food & Fertilizer Drops",
    category: "Plant Care",
    price: 320,
    image: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp",
    subtitle: "Liquid concentrated nutrient blend for rapid leaf growth",
    description: "Gentle micronutrient formula to boost leaf shine, root strength, and bloom vigor.",
    avg_rating: 4.8,
    review_count: 81,
    badge: "ESSENTIAL",
    discount_percent: 10,
    stock: 40,
    total_sold: 160,
    views: 430,
  },
  {
    id: 110,
    name: "Modern Geometric Ceramic Planter",
    category: "Pots & Planters",
    price: 890,
    image: "/images/pot1.jpg",
    subtitle: "Faceted geometric design with drainage tray",
    description: "Modern faceted silhouette designed for modern side tables and entryway consoles.",
    avg_rating: 4.9,
    review_count: 45,
    badge: "POPULAR",
    discount_percent: 15,
    stock: 20,
    total_sold: 75,
    views: 290,
  },
  {
    id: 111,
    name: "Neem Oil Organic Pest Spray (500ml)",
    category: "Plant Care",
    price: 350,
    image: "/images/can.jpg",
    subtitle: "Cold-pressed pure organic pest protector",
    description: "Natural organic pest shield against aphids, spider mites, mealybugs, and fungus gnats.",
    avg_rating: 4.7,
    review_count: 67,
    badge: "BESTSELLER",
    discount_percent: 12,
    stock: 35,
    total_sold: 145,
    views: 380,
  },
  {
    id: 112,
    name: "Stainless Steel Pruning Shears",
    category: "Garden Tools",
    price: 520,
    image: "/images/sovel.webp",
    subtitle: "Ultra-sharp bypass shears with safety lock",
    description: "Precision steel blades for clean cuts when pruning yellowed foliage and shaping stems.",
    avg_rating: 4.9,
    review_count: 89,
    badge: "RECOMMENDED",
    discount_percent: 15,
    stock: 28,
    total_sold: 130,
    views: 350,
  },
  {
    id: 113,
    name: "Cocopeat Growth Brick (5kg Expanded)",
    category: "Soil & Media",
    price: 280,
    image: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp",
    subtitle: "Low-EC washed natural coco coir substrate",
    description: "High moisture-retentive base medium for seed germination, potting blends, and cuttings.",
    avg_rating: 4.8,
    review_count: 112,
    badge: "TRENDING",
    discount_percent: 10,
    stock: 60,
    total_sold: 230,
    views: 520,
  },
  {
    id: 114,
    name: "Nordic Wave Ceramic Pot",
    category: "Pots & Planters",
    price: 990,
    image: "/images/pot2.jpg",
    subtitle: "Fluted ribbed texture planter with tray",
    description: "Contemporary vertical ribbed ceramic pot with matte glaze and drainage hole.",
    avg_rating: 4.8,
    review_count: 38,
    badge: "NEW",
    discount_percent: 15,
    stock: 16,
    total_sold: 50,
    views: 220,
  },
  {
    id: 115,
    name: "Fine Mist Brass Plant Spritzer",
    category: "Watering",
    price: 490,
    image: "/images/can.jpg",
    subtitle: "Vintage brass mist sprayer for humid tropicals",
    description: "Gentle ambient mist sprayer ideal for calatheas, ferns, monsteras, and moss poles.",
    avg_rating: 4.7,
    review_count: 54,
    badge: "FEATURED",
    discount_percent: 18,
    stock: 25,
    total_sold: 92,
    views: 280,
  },
  {
    id: 116,
    name: "Perlite Aeration Substrate (2L)",
    category: "Soil & Media",
    price: 240,
    image: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp",
    subtitle: "Sterilized volcanic glass for porous soil aeration",
    description: "Prevents soil compaction and improves oxygen circulation around delicate root systems.",
    avg_rating: 4.9,
    review_count: 76,
    badge: "POPULAR",
    discount_percent: 10,
    stock: 45,
    total_sold: 180,
    views: 410,
  },
  {
    id: 117,
    name: "Macrame Plant Hanger (100% Cotton)",
    category: "Garden Decor",
    price: 420,
    image: "/images/Ceramic Plant Pot.jpg",
    subtitle: "Hand-knotted boho hanging rope for 6-10 inch pots",
    description: "Durable woven cotton hanging sling to display cascading pothos, philodendrons, and string of pearls.",
    avg_rating: 4.8,
    review_count: 63,
    badge: "BESTSELLER",
    discount_percent: 15,
    stock: 30,
    total_sold: 115,
    views: 340,
  },
  {
    id: 118,
    name: "Moss Pole Climbing Support (3ft)",
    category: "Garden Decor",
    price: 360,
    image: "/images/sovel.webp",
    subtitle: "Natural coco coir stake for aerial root climbers",
    description: "Encourages larger leaf fenestration on Monstera deliciosa, Syngoniums, and climbing pothos.",
    avg_rating: 4.9,
    review_count: 91,
    badge: "ESSENTIAL",
    discount_percent: 12,
    stock: 40,
    total_sold: 175,
    views: 460,
  },
  {
    id: 119,
    name: "Terracotta Hanging Bowl Planter",
    category: "Pots & Planters",
    price: 750,
    image: "/images/pot3.webp",
    subtitle: "Clay hanging basin with rust-proof wire hangers",
    description: "Wide shallow planter perfect for trailing succulents, sedums, and flowering petunias.",
    avg_rating: 4.7,
    review_count: 33,
    badge: "POPULAR",
    discount_percent: 14,
    stock: 18,
    total_sold: 62,
    views: 210,
  },
  {
    id: 120,
    name: "Soil Moisture & Light Meter (3-in-1)",
    category: "Garden Tools",
    price: 680,
    image: "/images/can.jpg",
    subtitle: "Battery-free sensor for moisture, pH, and light",
    description: "Takes the guesswork out of watering by showing exactly how wet the soil is deep inside the root zone.",
    avg_rating: 4.8,
    review_count: 104,
    badge: "RECOMMENDED",
    discount_percent: 20,
    stock: 22,
    total_sold: 140,
    views: 490,
  },
  {
    id: 121,
    name: "Polished River Pebbles (1kg)",
    category: "Garden Decor",
    price: 220,
    image: "/images/pot4.jpg",
    subtitle: "Natural smooth decorative mulch pebbles",
    description: "Retains topsoil moisture, prevents fungus gnats, and adds a neat spa finish to potted plants.",
    avg_rating: 4.6,
    review_count: 48,
    badge: "DECOR",
    discount_percent: 10,
    stock: 50,
    total_sold: 95,
    views: 260,
  },
  {
    id: 122,
    name: "Organic Vermicompost Fertilizer (5kg)",
    category: "Soil & Media",
    price: 390,
    image: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp",
    subtitle: "Nutrient-rich natural earthworm castings",
    description: "Odorless bio-fertilizer packed with beneficial microbes, nitrogen, and essential trace minerals.",
    avg_rating: 4.9,
    review_count: 118,
    badge: "ORGANIC",
    discount_percent: 15,
    stock: 45,
    total_sold: 215,
    views: 570,
  },
  {
    id: 123,
    name: "Soft-Grip Soil Hand Cultivator",
    category: "Garden Tools",
    price: 340,
    image: "/images/sovel.webp",
    subtitle: "Three-prong claw for soil loosening and aerating",
    description: "Ergonomic handheld cultivator to break soil crusts and mix in fertilizers without damaging roots.",
    avg_rating: 4.8,
    review_count: 52,
    badge: "FEATURED",
    discount_percent: 12,
    stock: 30,
    total_sold: 78,
    views: 230,
  },
  {
    id: 124,
    name: "Pure Copper Plant Watering Jug",
    category: "Watering",
    price: 1450,
    image: "/images/can.jpg",
    subtitle: "Handcrafted pure copper watering pitcher",
    description: "Naturally antimicrobial copper water jug that doubles as an elegant countertop display piece.",
    avg_rating: 4.9,
    review_count: 41,
    badge: "LUXURY",
    discount_percent: 15,
    stock: 12,
    total_sold: 45,
    views: 310,
  },
];

export default function Pots() {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [items, setItems] = useState<AccessoryItem[]>(fallbackAccessories);
  const [loading, setLoading] = useState(true);
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
      if (mapped.includes("pot") || mapped.includes("planter")) mapped = "Pots & Planters";
      else if (mapped.includes("soil") || mapped.includes("fertilizer")) mapped = "Soil & Media";
      else if (mapped.includes("water")) mapped = "Watering";
      else if (mapped.includes("tool")) mapped = "Garden Tools";
      else if (mapped.includes("decor")) mapped = "Garden Decor";
      else if (mapped.includes("pest") || mapped.includes("care")) mapped = "Plant Care";

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
    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/api/plants?per_page=100&include_accessories=1`);
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

          if (onlyAccessories.length > 0) {
            setItems(onlyAccessories);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote accessories, using catalog:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAccessories();
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
          {filteredItems.length === 0 && !loading ? (
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
              {loading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="product-card skeleton-card">
                      <div className="product-image-wrapper skeleton-box" />
                      <div className="product-info">
                        <div className="skeleton-line" style={{ width: "70%", height: "1.2rem" }} />
                        <div className="skeleton-line" style={{ width: "50%", height: "0.9rem" }} />
                        <div
                          className="skeleton-line"
                          style={{ width: "40%", height: "1.1rem", marginTop: "0.5rem" }}
                        />
                      </div>
                    </div>
                  ))
                : paginatedItems.map((item, index) => (
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

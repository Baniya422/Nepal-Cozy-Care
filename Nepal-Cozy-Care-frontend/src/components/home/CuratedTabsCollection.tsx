import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Leaf, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { TabsCollectionContent } from "../../features/homepage/storefront";
import {
  popularFallbackPlants,
  shopFallbackPlants,
  bestSellersFallbackPlants,
  type HomepageFallbackPlant,
} from "../../features/homepage/content";
import ProductCard from "../common/ProductCard";
import { useWishlist } from "../../hooks/useWishlist";
import { useAddToCart } from "../../hooks/useAddToCart";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const potFallbacks: HomepageFallbackPlant[] = [
  {
    id: 101,
    name: "Artisanal Matte Ceramic Planter",
    subtitle: "Includes matching drainage saucer",
    price: 750,
    image: "/images/pot3.webp",
    avg_rating: 4.9,
    review_count: 88,
    badge: "BESTSELLER",
    discount_percent: 15,
  },
  {
    id: 102,
    name: "Terracotta Ribbed Cylinder Pot",
    subtitle: "Breathable natural clay for roots",
    price: 650,
    image: "/images/pot1.jpg",
    avg_rating: 4.8,
    review_count: 64,
    badge: "NATURAL CLAY",
    discount_percent: 10,
  },
  {
    id: 103,
    name: "Nordic Minimalist White Pot",
    subtitle: "High-grade glazed ceramic finish",
    price: 890,
    image: "/images/pot2.jpg",
    avg_rating: 4.9,
    review_count: 112,
    badge: "TRENDING",
    discount_percent: 20,
  },
  {
    id: 104,
    name: "Modern Geometric Hexa Planter",
    subtitle: "Contemporary table & shelf statement",
    price: 820,
    image: "/images/pot4.jpg",
    avg_rating: 4.7,
    review_count: 45,
    badge: "POPULAR",
    discount_percent: 12,
  },
];

interface CuratedTabsCollectionProps {
  content?: TabsCollectionContent;
}

export default function CuratedTabsCollection({ content }: CuratedTabsCollectionProps) {
  const tabs = content?.tabs && content.tabs.length > 0 ? content.tabs : [
    { id: "best_sellers", label: "🌟 Best Sellers", badge: "Top Rated" },
    { id: "air_purifying", label: "🍃 Air Purifying", badge: "NASA Tested" },
    { id: "low_light", label: "☀️ Low Maintenance", badge: "Beginner" },
    { id: "ceramic_pots", label: "🪴 Designer Pots", badge: "Handmade" },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || "best_sellers");
  const [items, setItems] = useState<HomepageFallbackPlant[]>(bestSellersFallbackPlants);
  const [loading, setLoading] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  const { cartBusyId, addToCart } = useAddToCart(API);

  // Switch tab data
  useEffect(() => {
    let source: HomepageFallbackPlant[] = bestSellersFallbackPlants;
    let endpoint = `${API}/api/homepage/best-sellers`;

    if (activeTab === "air_purifying") {
      source = popularFallbackPlants;
      endpoint = `${API}/api/homepage/popular-items`;
    } else if (activeTab === "low_light") {
      source = shopFallbackPlants;
      endpoint = `${API}/api/homepage/shop-plants`;
    } else if (activeTab === "ceramic_pots") {
      source = potFallbacks;
      endpoint = `${API}/api/accessories?category=pots`;
    }

    setItems(source);

    // Attempt live fetch if available
    const controller = new AbortController();
    const fetchTabProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const fetched = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
          if (fetched && fetched.length > 0) {
            setItems(fetched.slice(0, 8));
          }
        }
      } catch {
        // Fallback remains active
      } finally {
        setLoading(false);
      }
    };

    void fetchTabProducts();

    return () => controller.abort();
  }, [activeTab]);

  const updateScrollState = () => {
    const el = gridRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scrollByAmount = (delta: number) => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  useEffect(() => {
    updateScrollState();
  }, [items]);

  return (
    <section className="sf-curated-tabs-section" aria-label="Curated Plant Collections">
      <div className="sf-container">
        {/* Header */}
        <div className="sf-tabs-header">
          <div className="sf-tabs-title-group">
            <span className="sf-badge-pill">
              <Leaf size={14} />
              <span>Curated For Nepal Homes</span>
            </span>
            <h2 className="sf-main-heading">{content?.title || "Nepal's Favorite Greenery"}</h2>
            <p className="sf-sub-heading">
              {content?.subtitle || "Handpicked indoor plants and artisan ceramic planters delivered in custom transit pods."}
            </p>
          </div>

          <div className="sf-carousel-controls desktop-only">
            <button
              type="button"
              className="sf-nav-arrow"
              onClick={() => scrollByAmount(-340)}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="sf-nav-arrow"
              onClick={() => scrollByAmount(340)}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="sf-tab-buttons-wrap">
          <div className="sf-tab-buttons">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`sf-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  {tab.badge && <span className="sf-tab-badge">{tab.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Carousel / Grid */}
        <div
          className="sf-products-track"
          ref={gridRef}
          onScroll={updateScrollState}
        >
          {items.map((item, idx) => {
            const isPot = activeTab === "ceramic_pots";
            const productData = {
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              subtitle: item.subtitle,
              avg_rating: item.avg_rating,
              review_count: item.review_count,
              badge: item.badge,
              discount_percent: item.discount_percent,
              category: isPot ? "Pots" : "Plants",
            };

            return (
              <div key={`${item.id}-${idx}`} className="sf-product-card-wrap">
                <ProductCard
                  product={productData}
                  index={idx}
                  isWishlisted={wishlistIds.includes(item.id)}
                  isWishlistBusy={wishlistBusyId === item.id}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={() => addToCart({ id: item.id, name: item.name })}
                  isCartBusy={cartBusyId === item.id}
                  defaultFallbackImage={isPot ? "/images/pot3.webp" : "/images/placeholder-plant.jpg"}
                />
              </div>
            );
          })}
        </div>

        {/* View All Collection Link */}
        <div className="sf-tabs-footer">
          <Link
            to={activeTab === "ceramic_pots" ? "/pots" : "/plants"}
            className="sf-view-all-pill"
          >
            <span>Explore All {activeTab === "ceramic_pots" ? "Planters" : "Plants"}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

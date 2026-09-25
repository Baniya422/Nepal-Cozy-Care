import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useWishlist } from "../../hooks/useWishlist";
import type { HomepageFallbackPlant, ProductSectionContent } from "../../features/homepage/content";
import ProductCard from "../common/ProductCard";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type PlantCarouselItem = HomepageFallbackPlant & {
  category?: string;
  description?: string;
};

interface ProductCarouselProps {
  content: ProductSectionContent;
  apiEndpoint: string;
  cacheKey: string;
  fallbackPlants: HomepageFallbackPlant[];
  defaultBadge?: string;
}

export default function ProductCarousel({
  content,
  apiEndpoint,
  cacheKey,
  fallbackPlants,
  defaultBadge = "BESTSELLER",
}: ProductCarouselProps) {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<PlantCarouselItem[]>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return fallbackPlants;
  });

  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  const { cartBusyId, addToCart } = useAddToCart(API);

  const updateScrollState = () => {
    const el = gridRef.current;
    if (!el) return;
    const tolerance = 8;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);

    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 24 : 290;
    const index = Math.round(el.scrollLeft / step);
    const clamped = Math.max(0, Math.min(index, plants.length - 1));
    setActiveSlide(clamped);
  };

  const scrollNext = () => {
    const el = gridRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? (firstCard.offsetWidth + 24) * 2 : 580;
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  const scrollPrev = () => {
    const el = gridRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? (firstCard.offsetWidth + 24) * 2 : 580;
    el.scrollBy({ left: -step, behavior: "smooth" });
  };

  const scrollToSlide = (index: number) => {
    const el = gridRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 24 : 290;
    el.scrollTo({ left: index * step, behavior: "smooth" });
    setActiveSlide(index);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [plants]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    fetch(`${API}${apiEndpoint}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        const items = json?.data?.data;
        if (Array.isArray(items) && items.length > 0) {
          const enriched: PlantCarouselItem[] = items.map((plant: any, index: number) => {
            const fallback = fallbackPlants[index % fallbackPlants.length];
            return {
              id: plant.id,
              name: plant.name,
              price: Number(plant.price),
              image: plant.image || fallback?.image,
              avg_rating: Number(plant.avg_rating) || 0,
              review_count: plant.review_count ?? 0,
              badge: plant.is_best_seller ? "BESTSELLER" : plant.is_popular_item ? "POPULAR" : "",
              discount_percent: plant.discount_percent ?? 0,
              stock: plant.stock,
              subtitle: plant.subtitle || plant.category || fallback?.subtitle || "Healthy indoor potted plant",
            };
          });
          setPlants(enriched);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(enriched));
          } catch {
            // ignore
          }
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [apiEndpoint, cacheKey, defaultBadge, fallbackPlants]);

  if (loading) {
    return (
      <section className="product-section">
        <h2 className="home-section-title">{content.title}</h2>
        <div className="product-carousel-wrapper">
          <div className="product-carousel-track">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="product-image-wrapper skeleton-box" />
                <div className="product-info">
                  <div className="skeleton-line" style={{ width: "70%", height: "1.2rem" }} />
                  <div className="skeleton-line" style={{ width: "50%", height: "0.9rem" }} />
                  <div className="skeleton-line" style={{ width: "40%", height: "1.1rem", marginTop: "0.5rem" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (plants.length === 0) {
    return (
      <section className="product-section">
        <h2 className="home-section-title">{content.title}</h2>
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
          <p>{content.empty_message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-section">
      <h2 className="home-section-title">{content.title}</h2>

      <div className="product-carousel-wrapper">
        {/* Left Arrow Button (Image 3 Style) */}
        {canScrollLeft && (
          <button
            type="button"
            className="carousel-nav-btn carousel-nav-prev"
            onClick={scrollPrev}
            aria-label="Previous products"
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
        )}

        {/* Carousel Track */}
        <div
          className="product-grid product-carousel-track"
          ref={gridRef}
          onScroll={updateScrollState}
        >
          {plants.map((plant, index) => (
            <ProductCard
              key={plant.id}
              product={plant}
              index={index}
              badge={plant.badge ?? defaultBadge}
              isWishlisted={wishlistIds.includes(plant.id)}
              isWishlistBusy={wishlistBusyId === plant.id}
              onToggleWishlist={(id) => void toggleWishlist(id)}
              onAddToCart={(id, name) => void addToCart({ id, name })}
              isCartBusy={cartBusyId === plant.id}
            />
          ))}
        </div>

        {/* Right Arrow Button (Image 3 Style) */}
        {canScrollRight && (
          <button
            type="button"
            className="carousel-nav-btn carousel-nav-next"
            onClick={scrollNext}
            aria-label="Next products"
          >
            <ChevronRight size={26} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Mobile Indicator Dots */}
      <div
        className="mobile-carousel-dots"
        role="tablist"
        aria-label={`${content.title} navigation`}
      >
        {plants.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            className={`carousel-dot ${idx === activeSlide ? "active" : ""}`}
            onClick={() => scrollToSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="section-action">
        <button
          className="view-all-btn"
          onClick={() => navigate(content.button_path)}
        >
          {content.button_label}
        </button>
      </div>
    </section>
  );
}

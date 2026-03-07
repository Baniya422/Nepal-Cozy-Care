import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Heart, Star, Search, SlidersHorizontal } from "lucide-react";
import "../styles/popular-items.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
  category?: string;
};

type SortOption = "popular" | "price-asc" | "price-desc" | "name-asc";
type CategoryFilter = "all" | "plants" | "pots" | "accessories" | "tools";

export default function PopularItemsPage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [category, setCategory] = useState<CategoryFilter>("all");

  // filters
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [ratingFilters, setRatingFilters] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API}/api/homepage/popular-items?per_page=100`)
      .then(res => res.json())
      .then(json => {
        const items = json.data?.data ?? [];
        setPlants(items);
      })
      .catch(() => setPlants([]))
      .finally(() => setLoading(false));
  }, []);

  const togglePrice = (value: string) => {
    setPriceFilters(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleRating = (value: number) => {
    setRatingFilters(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const filteredPlants = useMemo(() => {
    let data = [...plants];

    // Filter by category
    if (category !== "all") {
      data = data.filter(p => {
        const itemCategory = (p.category || "plants").toLowerCase();
        return itemCategory.includes(category);
      });
    }

    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(q));
    }

    // Filter by price range
    if (priceFilters.length > 0) {
      data = data.filter(p =>
        priceFilters.some(range => {
          if (range === "under-500") return p.price < 500;
          if (range === "500-1000") return p.price >= 500 && p.price <= 1000;
          if (range === "1000-2000") return p.price > 1000 && p.price <= 2000;
          if (range === "over-2000") return p.price > 2000;
          return true;
        })
      );
    }

    // Filter by rating
    if (ratingFilters.length > 0) {
      data = data.filter(p => {
        const rating = p.avg_rating ?? 5;
        return ratingFilters.some(min => rating >= min);
      });
    }

    // Sort data
    data.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      // "popular" – sort by rating desc then name
      const ra = a.avg_rating ?? 0;
      const rb = b.avg_rating ?? 0;
      if (rb !== ra) return rb - ra;
      return a.name.localeCompare(b.name);
    });

    return data;
  }, [plants, searchTerm, category, priceFilters, ratingFilters, sort]);

  return (
    <Layout>
      <div className="popular-page">
        {/* Sidebar */}
        <aside className="popular-sidebar">
          <div className="popular-sidebar-section">
            <h2 className="popular-sidebar-title">Price Range</h2>
            <div className="popular-sidebar-options">
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("under-500")}
                  onChange={() => togglePrice("under-500")}
                />
                <span>Under Rs 500</span>
              </label>
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("500-1000")}
                  onChange={() => togglePrice("500-1000")}
                />
                <span>Rs 500 - Rs 1000</span>
              </label>
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("1000-2000")}
                  onChange={() => togglePrice("1000-2000")}
                />
                <span>Rs 1000 - Rs 2000</span>
              </label>
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("over-2000")}
                  onChange={() => togglePrice("over-2000")}
                />
                <span>Over Rs 2000</span>
              </label>
            </div>
          </div>

          <div className="popular-sidebar-section">
            <h2 className="popular-sidebar-title">Rating</h2>
            <div className="popular-sidebar-options">
              {[4, 3, 2].map(min => (
                <label key={min} className="popular-option">
                  <input
                    type="checkbox"
                    checked={ratingFilters.includes(min)}
                    onChange={() => toggleRating(min)}
                  />
                  <span>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < min ? "popular-star-filled" : "popular-star-empty"}
                      />
                    ))}{" "}
                    &amp; up
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="popular-main">
          <header className="popular-header">
            <div>
              <h1 className="popular-title">Popular Items</h1>
              <p className="popular-subtitle">
                Discover our most loved plants and accessories.
              </p>
            </div>

            <div className="popular-header-actions">
              <div className="popular-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="popular-filter-btn" type="button">
                <SlidersHorizontal size={16} />
                Filters
              </button>

              <div className="popular-sort">
                <span>Sort by</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  className="popular-sort-select"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name A-Z</option>
                </select>
              </div>
            </div>
          </header>

          {/* Filter chips row */}
          <div className="popular-chips-row">
            <button 
              className={`popular-chip ${category === "all" ? "popular-chip-active" : ""}`}
              type="button"
              onClick={() => setCategory("all")}
            >
              All
            </button>
            <button 
              className={`popular-chip ${category === "plants" ? "popular-chip-active" : ""}`}
              type="button"
              onClick={() => setCategory("plants")}
            >
              Plants
            </button>
            <button 
              className={`popular-chip ${category === "pots" ? "popular-chip-active" : ""}`}
              type="button"
              onClick={() => setCategory("pots")}
            >
              Pots
            </button>
            <button 
              className={`popular-chip ${category === "accessories" ? "popular-chip-active" : ""}`}
              type="button"
              onClick={() => setCategory("accessories")}
            >
              Accessories
            </button>
            <button 
              className={`popular-chip ${category === "tools" ? "popular-chip-active" : ""}`}
              type="button"
              onClick={() => setCategory("tools")}
            >
              Tools
            </button>
          </div>

          {/* Grid */}
          <div className="popular-grid">
            {loading && (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <article key={index} className="popular-card skeleton-card">
                    <div className="popular-card-image-wrapper skeleton-image">
                      <div className="skeleton-shimmer"></div>
                    </div>
                    <div className="popular-card-body">
                      <div className="skeleton-text skeleton-popular-name"></div>
                      <div className="skeleton-text skeleton-popular-rating"></div>
                      <div className="popular-card-footer">
                        <div className="skeleton-text skeleton-popular-price"></div>
                        <div className="skeleton-text skeleton-popular-button"></div>
                      </div>
                    </div>
                  </article>
                ))}
              </>
            )}

            {!loading && filteredPlants.length === 0 && (
              <div className="popular-empty">No products match your filters.</div>
            )}

            {!loading && filteredPlants.map(plant => (
              <article key={plant.id} className="popular-card">
                <div className="popular-card-image-wrapper">
                  <img
                    src={
                      plant.image
                        ? `${API}/storage/${plant.image}`
                        : "/images/placeholder-plant.jpg"
                    }
                    alt={plant.name}
                    className="popular-card-image"
                    onError={e => {
                      (e.target as HTMLImageElement).src = "/images/placeholder-plant.jpg";
                    }}
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  />
                  <button
                    className="popular-heart-btn"
                    type="button"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={18} />
                  </button>
                </div>

                <div className="popular-card-body">
                  <h3 className="popular-card-name">{plant.name}</h3>
                  <div className="popular-card-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(plant.avg_rating ?? 5)
                            ? "popular-star-filled"
                            : "popular-star-empty"
                        }
                      />
                    ))}
                    <span className="popular-rating-text">
                      {plant.avg_rating?.toFixed(1) ?? "5.0"}
                    </span>
                  </div>
                  <div className="popular-card-footer">
                    <span className="popular-card-price">Rs {Number(plant.price).toFixed(2)}</span>
                    <button
                      className="popular-add-btn"
                      type="button"
                      onClick={() => navigate(`/plants/${plant.id}`)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}


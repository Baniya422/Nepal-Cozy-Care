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
  total_sold?: number;
};

type SortOption = "sales" | "price-asc" | "price-desc" | "name-asc";

export default function BestSellersPage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortOption>("sales");

  // filters
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [ratingFilters, setRatingFilters] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API}/api/best-sellers?per_page=100`)
      .then(res => res.json())
      .then(json => setPlants(json.data?.data ?? json.data ?? []))
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

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(q));
    }

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

    if (ratingFilters.length > 0) {
      data = data.filter(p => {
        const rating = p.avg_rating ?? 5;
        return ratingFilters.some(min => rating >= min);
      });
    }

    data.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      // "sales" – sort by total_sold desc
      const sa = a.total_sold ?? 0;
      const sb = b.total_sold ?? 0;
      if (sb !== sa) return sb - sa;
      return a.name.localeCompare(b.name);
    });

    return data;
  }, [plants, searchTerm, priceFilters, ratingFilters, sort]);

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
                <span>Under रू 500</span>
              </label>
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("500-1000")}
                  onChange={() => togglePrice("500-1000")}
                />
                <span>रू 500 - 1000</span>
              </label>
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("1000-2000")}
                  onChange={() => togglePrice("1000-2000")}
                />
                <span>रू 1000 - 2000</span>
              </label>
              <label className="popular-option">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("over-2000")}
                  onChange={() => togglePrice("over-2000")}
                />
                <span>Above रू 2000</span>
              </label>
            </div>
          </div>

          <div className="popular-sidebar-section">
            <h2 className="popular-sidebar-title">Rating</h2>
            <div className="popular-sidebar-options">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="popular-option">
                  <input
                    type="checkbox"
                    checked={ratingFilters.includes(rating)}
                    onChange={() => toggleRating(rating)}
                  />
                  <div className="rating-display">
                    {Array(rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} size={14} className="star-filled" />
                      ))}
                    <span className="rating-text">{rating}+ Star</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="popular-main">
          {/* Header */}
          <div className="popular-header">
            <h1 className="popular-title">Best Sellers 🔥</h1>
            <p className="popular-subtitle">
              Most wanted and loved plants by our customers
            </p>
          </div>

          {/* Search & Sort Bar */}
          <div className="popular-controls">
            <div className="popular-search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search best sellers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="popular-search"
              />
            </div>

            <div className="popular-sort-wrapper">
              <SlidersHorizontal size={18} />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="popular-sort"
              >
                <option value="sales">Most Sold</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Plants Grid */}
          {loading ? (
            <div className="popular-loading">Loading best sellers...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="popular-empty">No plants found in this selection</div>
          ) : (
            <div className="popular-grid">
              {filteredPlants.map((plant, idx) => (
                <div
                  key={plant.id}
                  className="popular-card"
                  onClick={() => navigate(`/plants/${plant.id}`)}
                >
                  {/* Seller Badge */}
                  <div className="seller-badge">{idx + 1}. Bestseller</div>

                  {/* Image */}
                  <div className="popular-card-image">
                    <img
                      src={
                        plant.image ||
                        "https://via.placeholder.com/250x200?text=Plant"
                      }
                      alt={plant.name}
                      loading="lazy"
                    />
                  </div>

                  {/* Body */}
                  <div className="popular-card-body">
                    <h3 className="popular-card-title">{plant.name}</h3>

                    {/* Rating */}
                    <div className="popular-card-rating">
                      <div className="stars">
                        {Array(Math.floor(plant.avg_rating ?? 0))
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className="star-filled"
                            />
                          ))}
                      </div>
                      <span className="rating-score">
                        {plant.avg_rating?.toFixed(1) ?? "N/A"}
                      </span>
                    </div>

                    {/* Sales Count */}
                    <div className="sales-count">
                      <span className="sales-label">Sold:</span>
                      <span className="sales-number">
                        {plant.total_sold ?? 0} units
                      </span>
                    </div>

                    {/* Price */}
                    <div className="popular-card-footer">
                      <span className="popular-card-price">
                        रू {plant.price?.toLocaleString() ?? "0"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

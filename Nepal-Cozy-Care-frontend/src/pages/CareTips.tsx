import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, BookOpen, TrendingUp, Clock } from "lucide-react";
import Layout from "../components/layout/Layout";
import type { CareTip, CareTipCategories, CareTipResponse } from "../types/careTip";
import "../styles/careTips.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const categoryLabels: Record<string, string> = {
  watering: "Watering",
  fertilizing: "Fertilizing",
  pest_control: "Pest Control",
  indoor: "Indoor Plants",
  outdoor: "Outdoor Plants",
  seasonal: "Seasonal Care",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function CareTips() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [categories, setCategories] = useState<CareTipCategories>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get("difficulty") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "newest");

  useEffect(() => {
    fetchCategories();
    fetchCareTips();
  }, [selectedCategory, selectedDifficulty, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API}/api/care-tips/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || {});
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCareTips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      if (sortBy) params.append("sort_by", sortBy);
      params.append("page", currentPage.toString());

      const response = await fetch(`${API}/api/care-tips?${params.toString()}`);
      if (response.ok) {
        const data: CareTipResponse = await response.json();
        setCareTips(data.data.data || []);
        setTotal(data.data.total || 0);
        setCurrentPage(data.data.current_page || 1);
        setLastPage(data.data.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching care tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURLParams();
    fetchCareTips();
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
    if (sortBy) params.append("sort_by", sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficultyLabels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "difficulty-beginner";
      case "intermediate":
        return "difficulty-intermediate";
      case "advanced":
        return "difficulty-advanced";
      default:
        return "difficulty-beginner";
    }
  };

  return (
    <Layout>
      <div className="care-tips-page">
        {/* Hero Section */}
        <section className="care-tips-hero">
          <div className="care-tips-hero-content">
            <h1 className="care-tips-hero-title">Plant Care Tips</h1>
            <p className="care-tips-hero-subtitle">
              Expert advice to help your plants thrive. Search by keyword or browse by category.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="care-tips-search">
              <div className="care-tips-search-input-wrapper">
                <Search size={20} className="care-tips-search-icon" />
                <input
                  type="text"
                  placeholder='Search tips: "watering cactus", "yellow leaves"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="care-tips-search-input"
                />
              </div>
              <button type="submit" className="care-tips-search-btn">
                Search
              </button>
            </form>

            <p className="care-tips-search-hint">
              <strong>Popular:</strong> Watering schedule, Fertilizing guide, Pest control, Indoor care
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="care-tips-filters-section">
          <div className="care-tips-container">
            <div className="care-tips-filters">
              <div className="care-tips-filter-group">
                <Filter size={18} />
                <span className="care-tips-filter-label">Filter by:</span>
              </div>

              {/* Category Filter */}
              <div className="care-tips-filter-dropdown">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="care-tips-filter-select"
                >
                  <option value="">All Categories</option>
                  {Object.entries(categories).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="care-tips-filter-dropdown">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="care-tips-filter-select"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Sort */}
              <div className="care-tips-filter-dropdown">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="care-tips-filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {(selectedCategory || selectedDifficulty || searchQuery) && (
                <button onClick={clearFilters} className="care-tips-clear-filters">
                  Clear Filters
                </button>
              )}
            </div>

            <div className="care-tips-results-count">
              {total} {total === 1 ? "tip" : "tips"} found
            </div>
          </div>
        </section>

        {/* Tips Grid */}
        <section className="care-tips-grid-section">
          <div className="care-tips-container">
            {loading ? (
              <div className="care-tips-loading">Loading care tips...</div>
            ) : careTips.length === 0 ? (
              <div className="care-tips-empty">
                <BookOpen size={64} className="care-tips-empty-icon" />
                <h3>No tips found</h3>
                <p>Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="care-tips-clear-btn">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="care-tips-grid">
                  {careTips.map((tip) => (
                    <article
                      key={tip.id}
                      className="care-tip-card"
                      onClick={() => navigate(`/care-tips/${tip.id}`)}
                    >
                      <div className="care-tip-image-wrapper">
                        <img
                          src={
                            tip.image
                              ? `${API}/storage/${tip.image}`
                              : "/images/care-tip-placeholder.jpg"
                          }
                          alt={tip.title}
                          className="care-tip-image"
                        />
                        <span className={`care-tip-difficulty ${getDifficultyColor(tip.difficulty)}`}>
                          {getDifficultyLabel(tip.difficulty)}
                        </span>
                      </div>
                      <div className="care-tip-content">
                        <span className="care-tip-category">
                          {getCategoryLabel(tip.category)}
                        </span>
                        <h3 className="care-tip-title">{tip.title}</h3>
                        <p className="care-tip-excerpt">{tip.excerpt}</p>
                        <div className="care-tip-footer">
                          <span className="care-tip-views">
                            <TrendingUp size={14} />
                            {tip.views_count.toLocaleString()} views
                          </span>
                          <span className="care-tip-date">
                            <Clock size={14} />
                            {new Date(tip.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button className="care-tip-read-more">Read More</button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="care-tips-pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="care-tips-pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="care-tips-pagination-info">
                      Page {currentPage} of {lastPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                      disabled={currentPage === lastPage}
                      className="care-tips-pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from "react";
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
  Sparkles,
  BookOpenText,
  TrendingUp,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import TipsGrid from "../components/care-tips/TipsGrid";
import type { CareTip, CareTipResponse } from "../types/careTip";
import "../styles/careTips.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function CareTips() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialPage = Number(searchParams.get("page") || "1");

  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    void fetchCareTips();
  }, [selectedCategory, currentPage, appliedSearchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (appliedSearchQuery.trim()) {
      params.set("search", appliedSearchQuery.trim());
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    setSearchParams(params, { replace: true });
  }, [appliedSearchQuery, selectedCategory, currentPage, setSearchParams]);

  const fetchCareTips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedSearchQuery) params.append("search", appliedSearchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("page", currentPage.toString());

      const response = await fetch(`${API}/api/care-tips?${params.toString()}`);
      if (response.ok) {
        const data: CareTipResponse = await response.json();
        setCareTips(data.data.data || []);
        setCurrentPage(data.data.current_page || 1);
        setLastPage(data.data.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching care tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedSearchQuery(searchQuery.trim());
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const getSeasonalAdvice = () => {
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) {
      return { title: "Spring Care Checklist", desc: "It's Spring! Your plants are waking up. Begin fertilizing and consider repotting rootbound plants." };
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      return { title: "Summer Care Checklist", desc: "It's Summer! Soil dries out rapidly. Increase your watering frequency and provide shade from harsh midday sun." };
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      return { title: "Autumn Care Checklist", desc: "It's Autumn! As days get shorter, start reducing your watering routine. Give leaves a good dust." };
    } else {
      return { title: "Winter Care Checklist", desc: "It's Winter! Plants enter dormancy. Reduce watering significantly and keep them entirely clear of cold window drafts." };
    }
  };
  const seasonal = getSeasonalAdvice();
  const featuredTip =
    [...careTips].sort((first, second) => second.views_count - first.views_count)[0] ?? null;
  const activeTopicLabel = selectedCategory
    ? {
        watering: "Watering",
        indoor: "Indoor Plants",
        pest_control: "Pest Control",
        fertilizing: "Fertilizing",
        outdoor: "Outdoor Plants",
        seasonal: "Seasonal Care",
      }[selectedCategory] || "Filtered Topic"
    : "All Topics";
  const pageViews = careTips.reduce((total, tip) => total + tip.views_count, 0);

  return (
    <Layout>
      <div className="care-tips-page">
        <div className="ct-eco-hero">
          <div className="ct-eco-hero-bg"></div>
          <div className="care-tips-container">
            <div className="ct-hero-shell">
              <div className="ct-eco-hero-content">
                <div className="ct-hero-kicker">
                  <Sparkles size={16} />
                  Cozy Care Knowledge Hub
                </div>
                <h1>Plant care guides designed for Nepal homes.</h1>
                <p>
                  Learn watering, pest control, indoor light, and seasonal care through
                  cleaner, easier-to-read guides made for everyday plant owners.
                </p>

                <form className="ct-hero-search-form" onSubmit={handleSearchSubmit}>
                  <label className="ct-hero-search-input">
                    <Search size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search watering, sunlight, fungus gnats, fertilizer..."
                    />
                  </label>
                  <button type="submit" className="ct-hero-search-btn">
                    Explore Tips
                  </button>
                </form>

                <div className="ct-hero-library-stats">
                  <div className="ct-hero-library-pill">
                    <BookOpenText size={16} />
                    {careTips.length} guides on this page
                  </div>
                  <div className="ct-hero-library-pill">
                    <TrendingUp size={16} />
                    {pageViews.toLocaleString()} total views
                  </div>
                  <div className="ct-hero-library-pill">
                    <Sprout size={16} />
                    {activeTopicLabel}
                  </div>
                </div>
              </div>

              <div className="ct-hero-spotlight">
                <span className="ct-hero-spotlight-label">Featured Guide</span>
                <h2>{featuredTip?.title || "Build a plant care routine that actually sticks."}</h2>
                <p>
                  {featuredTip?.excerpt ||
                    "Explore easy-to-follow advice cards, seasonal reminders, and care actions that feel practical instead of overwhelming."}
                </p>
                <div className="ct-hero-spotlight-meta">
                  <span>{featuredTip ? activeTopicLabel : "Curated for beginners"}</span>
                  <span>
                    {featuredTip
                      ? `${featuredTip.views_count.toLocaleString()} reads`
                      : "Nepal home friendly"}
                  </span>
                </div>
                {featuredTip ? (
                  <button
                    type="button"
                    className="ct-hero-spotlight-btn"
                    onClick={() => navigate(`/care-tips/${featuredTip.id}`)}
                  >
                    Read Featured Tip
                    <ArrowRight size={18} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="care-tips-container ct-ecosystem-body">
          <section className="ct-hospital-banner">
            <div className="ct-hospital-visual">
              <div className="ct-hospital-icon-wrap"><Shield size={28} /></div>
              <div className="ct-hospital-text">
                <h3>Plant Emergency? Let's fix it.</h3>
                <p>Answer a few quick symptoms to instantly diagnose your sick plant.</p>
              </div>
            </div>
            <button onClick={() => navigate("/plant-health-checker")} className="ct-hospital-btn">
              Open Health Checker <ArrowRight size={18} />
            </button>
          </section>

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
                  onClick={() => handleCategoryChange("")}
                >
                  <Sprout size={16}/> All Topics
                </button>
                <button
                  className={`ct-quick-pill ${selectedCategory === "watering" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("watering")}
                >
                  <CloudRain size={16}/> Watering 101
                </button>
                <button
                  className={`ct-quick-pill ${selectedCategory === "indoor" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("indoor")}
                >
                  <Sun size={16}/> Lighting 101
                </button>
                <button
                  className={`ct-quick-pill ${selectedCategory === "pest_control" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("pest_control")}
                >
                  <Bug size={16}/> Pest Control
                </button>
                <button
                  className={`ct-quick-pill ${selectedCategory === "fertilizing" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("fertilizing")}
                >
                  <Flower2 size={16}/> Fertilizing
                </button>
              </div>
            </aside>

            <main className="ct-main-content">
              <section className="ct-library-bar">
                <div className="ct-library-bar-copy">
                  <span className="ct-library-bar-kicker">Care Library</span>
                  <h2>{activeTopicLabel} guides for better plant habits</h2>
                  <p>
                    Open an article to get readable step-by-step advice, key context, and
                    related tips.
                  </p>
                </div>
                {(appliedSearchQuery || selectedCategory) && (
                  <button type="button" className="ct-library-reset-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </section>
              <TipsGrid
                careTips={careTips}
                loading={loading}
                clearFilters={clearFilters}
                currentPage={currentPage}
                lastPage={lastPage}
                setCurrentPage={setCurrentPage}
              />
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}

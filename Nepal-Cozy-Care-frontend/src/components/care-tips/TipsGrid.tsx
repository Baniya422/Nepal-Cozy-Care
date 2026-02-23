import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Clock3, ArrowRight } from "lucide-react";
import type { CareTip } from "../../types/careTip";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const FALLBACK_IMAGE = "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp";

interface TipsGridProps {
  careTips: CareTip[];
  loading: boolean;
  clearFilters: () => void;
  currentPage: number;
  lastPage: number;
  setCurrentPage: (page: number) => void;
}

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

export default function TipsGrid({
  careTips,
  loading,
  clearFilters,
  currentPage,
  lastPage,
  setCurrentPage,
}: TipsGridProps) {
  const navigate = useNavigate();

  const getReadingMinutes = (content: string) => {
    const wordCount = content
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(2, Math.ceil(wordCount / 170));
  };

  const getPreviewText = (tip: CareTip) => {
    if (tip.excerpt?.trim()) {
      return tip.excerpt;
    }

    const plainContent = tip.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plainContent.length > 150 ? `${plainContent.slice(0, 150)}...` : plainContent;
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

  if (loading) {
    return (
      <section className="care-tips-grid-section">
        <div className="care-tips-container">
          <div className="care-tips-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="care-tip-card skeleton-card">
                <div className="care-tip-image-wrapper skeleton-image">
                  <div className="skeleton-shimmer"></div>
                </div>
                <div className="care-tip-content">
                  <div className="skeleton-text skeleton-tip-category"></div>
                  <div className="skeleton-text skeleton-tip-title"></div>
                  <div className="skeleton-text skeleton-tip-excerpt"></div>
                  <div className="care-tip-footer">
                    <div className="skeleton-text skeleton-tip-meta"></div>
                    <div className="skeleton-text skeleton-tip-meta"></div>
                  </div>
                  <div className="skeleton-text skeleton-tip-button"></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (careTips.length === 0) {
    return (
      <section className="care-tips-grid-section">
        <div className="care-tips-container">
          <div className="care-tips-empty">
            <BookOpen size={64} className="care-tips-empty-icon" />
            <h3>No tips found</h3>
            <p>Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="care-tips-clear-btn">
              Clear All Filters
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="care-tips-grid-section">
      <div className="care-tips-container">
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
                      : FALLBACK_IMAGE
                  }
                  alt={tip.title}
                  className="care-tip-image"
                />
                <div className="care-tip-image-overlay"></div>
                <span className="care-tip-top-badge">{getCategoryLabel(tip.category)}</span>
                <span className={`care-tip-difficulty ${getDifficultyColor(tip.difficulty)}`}>
                  {getDifficultyLabel(tip.difficulty)}
                </span>
              </div>
              <div className="care-tip-content">
                <div className="care-tip-card-topline">
                  <span className="care-tip-category">
                    {getCategoryLabel(tip.category)}
                  </span>
                  <span className="care-tip-reading-time">
                    <Clock3 size={14} />
                    {getReadingMinutes(tip.content)} min read
                  </span>
                </div>
                <h3 className="care-tip-title">{tip.title}</h3>
                <p className="care-tip-excerpt">{getPreviewText(tip)}</p>
                <div className="care-tip-footer">
                  <span className="care-tip-views">
                    <TrendingUp size={14} />
                    {tip.views_count.toLocaleString()} views
                  </span>
                  <span className="care-tip-date">
                    <Clock3 size={14} />
                    {new Date(tip.published_at).toLocaleDateString()}
                  </span>
                </div>
                <button className="care-tip-read-more">
                  Read Guide
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="care-tips-pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="care-tips-pagination-btn"
            >
              Previous
            </button>
            <span className="care-tips-pagination-info">
              Page {currentPage} of {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(lastPage, currentPage + 1))}
              disabled={currentPage === lastPage}
              className="care-tips-pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

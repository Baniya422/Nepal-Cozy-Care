import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Eye, User, BookOpen, Leaf } from "lucide-react";
import Layout from "../components/layout/Layout";
import type { CareTip, CareTipDetailResponse } from "../types/careTip";
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

export default function CareTipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tip, setTip] = useState<CareTip | null>(null);
  const [relatedTips, setRelatedTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCareTip();
    }
  }, [id]);

  const fetchCareTip = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/care-tips/${id}`);
      if (response.ok) {
        const data: CareTipDetailResponse = await response.json();
        setTip(data.data.tip);
        setRelatedTips(data.data.related_tips || []);
      } else if (response.status === 404) {
        setError("Care tip not found");
      } else {
        setError("Failed to load care tip");
      }
    } catch (error) {
      console.error("Error fetching care tip:", error);
      setError("Failed to load care tip");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
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
      <Layout>
        <div className="care-tip-detail-page">
          <div className="care-tips-container">
            <div className="care-tip-detail-loading">Loading care tip...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !tip) {
    return (
      <Layout>
        <div className="care-tip-detail-page">
          <div className="care-tips-container">
            <div className="care-tip-detail-error">
              <BookOpen size={64} />
              <h2>{error || "Care tip not found"}</h2>
              <button
                onClick={() => navigate("/care-tips")}
                className="care-tip-detail-back-btn"
              >
                Back to Care Tips
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="care-tip-detail-page">
        {/* Back Navigation */}
        <div className="care-tips-container">
          <button
            onClick={() => navigate("/care-tips")}
            className="care-tip-detail-back"
          >
            <ArrowLeft size={18} />
            Back to Care Tips
          </button>
        </div>

        {/* Hero Section */}
        <section className="care-tip-detail-hero">
          <div className="care-tip-detail-hero-content">
            <div className="care-tip-detail-badges">
              <span className="care-tip-detail-category">
                {getCategoryLabel(tip.category)}
              </span>
              <span className={`care-tip-detail-difficulty ${getDifficultyColor(tip.difficulty)}`}>
                {difficultyLabels[tip.difficulty]}
              </span>
            </div>
            <h1 className="care-tip-detail-title">{tip.title}</h1>
            <div className="care-tip-detail-meta">
              <span className="care-tip-detail-meta-item">
                <User size={16} />
                {tip.author?.name || "Cozy Care Team"}
              </span>
              <span className="care-tip-detail-meta-item">
                <Clock size={16} />
                {new Date(tip.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="care-tip-detail-meta-item">
                <Eye size={16} />
                {tip.views_count.toLocaleString()} views
              </span>
            </div>
          </div>
          {tip.image && (
            <div className="care-tip-detail-hero-image">
              <img
                src={`${API}/storage/${tip.image}`}
                alt={tip.title}
                className="care-tip-detail-image"
              />
            </div>
          )}
        </section>

        {/* Content Section */}
        <section className="care-tip-detail-content-section">
          <div className="care-tips-container">
            <div className="care-tip-detail-grid">
              {/* Main Content */}
              <div className="care-tip-detail-main">
                <div
                  className="care-tip-detail-content"
                  dangerouslySetInnerHTML={{ __html: tip.content }}
                />
              </div>

              {/* Sidebar */}
              <aside className="care-tip-detail-sidebar">
                {/* Quick Info */}
                <div className="care-tip-detail-info-card">
                  <h3 className="care-tip-detail-info-title">
                    <Leaf size={18} />
                    Quick Info
                  </h3>
                  <div className="care-tip-detail-info-item">
                    <span className="care-tip-detail-info-label">Category</span>
                    <span className="care-tip-detail-info-value">
                      {getCategoryLabel(tip.category)}
                    </span>
                  </div>
                  <div className="care-tip-detail-info-item">
                    <span className="care-tip-detail-info-label">Difficulty</span>
                    <span className="care-tip-detail-info-value">
                      {difficultyLabels[tip.difficulty]}
                    </span>
                  </div>
                  <div className="care-tip-detail-info-item">
                    <span className="care-tip-detail-info-label">Views</span>
                    <span className="care-tip-detail-info-value">
                      {tip.views_count.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Share */}
                <div className="care-tip-detail-info-card">
                  <h3 className="care-tip-detail-info-title">Share This Tip</h3>
                  <div className="care-tip-detail-share">
                    <button
                      className="care-tip-detail-share-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related Tips Section */}
        {relatedTips.length > 0 && (
          <section className="care-tip-detail-related">
            <div className="care-tips-container">
              <h2 className="care-tip-detail-related-title">
                <BookOpen size={24} />
                You May Also Like
              </h2>
              <div className="care-tip-detail-related-grid">
                {relatedTips.map((relatedTip) => (
                  <article
                    key={relatedTip.id}
                    className="care-tip-related-card"
                    onClick={() => navigate(`/care-tips/${relatedTip.id}`)}
                  >
                    <div className="care-tip-related-image-wrapper">
                      <img
                        src={
                          relatedTip.image
                            ? `${API}/storage/${relatedTip.image}`
                            : "/images/care-tip-placeholder.jpg"
                        }
                        alt={relatedTip.title}
                        className="care-tip-related-image"
                      />
                    </div>
                    <div className="care-tip-related-content">
                      <span className="care-tip-related-category">
                        {getCategoryLabel(relatedTip.category)}
                      </span>
                      <h3 className="care-tip-related-title">{relatedTip.title}</h3>
                      <p className="care-tip-related-excerpt">{relatedTip.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

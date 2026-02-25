import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Eye,
  User,
  BookOpen,
  Leaf,
  Share2,
  ShieldCheck,
  Sprout,
  ArrowRight,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import type { CareTip, CareTipDetailResponse } from "../types/careTip";
import "../styles/careTips.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const FALLBACK_IMAGE = "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp";

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

const categoryAdvice: Record<string, string> = {
  watering: "Check the soil before watering so you treat the plant, not the calendar.",
  fertilizing: "Feed during active growth and slow down when the plant is resting.",
  pest_control: "Inspect leaf undersides and isolate affected plants early for faster recovery.",
  indoor: "Match the plant to the light you actually have, not the light you wish you had.",
  outdoor: "Watch sun exposure and weather changes because outdoor conditions shift quickly.",
  seasonal: "Adjust care with the season so watering, feeding, and growth expectations stay realistic.",
};

const bestForCopy: Record<string, string> = {
  watering: "Homes where overwatering is the most common mistake.",
  fertilizing: "Plant owners who want stronger growth without root stress.",
  pest_control: "Quick action when leaves show bite marks, spots, or webs.",
  indoor: "Rooms with filtered light, window placement, and changing indoor conditions.",
  outdoor: "Balconies, terraces, and sun-exposed plant corners.",
  seasonal: "Nepal homes adapting plant care across spring, monsoon, autumn, and winter.",
};

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const createExcerpt = (tip: CareTip) => {
  if (tip.excerpt?.trim()) {
    return tip.excerpt;
  }

  const plainContent = stripHtml(tip.content);
  return plainContent.length > 180 ? `${plainContent.slice(0, 180)}...` : plainContent;
};

const getReadingMinutes = (tip: CareTip) => {
  const source = `${tip.excerpt || ""} ${stripHtml(tip.content)}`.trim();
  const words = source.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 170));
};

const formatPlainTextToHtml = (value: string) => {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return "<p>No content available yet.</p>";
  }

  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const isList = lines.every((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));

      if (isList) {
        const listType = lines.every((line) => /^\d+\.\s+/.test(line)) ? "ol" : "ul";
        const items = lines
          .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""))
          .map((line) => `<li>${line}</li>`)
          .join("");

        return `<${listType}>${items}</${listType}>`;
      }

      if (lines.length === 1 && /:$/.test(lines[0]) && lines[0].length < 80) {
        return `<h3>${lines[0].slice(0, -1)}</h3>`;
      }

      return `<p>${lines.join("<br />")}</p>`;
    })
    .join("");
};

const getContentHtml = (content: string) => {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  return looksLikeHtml ? content : formatPlainTextToHtml(content);
};

export default function CareTipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tip, setTip] = useState<CareTip | null>(null);
  const [relatedTips, setRelatedTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState("Copy Link");

  useEffect(() => {
    if (id) {
      void fetchCareTip();
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
    } catch (fetchError) {
      console.error("Error fetching care tip:", fetchError);
      setError("Failed to load care tip");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => categoryLabels[category] || category;

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

  const handleShare = async () => {
    const shareTitle = tip?.title || "Care Tip";
    const shareText = tip ? createExcerpt(tip) : "Read this care tip";

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        setShareLabel("Shared");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Link Copied");
      }
    } catch (shareError) {
      console.error("Share failed:", shareError);
      setShareLabel("Try Again");
    } finally {
      window.setTimeout(() => setShareLabel("Copy Link"), 2200);
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

  const leadText = createExcerpt(tip);
  const readMinutes = getReadingMinutes(tip);
  const contentHtml = getContentHtml(tip.content);
  const publishedDate = new Date(tip.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <div className="care-tip-detail-page">
        <div className="care-tips-container">
          <button
            onClick={() => navigate("/care-tips")}
            className="care-tip-detail-back"
          >
            <ArrowLeft size={18} />
            Back to Care Tips
          </button>
        </div>

        <section className="care-tip-detail-hero">
          <div className="care-tips-container">
            <div className="care-tip-detail-hero-shell">
              <div className="care-tip-detail-hero-copy">
                <div className="care-tip-detail-badges">
                  <span className="care-tip-detail-category">
                    {getCategoryLabel(tip.category)}
                  </span>
                  <span className={`care-tip-detail-difficulty ${getDifficultyColor(tip.difficulty)}`}>
                    {difficultyLabels[tip.difficulty]}
                  </span>
                </div>

                <h1 className="care-tip-detail-title">{tip.title}</h1>
                <p className="care-tip-detail-lead">{leadText}</p>

                <div className="care-tip-detail-meta">
                  <span className="care-tip-detail-meta-item">
                    <User size={16} />
                    {tip.author?.name || "Cozy Care Team"}
                  </span>
                  <span className="care-tip-detail-meta-item">
                    <Clock3 size={16} />
                    {publishedDate}
                  </span>
                  <span className="care-tip-detail-meta-item">
                    <Eye size={16} />
                    {tip.views_count.toLocaleString()} views
                  </span>
                </div>

                <div className="care-tip-detail-stat-strip">
                  <div className="care-tip-detail-stat-card">
                    <span>Read Time</span>
                    <strong>{readMinutes} min</strong>
                  </div>
                  <div className="care-tip-detail-stat-card">
                    <span>Difficulty</span>
                    <strong>{difficultyLabels[tip.difficulty]}</strong>
                  </div>
                  <div className="care-tip-detail-stat-card">
                    <span>Best For</span>
                    <strong>{getCategoryLabel(tip.category)}</strong>
                  </div>
                </div>
              </div>

              <div className="care-tip-detail-hero-visual">
                <div className="care-tip-detail-hero-image-frame">
                  <img
                    src={tip.image ? `${API}/storage/${tip.image}` : FALLBACK_IMAGE}
                    alt={tip.title}
                    className="care-tip-detail-image"
                  />
                </div>
                <div className="care-tip-detail-hero-note">
                  <span>Why this guide matters</span>
                  <strong>{bestForCopy[tip.category] || "Practical care for healthier plants."}</strong>
                  <p>
                    {categoryAdvice[tip.category] ||
                      "Use this guide as a practical reference while building better care habits."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="care-tip-detail-content-section">
          <div className="care-tips-container">
            <div className="care-tip-detail-grid">
              <div className="care-tip-detail-main">
                <div className="care-tip-detail-intro-card">
                  <span className="care-tip-detail-intro-label">Quick Summary</span>
                  <p>{leadText}</p>
                </div>

                <article
                  className="care-tip-detail-content"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>

              <aside className="care-tip-detail-sidebar">
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
                    <span className="care-tip-detail-info-label">Read Time</span>
                    <span className="care-tip-detail-info-value">{readMinutes} min</span>
                  </div>
                  <div className="care-tip-detail-info-item">
                    <span className="care-tip-detail-info-label">Views</span>
                    <span className="care-tip-detail-info-value">
                      {tip.views_count.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="care-tip-detail-info-card care-tip-detail-action-card">
                  <h3 className="care-tip-detail-info-title">
                    <ShieldCheck size={18} />
                    Care Action
                  </h3>
                  <p>{categoryAdvice[tip.category] || "Return to this guide whenever your plant shows new changes."}</p>
                  <button className="care-tip-detail-share-btn" onClick={handleShare}>
                    <Share2 size={16} />
                    {shareLabel}
                  </button>
                </div>

                <div className="care-tip-detail-info-card care-tip-detail-cta-card">
                  <h3 className="care-tip-detail-info-title">
                    <Sprout size={18} />
                    Need a diagnosis?
                  </h3>
                  <p>
                    Use the plant health checker if your plant already shows symptoms and
                    you want faster guidance.
                  </p>
                  <button
                    type="button"
                    className="care-tip-detail-cta-btn"
                    onClick={() => navigate("/plant-health-checker")}
                  >
                    Open Health Checker
                    <ArrowRight size={16} />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedTips.length > 0 && (
          <section className="care-tip-detail-related">
            <div className="care-tips-container">
              <div className="care-tip-detail-related-head">
                <h2 className="care-tip-detail-related-title">
                  <BookOpen size={24} />
                  You May Also Like
                </h2>
                <p>More guides from the Cozy Care library to help you build a complete routine.</p>
              </div>

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
                            : FALLBACK_IMAGE
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
                      <p className="care-tip-related-excerpt">
                        {relatedTip.excerpt || createExcerpt(relatedTip)}
                      </p>
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

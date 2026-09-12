import { useNavigate } from "react-router-dom";
import { Search, Shield, Sprout } from "lucide-react";
import { resolveHomepageImage, type HomepageContent } from "../../features/homepage/content";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const highlightIcons = [Sprout, Search, Shield];
type HeroContent = HomepageContent["hero"];
export default function Hero({ content }: { content: HeroContent }) {
  const navigate = useNavigate();
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${resolveHomepageImage(content.background_image, API)})` }}
    >
      <div className="hero-overlay">
        <div className="hero-container">
          <div className="hero-shell">
            <div className="hero-content">
              <span className="hero-badge">{content.badge}</span>
              <h1 className="hero-title">{content.title}</h1>
              <p className="hero-desc">{content.description}</p>
              <div className="hero-actions">
                <button className="hero-btn" onClick={() => navigate(content.primary_cta.path)}>
                  {content.primary_cta.label}
                </button>
                <button className="hero-btn hero-btn-secondary" onClick={() => navigate(content.secondary_cta.path)}>
                  {content.secondary_cta.label}
                </button>
              </div>
              <div className="hero-highlights">
                {content.highlights.map((highlight, index) => {
                  const Icon = highlightIcons[index] ?? Sprout;
                  return (
                    <div className="hero-highlight" key={`${highlight}-${index}`}>
                      <Icon size={16} />
                      <span>{highlight}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <aside className="hero-side-card">
              <span className="hero-side-kicker">{content.side_kicker}</span>
              <h2>{content.side_title}</h2>
              <p>{content.side_description}</p>
              <div className="hero-side-points">
                {content.side_points.map((point, index) => (
                  <div key={`${point.title}-${index}`}>
                    <strong>{point.title}</strong>
                    <span>{point.description}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from "react-router-dom";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

// About page hero - our story starts here
export default function Hero() {
  const navigate = useNavigate();
  const hero = aboutPageTemplate.hero;

  return (
    <section className="about-hero">
      <div className="about-hero-overlay"></div>
      <div className="about-hero-content">
        <h1 className="about-hero-title">{hero.title}</h1>
        <p className="about-hero-subtitle">{hero.subtitle}</p>
        <div className="about-hero-buttons">
          <button
            className="about-btn about-btn-primary"
            onClick={() => navigate(hero.primary_cta.path)}
          >
            {hero.primary_cta.label}
          </button>
          <button
            className="about-btn about-btn-secondary"
            onClick={() => navigate(hero.secondary_cta.path)}
          >
            {hero.secondary_cta.label}
          </button>
        </div>
      </div>
    </section>
  );
}

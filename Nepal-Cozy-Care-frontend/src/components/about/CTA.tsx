import { useNavigate } from "react-router-dom";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

export default function CTA() {
  const navigate = useNavigate();
  const cta = aboutPageTemplate.cta;

  return (
    <section className="about-cta">
      <div className="about-cta-content">
        <h2 className="about-cta-title">{cta.title}</h2>
        <p className="about-cta-subtitle">{cta.subtitle}</p>
        <div className="about-cta-buttons">
          <button
            className="about-cta-btn about-cta-btn-primary"
            onClick={() => navigate(cta.primary_cta.path)}
          >
            {cta.primary_cta.label}
          </button>
          <button
            className="about-cta-btn about-cta-btn-secondary"
            onClick={() => navigate(cta.secondary_cta.path)}
          >
            {cta.secondary_cta.label}
          </button>
        </div>
      </div>
    </section>
  );
}

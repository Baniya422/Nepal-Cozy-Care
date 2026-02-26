import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="about-cta">
      <div className="about-cta-content">
        <h2 className="about-cta-title">Ready to Start Your Plant Journey?</h2>
        <p className="about-cta-subtitle">
          Join thousands of happy customers and bring nature into your home today.
        </p>
        <div className="about-cta-buttons">
          <button className="about-cta-btn about-cta-btn-primary" onClick={() => navigate("/plants")}>
            Shop Plants
          </button>
          <button className="about-cta-btn about-cta-btn-secondary" onClick={() => navigate("/contact")}>
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}

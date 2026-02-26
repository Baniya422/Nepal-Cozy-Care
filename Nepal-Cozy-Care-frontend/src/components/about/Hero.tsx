import { useNavigate } from "react-router-dom";

// About page hero - our story starts here
export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="about-hero">
      <div className="about-hero-overlay"></div>
      <div className="about-hero-content">
        <h1 className="about-hero-title">
          Our Plant Journey
        </h1>
        <p className="about-hero-subtitle">
          Started in 2023 from a small greenhouse in Kathmandu, Nepal Cozy Care 
          began with a simple mission: make plant parenting easy for everyone. 
          Today, we've helped over 5,000 homes bring life to their spaces.
        </p>
        <div className="about-hero-buttons">
          <button 
            className="about-btn about-btn-primary" 
            onClick={() => navigate("/plants")}
          >
            Browse Plants
          </button>
          <button 
            className="about-btn about-btn-secondary" 
            onClick={() => navigate("/contact")}
          >
            Get in Touch
          </button>
        </div>
      </div>
    </section>
  );
}

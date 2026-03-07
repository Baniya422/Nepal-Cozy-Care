import { useNavigate } from "react-router-dom";

// Nepal Cozy Care - bringing nature to Nepali homes since 2023
const HERO_BG = "/images/HomeBackground.png";

export default function Hero() {
  const navigate = useNavigate();

  // Hand-picked plants from our greenhouse in Kathmandu
  return (
    <section 
      className="hero"
      style={{ backgroundImage: `url(${HERO_BG})` }}
    >
      <div className="hero-overlay">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">Fresh From Our Greenhouse</span>
            <h1 className="hero-title">Bring Nature Home</h1>
            <p className="hero-desc">
              Discover hand-picked indoor plants, grown with care in Kathmandu and delivered
              fresh to your doorstep. Create a calm, healthy, and beautiful space with plants
              that thrive in Nepali homes.
            </p>
            <button className="hero-btn" onClick={() => navigate("/plants")}>
              Explore Plants
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

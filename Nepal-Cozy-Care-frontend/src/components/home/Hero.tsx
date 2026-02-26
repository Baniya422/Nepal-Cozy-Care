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
        <div className="hero-content">
          <span className="hero-badge">🌿 Fresh from our greenhouse</span>
          <h1 className="hero-title">
            Bring Nature Home
          </h1>
          <p className="hero-desc">
            Discover our collection of hand-picked indoor plants, perfect for Nepali homes. 
            From low-maintenance succulents to air-purifying greens - we deliver healthy 
            plants right to your doorstep in Kathmandu Valley.
          </p>
          <button className="hero-btn" onClick={() => navigate("/plants")}>
            Explore Plants
          </button>
        </div>
      </div>
    </section>
  );
}

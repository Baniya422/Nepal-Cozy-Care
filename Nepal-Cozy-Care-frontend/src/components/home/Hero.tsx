import { useNavigate } from "react-router-dom";

// Update this path to your hero background image
const HERO_BG_IMAGE = "/images/HomeBackground.png";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section 
      className="hero"
      style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <span className="hero-badge">New Arrival</span>
          <h1 className="hero-title">Buy Our New Plants</h1>
          <p className="hero-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
          </p>
          <button className="hero-btn" onClick={() => navigate("/plants")}>
            BUY NOW
          </button>
        </div>
      </div>
    </section>
  );
}

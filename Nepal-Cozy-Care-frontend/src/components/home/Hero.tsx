import { useNavigate } from "react-router-dom";
import { Search, Shield, Sprout } from "lucide-react";

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
          <div className="hero-shell">
            <div className="hero-content">
              <span className="hero-badge">Fresh From Our Greenhouse</span>
              <h1 className="hero-title">Bring Nature Home</h1>
              <p className="hero-desc">
                Shop healthy indoor plants, discover the right plant for your room, diagnose
                common plant problems, and track care routines after purchase in one system
                built for Nepali homes.
              </p>

              <div className="hero-actions">
                <button className="hero-btn" onClick={() => navigate("/plants")}>
                  Explore Plants
                </button>
                <button className="hero-btn hero-btn-secondary" onClick={() => navigate("/plant-finder")}>
                  Find My Plant
                </button>
              </div>

              <div className="hero-highlights">
                <div className="hero-highlight">
                  <Sprout size={16} />
                  <span>My Garden care tracking</span>
                </div>
                <div className="hero-highlight">
                  <Search size={16} />
                  <span>Plant Finder quiz</span>
                </div>
                <div className="hero-highlight">
                  <Shield size={16} />
                  <span>Plant Health Checker</span>
                </div>
              </div>
            </div>

            <aside className="hero-side-card">
              <span className="hero-side-kicker">Why It Feels Smarter</span>
              <h2>Your plant companion, not just a plant store.</h2>
              <p>
                Cozy Care helps users before and after buying by combining plant shopping,
                guidance tools, and personal care tracking in one experience.
              </p>

              <div className="hero-side-points">
                <div>
                  <strong>Choose better</strong>
                  <span>Use Plant Finder to match plants to your room and lifestyle.</span>
                </div>
                <div>
                  <strong>Solve problems faster</strong>
                  <span>Open the Health Checker when leaves start yellowing or drooping.</span>
                </div>
                <div>
                  <strong>Track care after checkout</strong>
                  <span>Use My Garden for watering, fertilizer reminders, and notes.</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from "react-router-dom";

// Update this path to your garden image
const GARDEN_IMAGE = "/images/our-garden.jpg";

export default function OurGarden() {
  const navigate = useNavigate();

  return (
    <section className="info-section info-section-blue">
      <div className="info-content">
        <div className="info-text">
          <h2 className="info-title">Our Garden</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="info-btn" onClick={() => navigate("/care-tips")}>
            LEARN MORE
          </button>
        </div>
        <div className="info-image">
          <img
            src={GARDEN_IMAGE}
            alt="Our Garden"
            onError={(e) => {
              // Fallback if image doesn't exist
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </section>
  );
}

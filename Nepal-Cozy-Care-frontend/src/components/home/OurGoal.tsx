import { useNavigate } from "react-router-dom";

// Update this path to your goal image
const GOAL_IMAGE = "/images/our-goal.jpg";

export default function OurGoal() {
  const navigate = useNavigate();

  return (
    <section className="info-section info-section-green">
      <div className="info-content">
        <div className="info-text">
          <h2 className="info-title">Our Goal</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="info-btn" onClick={() => navigate("/blogs")}>
            LEARN MORE
          </button>
        </div>
        <div className="info-image">
          <img
            src={GOAL_IMAGE}
            alt="Our Goal"
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

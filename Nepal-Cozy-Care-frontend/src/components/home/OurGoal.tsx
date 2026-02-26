import { useNavigate } from "react-router-dom";

// Our mission image
const GOAL_IMAGE = "/images/our-goal.jpg";

export default function OurGoal() {
  const navigate = useNavigate();

  return (
    <section className="info-section info-section-green">
      <div className="info-content">
        <div className="info-text">
          <h2 className="info-title">Our Mission</h2>
          <p className="info-description">
            We believe every Nepali home deserves a touch of green. Our goal is to make 
            plant parenting accessible to everyone - whether you're a busy professional 
            or a retired gardening enthusiast. Let's grow together!
          </p>
          <button className="info-btn" onClick={() => navigate("/blogs")}>
            Read Our Blog
          </button>
        </div>
        <div className="info-image">
          <img
            src={GOAL_IMAGE}
            alt="Our mission"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </section>
  );
}

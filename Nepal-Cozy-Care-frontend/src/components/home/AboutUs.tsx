import { useNavigate } from "react-router-dom";

// Quick about section for homepage
export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <section className="about-section">
      <h2 className="section-title">About Nepal Cozy Care</h2>
      <p className="about-description">
        We're a Kathmandu-based plant shop passionate about bringing greenery into urban homes. 
        Our team hand-picks each plant from local nurseries, ensuring you get only the healthiest 
        specimens. Plus, we provide lifetime care support - because we're plant parents too!
      </p>
      <button className="info-btn" onClick={() => navigate("/about")}>
        Our Story
      </button>
    </section>
  );
}

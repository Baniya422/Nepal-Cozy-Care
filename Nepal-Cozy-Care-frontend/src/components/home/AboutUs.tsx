import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <section className="about-section">
      <h2 className="section-title">About Us</h2>
      <p className="about-description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <button className="info-btn" onClick={() => navigate("/about")}>
        LEARN MORE
      </button>
    </section>
  );
}

import { useNavigate } from "react-router-dom";
import type { HomepageContent } from "../../features/homepage/content";
export default function AboutUs({ content }: { content: HomepageContent["about"] }) {
  const navigate = useNavigate();
  return (
    <section className="about-section">
      <h2 className="home-section-title">{content.title}</h2>
      <p className="about-description">{content.description}</p>
      <button className="info-btn" onClick={() => navigate(content.button_path)}>
        {content.button_label}
      </button>
    </section>
  );
}

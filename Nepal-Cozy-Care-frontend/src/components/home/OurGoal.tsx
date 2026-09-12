import { useNavigate } from "react-router-dom";
import { resolveHomepageImage, type InfoSectionContent } from "../../features/homepage/content";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
export default function OurGoal({ content }: { content: InfoSectionContent }) {
  const navigate = useNavigate();
  return (
    <section className="info-section info-section-green">
      <div className="info-content">
        <div className="info-text">
          <h2 className="info-title">{content.title}</h2>
          <p className="info-description">{content.description}</p>
          <button className="info-btn" onClick={() => navigate(content.button_path)}>
            {content.button_label}
          </button>
        </div>
        <div className="info-image">
          <img
            src={resolveHomepageImage(content.image, API)}
            alt={content.image_alt}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </section>
  );
}

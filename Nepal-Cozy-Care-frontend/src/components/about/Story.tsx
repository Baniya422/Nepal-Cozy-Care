import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import PageSection from "../layout/PageSection";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

export default function Story() {
  const navigate = useNavigate();
  const story = aboutPageTemplate.story;

  return (
    <PageSection background="white" padding="large">
      <div className="about-story-grid">
        <div className="about-story-content">
          <div className="about-section-label">
            <Leaf size={16} />
            {story.label}
          </div>
          <h2 className="about-story-title">{story.title}</h2>
          {story.paragraphs.map((paragraph, index) => (
            <p key={index} className="about-story-text">
              {paragraph}
            </p>
          ))}
          <button
            className="about-learn-more-btn"
            onClick={() => navigate(story.button.path)}
          >
            {story.button.label}
          </button>
        </div>
        <div className="about-story-image-wrapper">
          <img
            src={story.image}
            alt={story.image_alt}
            className="about-story-image"
          />
          <div className="about-quote-card">
            <p className="about-quote-text">{story.quote_text}</p>
            <p className="about-quote-author">{story.quote_author}</p>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

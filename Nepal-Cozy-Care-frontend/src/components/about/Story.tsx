import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import PageSection from "../layout/PageSection";

export default function Story() {
  const navigate = useNavigate();

  return (
    <PageSection background="white" padding="large">
      <div className="about-story-grid">
        <div className="about-story-content">
          <div className="about-section-label">
            <Leaf size={16} />
            Our Story
          </div>
          <h2 className="about-story-title">Growing Green Dreams Since 2010</h2>
          <p className="about-story-text">
            What started as a small passion project in a backyard greenhouse has blossomed into a 
            thriving business dedicated to bringing the beauty and benefits of plants to homes and 
            offices across the country.
          </p>
          <p className="about-story-text">
            Our founder, Sarah Johnson, began with just 50 plant varieties and a dream to make plant 
            care accessible to everyone. Today, we offer over 500 carefully selected plant species, 
            each chosen for its unique beauty and easy care needs.
          </p>
          <p className="about-story-text">
            We believe that everyone deserves to experience the joy of nurturing plants, and we're 
            here to guide you every step of the way with expert advice, quality products, and a 
            passionate community of plant lovers.
          </p>
          <button className="about-learn-more-btn" onClick={() => navigate("/plants")}>
            Learn More
          </button>
        </div>
        <div className="about-story-image-wrapper">
          <img
            src="/images/about-story.jpg"
            alt="Plant care"
            className="about-story-image"
          />
          <div className="about-quote-card">
            <p className="about-quote-text">
              "We're not just selling plants; we're nurturing a greener, healthier future for everyone."
            </p>
            <p className="about-quote-author">- Sarah Johnson, Founder</p>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

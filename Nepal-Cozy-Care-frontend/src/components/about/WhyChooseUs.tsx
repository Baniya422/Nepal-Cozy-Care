import { CheckCircle, HeadphonesIcon, Leaf, Globe } from "lucide-react";
import PageSection from "../layout/PageSection";

const whyChooseUs = [
  {
    icon: <CheckCircle size={20} />,
    title: "Quality Guarantee",
    description: "Every plant is carefully inspected and comes with a 30-day health guarantee.",
  },
  {
    icon: <HeadphonesIcon size={20} />,
    title: "Expert Support",
    description: "Our team of horticulturists is available to answer all your plant care questions.",
  },
  {
    icon: <Leaf size={20} />,
    title: "Sustainable Practices",
    description: "We use eco-friendly packaging and source from responsible growers.",
  },
  {
    icon: <Globe size={20} />,
    title: "Wide Selection",
    description: "Over 500 varieties of indoor and outdoor plants to suit every space and style.",
  },
];

export default function WhyChooseUs() {
  return (
    <PageSection background="cream" padding="large">
      <div className="about-why-grid">
        <div className="about-why-image-wrapper">
          <img
            src="/images/about-plants.jpg"
            alt="Beautiful plants"
            className="about-why-image"
          />
        </div>
        <div className="about-why-content">
          <h2 className="about-why-title">Why Choose Cozy Care?</h2>
          <div className="about-why-list">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="about-why-item">
                <div className="about-why-icon">{item.icon}</div>
                <div className="about-why-item-content">
                  <h4 className="about-why-item-title">{item.title}</h4>
                  <p className="about-why-item-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageSection>
  );
}

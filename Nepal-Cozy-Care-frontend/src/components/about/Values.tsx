import { Leaf, Heart, Users, Award } from "lucide-react";
import PageSection from "../layout/PageSection";

const coreValues = [
  {
    icon: <Leaf size={28} />,
    title: "Sustainability",
    description: "We're committed to eco-friendly practices and sustainable sourcing for all our plants.",
  },
  {
    icon: <Heart size={28} />,
    title: "Quality Care",
    description: "Every plant receives expert care and attention from propagation to your home.",
  },
  {
    icon: <Users size={28} />,
    title: "Community",
    description: "Building a community of plant lovers who share knowledge and friendship.",
  },
  {
    icon: <Award size={28} />,
    title: "Excellence",
    description: "We strive for excellence in every aspect of our business and plant quality.",
  },
];

export default function Values() {
  return (
    <PageSection background="white" padding="large">
      <div className="section-header">
        <h2>Our Core Values</h2>
        <p>These principles guide everything we do at Cozy Care.</p>
      </div>
      <div className="about-values-grid">
        {coreValues.map((value, index) => (
          <div key={index} className="about-value-card">
            <div className="about-value-icon">{value.icon}</div>
            <h3 className="about-value-title">{value.title}</h3>
            <p className="about-value-description">{value.description}</p>
          </div>
        ))}
      </div>
    </PageSection>
  );
}

import { Leaf, Globe } from "lucide-react";
import PageSection from "../layout/PageSection";

export default function Mission() {
  return (
    <PageSection background="cream" padding="large">
      <div className="section-header">
        <h2>Our Mission & Vision</h2>
        <p>We're committed to making the world greener, one plant at a time.</p>
      </div>
      <div className="about-mission-grid">
        <div className="about-mission-card">
          <div className="about-mission-icon">
            <Leaf size={32} />
          </div>
          <h3 className="about-mission-title">Our Mission</h3>
          <p className="about-mission-text">
            To inspire and empower people to connect with nature by providing high-quality plants, 
            expert guidance, and sustainable practices that make plant ownership a joyful, accessible, 
            enjoyable, and rewarding for everybody, from beginners to experienced gardeners.
          </p>
        </div>
        <div className="about-mission-card">
          <div className="about-mission-icon">
            <Globe size={32} />
          </div>
          <h3 className="about-mission-title">Our Vision</h3>
          <p className="about-mission-text">
            To become the leading platform for plant enthusiasts worldwide, fostering a global 
            community where people learn, share, and grow together. We envision a future where 
            every home and workspace is enhanced with living plants, contributing to healthier 
            environments and happier lives.
          </p>
        </div>
      </div>
    </PageSection>
  );
}

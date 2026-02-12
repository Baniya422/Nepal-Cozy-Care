import { useNavigate } from "react-router-dom";
import { Leaf, Heart, Users, Award, CheckCircle, HeadphonesIcon, Truck, Globe } from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/about.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function About() {
  const navigate = useNavigate();

  const stats = [
    { value: "10,000+", label: "Happy Customers" },
    { value: "500+", label: "Plant Varieties" },
    { value: "15", label: "Years Experience" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

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

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Plant enthusiast with 15+ years of experience in horticulture.",
      image: "/images/team-sarah.jpg",
    },
    {
      name: "Michael Chen",
      role: "Head of Operations",
      bio: "Expert in supply chain and nursery management.",
      image: "/images/team-michael.jpg",
    },
    {
      name: "Emily Rodriguez",
      role: "Plant Care Specialist",
      bio: "Botanist passionate about helping plants thrive in any environment.",
      image: "/images/team-emily.jpg",
    },
    {
      name: "David Thompson",
      role: "Customer Experience",
      bio: "Dedicated to ensuring every customer finds their perfect plant.",
      image: "/images/team-david.jpg",
    },
  ];

  return (
    <Layout>
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-overlay"></div>
          <div className="about-hero-content">
            <h1 className="about-hero-title">About Cozy Care</h1>
            <p className="about-hero-subtitle">
              Bringing nature into your home with carefully curated plants and expert care guidance
            </p>
            <div className="about-hero-buttons">
              <button className="about-btn about-btn-primary" onClick={() => navigate("/plants")}>
                Our Story
              </button>
              <button className="about-btn about-btn-secondary" onClick={() => navigate("/contact")}>
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats">
          <div className="about-container">
            <div className="about-stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="about-stat-item">
                  <div className="about-stat-value">{stat.value}</div>
                  <div className="about-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="about-story">
          <div className="about-container">
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
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="about-mission">
          <div className="about-container">
            <h2 className="about-section-title">Our Mission & Vision</h2>
            <p className="about-section-subtitle">We're committed to making the world greener, one plant at a time.</p>
            
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
          </div>
        </section>

        {/* Core Values Section */}
        <section className="about-values">
          <div className="about-container">
            <h2 className="about-section-title">Our Core Values</h2>
            <p className="about-section-subtitle">These principles guide everything we do at Cozy Care.</p>
            
            <div className="about-values-grid">
              {coreValues.map((value, index) => (
                <div key={index} className="about-value-card">
                  <div className="about-value-icon">{value.icon}</div>
                  <h3 className="about-value-title">{value.title}</h3>
                  <p className="about-value-description">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="about-why">
          <div className="about-container">
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
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <div className="about-container">
            <h2 className="about-section-title">Meet Our Team</h2>
            <p className="about-section-subtitle">The passionate people behind Cozy Care who make it all possible.</p>
            
            <div className="about-team-grid">
              {team.map((member, index) => (
                <div key={index} className="about-team-card">
                  <div className="about-team-image-wrapper">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="about-team-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/team-placeholder.jpg";
                      }}
                    />
                  </div>
                  <h3 className="about-team-name">{member.name}</h3>
                  <p className="about-team-role">{member.role}</p>
                  <p className="about-team-bio">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="about-cta-content">
            <h2 className="about-cta-title">Ready to Start Your Plant Journey?</h2>
            <p className="about-cta-subtitle">
              Join thousands of happy customers and bring nature into your home today.
            </p>
            <div className="about-cta-buttons">
              <button className="about-cta-btn about-cta-btn-primary" onClick={() => navigate("/plants")}>
                Shop Plants
              </button>
              <button className="about-cta-btn about-cta-btn-secondary" onClick={() => navigate("/contact")}>
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

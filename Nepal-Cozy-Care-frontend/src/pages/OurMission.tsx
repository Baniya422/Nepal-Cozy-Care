import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";
import "../styles/our-mission.css";

const missionPillars = [
  {
    title: "Care Education",
    description:
      "Teach practical plant care in simple language so beginners and enthusiasts can grow with confidence.",
  },
  {
    title: "Healthy Homes",
    description:
      "Help more families create greener, healthier spaces with the right plants and care routines.",
  },
  {
    title: "Responsible Growth",
    description:
      "Promote mindful shopping and better long-term care so plants thrive instead of being replaced.",
  },
];

const impactGoals = [
  "Guided care journeys for first-time plant parents",
  "Reliable product recommendations based on lifestyle",
  "Seasonal tips tailored for local conditions",
  "A friendly support experience from browsing to delivery",
];

export default function OurMission() {
  return (
    <Layout>
      <div className="mission-page">
        <section className="mission-hero">
          <p className="mission-eyebrow">Our Purpose</p>
          <h1>Growing Better Plant Habits, One Home at a Time</h1>
          <p className="mission-lead">
            Cozy Care exists to make plant parenting simple, rewarding, and sustainable.
            We combine care knowledge, thoughtful products, and everyday support so anyone
            can build a thriving indoor garden.
          </p>
          <div className="mission-hero-actions">
            <Link to="/plants" className="mission-btn mission-btn-primary">
              Explore Plants
            </Link>
            <Link to="/care-tips" className="mission-btn mission-btn-secondary">
              Read Care Tips
            </Link>
          </div>
        </section>

        <section className="mission-image-section" aria-label="Mission image">
          <div className="mission-image-placeholder">
            <p>Add your mission image here</p>
            <span>
              Suggested path: public/images/mission-hero.jpg
            </span>
          </div>
        </section>

        <section className="mission-pillar-section">
          <h2>What Drives Us</h2>
          <div className="mission-pillars-grid">
            {missionPillars.map((pillar) => (
              <article className="mission-pillar-card" key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-vision-section">
          <div className="mission-vision-card">
            <h2>Our Vision</h2>
            <p>
              We envision a future where caring for plants becomes part of daily wellness.
              A home where greenery is accessible to everyone, and people feel confident
              nurturing what they grow.
            </p>
          </div>
          <div className="mission-impact-card">
            <h2>How We Measure Impact</h2>
            <ul>
              {impactGoals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}

import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";
import "../styles/our-mission.css";

const heroHighlights = [
  {
    label: "Beginner-first guidance",
    value: "Simple care advice",
  },
  {
    label: "Thoughtful shopping",
    value: "Plants that fit real homes",
  },
  {
    label: "Long-term support",
    value: "Tips that continue after checkout",
  },
];

const missionPillars = [
  {
    eyebrow: "Learn",
    title: "Care Education",
    description:
      "Teach practical plant care in simple language so beginners and enthusiasts can grow with confidence.",
  },
  {
    eyebrow: "Live Better",
    title: "Healthy Homes",
    description:
      "Help more families create greener, healthier spaces with the right plants, routines, and support.",
  },
  {
    eyebrow: "Choose Wisely",
    title: "Responsible Growth",
    description:
      "Promote mindful shopping and better long-term care so plants thrive instead of being replaced.",
  },
];

const supportSteps = [
  {
    step: "01",
    title: "Discover plants that fit your lifestyle",
    description:
      "We want customers to choose plants based on light, time, and space, not only appearance.",
  },
  {
    step: "02",
    title: "Get clear help before problems grow",
    description:
      "Care tips, product guidance, and practical advice should be easy to understand and easy to use.",
  },
  {
    step: "03",
    title: "Build routines that last",
    description:
      "Our goal is not one good delivery. It is helping people keep their plants healthy long after purchase.",
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
          <div className="mission-hero-copy">
            <p className="mission-eyebrow">Our Purpose</p>
            <h1>Growing Better Plant Habits, One Home at a Time</h1>
            <p className="mission-lead">
              Cozy Care exists to make plant parenting simple, rewarding, and sustainable.
              We combine care knowledge, thoughtful products, and everyday support so anyone
              can build a thriving indoor garden without feeling overwhelmed.
            </p>
            <div className="mission-hero-actions">
              <Link to="/plants" className="mission-btn mission-btn-primary">
                Explore Plants
              </Link>
              <Link to="/care-tips" className="mission-btn mission-btn-secondary">
                Read Care Tips
              </Link>
            </div>

            <div className="mission-highlight-grid">
              {heroHighlights.map((item) => (
                <article className="mission-highlight-card" key={item.label}>
                  <span className="mission-highlight-label">{item.label}</span>
                  <strong className="mission-highlight-value">{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="mission-hero-visual">
            <div className="mission-image-frame">
              <img
                src="/images/mission-hero.jpg"
                alt="Indoor plants arranged in a calm, cozy home setting"
                className="mission-hero-image"
              />
              <div className="mission-floating-note mission-floating-note-top">
                Plant care should feel calm, not confusing.
              </div>
              <div className="mission-floating-note mission-floating-note-bottom">
                Designed for real homes, real routines, and long-term care.
              </div>
            </div>
          </div>
        </section>

        <section className="mission-story-section">
          <div className="mission-story-card">
            <p className="mission-section-kicker">Why We Built Cozy Care</p>
            <h2>We are designing a friendlier plant experience from the start.</h2>
            <p>
              Many people love the idea of plants but feel unsure once they bring one home.
              Our mission is to remove that friction through better guidance, better product
              choices, and a more supportive journey after someone buys.
            </p>
            <ul className="mission-story-list">
              <li>Less guesswork when choosing plants</li>
              <li>More confidence in everyday care</li>
              <li>Support that continues beyond checkout</li>
            </ul>
          </div>

          <aside className="mission-quote-card">
            <p className="mission-quote-mark">"</p>
            <p className="mission-quote-text">
              A plant should feel like a long-term companion, not a short-term risk.
            </p>
            <span className="mission-quote-caption">The Cozy Care approach</span>
          </aside>
        </section>

        <section className="mission-pillar-section">
          <div className="mission-section-heading">
            <p className="mission-section-kicker">What Drives Us</p>
            <h2>The principles behind every recommendation we make</h2>
          </div>

          <div className="mission-pillars-grid">
            {missionPillars.map((pillar) => (
              <article className="mission-pillar-card" key={pillar.title}>
                <span className="mission-pillar-eyebrow">{pillar.eyebrow}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-support-section">
          <div className="mission-section-heading">
            <p className="mission-section-kicker">How We Deliver It</p>
            <h2>A clearer journey for plant parents at every stage</h2>
          </div>

          <div className="mission-support-grid">
            {supportSteps.map((step) => (
              <article className="mission-support-card" key={step.step}>
                <span className="mission-support-step">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-vision-section">
          <div className="mission-vision-card">
            <p className="mission-section-kicker">Our Vision</p>
            <h2>Make greenery feel accessible, personal, and lasting.</h2>
            <p>
              We envision a future where caring for plants becomes part of daily wellness.
              A home where greenery is accessible to everyone, and people feel confident
              nurturing what they grow.
            </p>
          </div>

          <div className="mission-impact-card">
            <p className="mission-section-kicker">How We Measure Impact</p>
            <h2>We care about outcomes, not just orders.</h2>
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

import { ScanSearch, Sparkles } from "lucide-react";

export default function PlantHealthHero() {
  return (
    <section className="plant-health-hero">
      <div className="plant-health-container">
        <div className="plant-health-hero-shell">
          <div className="plant-health-hero-copy">
            <span className="plant-health-hero-eyebrow">Smart Plant Diagnosis</span>
            <div className="plant-health-hero-icon">
              <Sparkles size={42} />
            </div>
            <h1 className="plant-health-hero-title">Plant Health Checker</h1>
            <p className="plant-health-hero-subtitle">
              Diagnose plant problems with symptom selection plus room, season, and soil
              context so the result feels more like a guided care assistant.
            </p>

            <div className="plant-health-hero-highlights">
              <span>Multi-symptom analysis</span>
              <span>Season-aware suggestions</span>
              <span>Care tips + next actions</span>
            </div>
          </div>

          <aside className="plant-health-hero-card">
            <h2 className="plant-health-hero-card-title">
              <ScanSearch size={20} />
              How this checker works
            </h2>
            <ul className="plant-health-hero-card-list">
              <li>Choose your plant type and room conditions first.</li>
              <li>Select all symptoms that match what you see right now.</li>
              <li>Get a primary diagnosis, alternatives, and immediate actions.</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

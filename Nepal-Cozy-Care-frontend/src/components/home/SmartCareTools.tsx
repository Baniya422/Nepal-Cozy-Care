import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Shield, Sprout } from "lucide-react";

const tools = [
  {
    title: "Plant Finder",
    description:
      "Match plants to sunlight, room type, and care confidence before you buy.",
    action: "Find My Plant",
    path: "/plant-finder",
    icon: Search,
  },
  {
    title: "Plant Health Checker",
    description:
      "Check symptoms like yellow leaves or pests and get quick care guidance.",
    action: "Diagnose Issues",
    path: "/plant-health-checker",
    icon: Shield,
  },
  {
    title: "My Garden Dashboard",
    description:
      "Track watering, fertilizer routines, and personal notes after purchase.",
    action: "Open My Garden",
    path: "/my-garden",
    icon: Sprout,
  },
];

export default function SmartCareTools() {
  const navigate = useNavigate();

  return (
    <section className="smart-tools-section">
      <div className="smart-tools-container">
        <div className="smart-tools-head">
          <span className="smart-tools-kicker">Smart Plant Care</span>
          <h2 className="smart-tools-title">More than shopping. A complete plant care system.</h2>
          <p className="smart-tools-description">
            These tools make your project stand out because users can discover, diagnose,
            and care for plants in one place.
          </p>
        </div>

        <div className="smart-tools-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <article key={tool.title} className="smart-tool-card">
                <div className="smart-tool-icon">
                  <Icon size={24} />
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <button
                  type="button"
                  className="smart-tool-btn"
                  onClick={() => navigate(tool.path)}
                >
                  {tool.action}
                  <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

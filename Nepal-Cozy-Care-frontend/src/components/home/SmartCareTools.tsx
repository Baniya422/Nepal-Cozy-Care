import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Shield, Sprout } from "lucide-react";
import type { HomepageContent } from "../../features/homepage/content";
const icons = [Search, Shield, Sprout];
export default function SmartCareTools({ content }: { content: HomepageContent["smart_tools"] }) {
  const navigate = useNavigate();
  return (
    <section className="smart-tools-section">
      <div className="smart-tools-container">
        <div className="smart-tools-head">
          <span className="smart-tools-kicker">{content.kicker}</span>
          <h2 className="smart-tools-title">{content.title}</h2>
          <p className="smart-tools-description">{content.description}</p>
        </div>
        <div className="smart-tools-grid">
          {content.items.map((tool, index) => {
            const Icon = icons[index] ?? Sprout;
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

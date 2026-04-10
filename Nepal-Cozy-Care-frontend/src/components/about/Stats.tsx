import PageSection from "../layout/PageSection";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

export default function Stats() {
  const stats = aboutPageTemplate.stats;

  return (
    <PageSection background="cream" padding="small">
      <div className="about-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="about-stat-item">
            <div className="about-stat-value">{stat.value}</div>
            <div className="about-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}

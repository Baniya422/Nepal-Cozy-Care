import { Leaf, Globe } from "lucide-react";
import PageSection from "../layout/PageSection";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

const missionIconMap = {
  Leaf,
  Globe,
} as const;

const getMissionIcon = (icon?: string) =>
  missionIconMap[icon as keyof typeof missionIconMap] ?? Leaf;

export default function Mission() {
  const mission = aboutPageTemplate.mission;

  return (
    <PageSection background="cream" padding="large">
      <div className="section-header">
        <h2>{mission.title}</h2>
        <p>{mission.subtitle}</p>
      </div>
      <div className="about-mission-grid">
        {mission.cards.map((card) => {
          const Icon = getMissionIcon(card.icon);

          return (
            <div className="about-mission-card" key={card.title}>
              <div className="about-mission-icon">
                <Icon size={32} />
              </div>
              <h3 className="about-mission-title">{card.title}</h3>
              <p className="about-mission-text">{card.text}</p>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}

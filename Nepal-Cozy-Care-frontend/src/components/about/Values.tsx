import { Leaf, Heart, Users, Award } from "lucide-react";
import PageSection from "../layout/PageSection";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

const valueIconMap = {
  Leaf,
  Heart,
  Users,
  Award,
} as const;

const getValueIcon = (icon?: string) =>
  valueIconMap[icon as keyof typeof valueIconMap] ?? Leaf;

export default function Values() {
  const values = aboutPageTemplate.values;

  return (
    <PageSection background="white" padding="large">
      <div className="section-header">
        <h2>{values.title}</h2>
        <p>{values.subtitle}</p>
      </div>
      <div className="about-values-grid">
        {values.items.map((value) => {
          const Icon = getValueIcon(value.icon);

          return (
            <div key={value.title} className="about-value-card">
              <div className="about-value-icon">
                <Icon size={28} />
              </div>
              <h3 className="about-value-title">{value.title}</h3>
              <p className="about-value-description">{value.description}</p>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}

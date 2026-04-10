import PageSection from "../layout/PageSection";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

export default function Team() {
  const team = aboutPageTemplate.team;

  return (
    <PageSection background="white" padding="large">
      <div className="section-header">
        <h2>{team.title}</h2>
        <p>{team.subtitle}</p>
      </div>
      <div className="about-team-grid">
        {team.members.map((member) => (
          <div key={member.name} className="about-team-card">
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
    </PageSection>
  );
}

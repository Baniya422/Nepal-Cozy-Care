import PageSection from "../layout/PageSection";

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

export default function Team() {
  return (
    <PageSection background="white" padding="large">
      <div className="section-header">
        <h2>Meet Our Team</h2>
        <p>The passionate people behind Cozy Care who make it all possible.</p>
      </div>
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
    </PageSection>
  );
}

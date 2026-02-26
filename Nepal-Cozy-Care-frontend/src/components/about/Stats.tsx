import PageSection from "../layout/PageSection";

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+", label: "Plant Varieties" },
  { value: "15", label: "Years Experience" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function Stats() {
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

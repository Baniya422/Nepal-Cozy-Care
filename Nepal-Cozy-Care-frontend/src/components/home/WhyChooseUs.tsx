import { PackageCheck, ShieldCheck, Sprout, Stethoscope, Truck, HeartHandshake, Leaf, Award } from "lucide-react";
import type { WhyUsContent } from "../../features/homepage/storefront";

interface WhyChooseUsProps {
  content?: WhyUsContent;
}

const iconMap: Record<string, typeof PackageCheck> = {
  PackageCheck,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Truck,
  HeartHandshake,
  Leaf,
  Award,
};

export default function WhyChooseUs({ content }: WhyChooseUsProps) {
  const items = content?.items && content.items.length > 0 ? content.items : [
    {
      icon: "PackageCheck",
      title: "Transit-Safe Packaging",
      description: "Specially engineered breathable pods keep soil secure and foliage pristine on arrival.",
    },
    {
      icon: "ShieldCheck",
      title: "7-Day Transit Guarantee",
      description: "Instant, hassle-free replacement if your plant arrives stressed, damaged, or unhappy.",
    },
    {
      icon: "Sprout",
      title: "Valley-Acclimated Plants",
      description: "Nurtured in our local Kathmandu greenhouses so they effortlessly adapt to your room climate.",
    },
    {
      icon: "Stethoscope",
      title: "Free Plant Doctor Advice",
      description: "Lifetime WhatsApp & AI care guidance from certified horticulturists whenever you need help.",
    },
  ];

  return (
    <section className="sf-why-us-section" aria-label="Why Nepal Cozy Care">
      <div className="sf-container">
        <div className="sf-section-header-center">
          <span className="sf-badge-pill">
            <Leaf size={14} />
            <span>The Cozy Care Guarantee</span>
          </span>
          <h2 className="sf-main-heading">{content?.title || "The Nepal Cozy Care Experience"}</h2>
          <p className="sf-sub-heading">
            {content?.subtitle || "Why thousands of urban plant parents across Nepal trust our greenhouse to their homes."}
          </p>
        </div>

        <div className="sf-why-us-grid">
          {items.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Sprout;
            return (
              <div key={idx} className="sf-why-card">
                <div className="sf-why-icon-wrap">
                  <IconComponent size={28} />
                </div>
                <div className="sf-why-content">
                  <h3 className="sf-why-title">{item.title}</h3>
                  <p className="sf-why-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

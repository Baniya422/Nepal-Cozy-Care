import { CheckCircle, HeadphonesIcon, Leaf, Globe } from "lucide-react";
import PageSection from "../layout/PageSection";
import { aboutPageTemplate } from "../../features/content/aboutTemplate";

const whyChooseUsIconMap = {
  CheckCircle,
  HeadphonesIcon,
  Leaf,
  Globe,
} as const;

const getWhyChooseIcon = (icon?: string) =>
  whyChooseUsIconMap[icon as keyof typeof whyChooseUsIconMap] ?? CheckCircle;

export default function WhyChooseUs() {
  const whyChooseUs = aboutPageTemplate.why_choose_us;

  return (
    <PageSection background="cream" padding="large">
      <div className="about-why-grid">
        <div className="about-why-image-wrapper">
          <img
            src={whyChooseUs.image}
            alt={whyChooseUs.image_alt}
            className="about-why-image"
          />
        </div>
        <div className="about-why-content">
          <h2 className="about-why-title">{whyChooseUs.title}</h2>
          <div className="about-why-list">
            {whyChooseUs.items.map((item) => {
              const Icon = getWhyChooseIcon(item.icon);

              return (
                <div key={item.title} className="about-why-item">
                  <div className="about-why-icon">
                    <Icon size={20} />
                  </div>
                  <div className="about-why-item-content">
                    <h4 className="about-why-item-title">{item.title}</h4>
                    <p className="about-why-item-description">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageSection>
  );
}

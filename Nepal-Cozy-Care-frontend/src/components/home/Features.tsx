import { Shield, Headphones, Truck } from "lucide-react";
import type { TextCardContent } from "../../features/homepage/content";
const icons = [Shield, Headphones, Truck];
export default function Features({ items }: { items: TextCardContent[] }) {
  return (
    <section className="features">
      <div className="features-inner">
        {items.map((item, index) => {
          const Icon = icons[index] ?? Shield;
          return (
            <div className="feature" key={`${item.title}-${index}`}>
              <Icon size={32} className="feature-icon" />
              <div className="feature-text">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

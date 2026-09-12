import { Package, Truck, Clock } from "lucide-react";
import { resolvePageImage, type ShippingPageContent } from "../../features/page-content/templates";
const icons = [Package, Truck, Clock];
export default function WhyChooseUs({ content }: { content: ShippingPageContent["benefits"] }) {
  return (
    <section className="shipping-section">
      <div className="shipping-container">
        <div className="shipping-content-left">
          <h2 className="shipping-section-title">{content.title}</h2>
          <div className="shipping-benefits">
            {content.items.map((item, index) => {
              const Icon = icons[index] ?? Package;
              return (
                <div className="shipping-benefit-item" key={`${item.title}-${index}`}>
                  <div className="shipping-benefit-icon"><Icon size={24} /></div>
                  <div>
                    <h3 className="shipping-benefit-title">{item.title}</h3>
                    <p className="shipping-benefit-text">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="shipping-image-right">
          <img src={resolvePageImage(content.image)} alt={content.image_alt} />
        </div>
      </div>
    </section>
  );
}

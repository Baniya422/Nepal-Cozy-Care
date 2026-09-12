import { CheckCircle } from "lucide-react";
import { resolvePageImage, type ShippingPageContent } from "../../features/page-content/templates";
export default function OurServices({ content }: { content: ShippingPageContent["delivery"] }) {
  return (
    <section className="shipping-section shipping-section-alt" id="delivery-options">
      <div className="shipping-container">
        <div className="shipping-image-left">
          <img src={resolvePageImage(content.image)} alt={content.image_alt} />
        </div>
        <div className="shipping-content-right">
          <h2 className="shipping-section-title">{content.title}</h2>
          <div className="shipping-features">
            {content.options.map((option, index) => (
              <div className="shipping-feature-item" key={`${option.title}-${index}`}>
                <CheckCircle className="shipping-feature-icon" />
                <div>
                  <h3 className="shipping-feature-title">{option.title}</h3>
                  <p className="shipping-feature-text">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

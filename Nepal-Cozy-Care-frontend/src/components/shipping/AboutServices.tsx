import { useNavigate } from "react-router-dom";
import { resolvePageImage, type ShippingPageContent } from "../../features/page-content/templates";
export default function AboutServices({ content }: { content: ShippingPageContent["about"] }) {
  const navigate = useNavigate();
  return (
    <section className="shipping-section">
      {}
      <div className="shipping-container">
        <div className="shipping-content-left">
          <h2 className="shipping-section-title">{content.title}</h2>
          <p className="shipping-section-text">{content.description}</p>
          <button className="shipping-read-more" onClick={() => navigate(content.button_path)}>{content.button_label}</button>
        </div>
        <div className="shipping-image-right">
          <img src={resolvePageImage(content.image)} alt={content.image_alt} />
        </div>
      </div>
    </section>
  );
}

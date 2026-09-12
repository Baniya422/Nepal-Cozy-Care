import { useNavigate } from "react-router-dom";
import { resolvePageImage, type ShippingPageContent } from "../../features/page-content/templates";
export default function Hero({ content }: { content: ShippingPageContent["hero"] }) {
  const navigate = useNavigate();
  return (
    <section
      className="shipping-hero"
      style={{ backgroundImage: `url('${resolvePageImage(content.background_image)}')` }}
    >
      {}
      <div className="shipping-hero-overlay">
        <div className="shipping-hero-content">
          <h1 className="shipping-hero-title">
            {content.title_lines.map((line, index) => <span key={`${line}-${index}`}>{line}{index < content.title_lines.length - 1 ? <br /> : null}</span>)}
          </h1>
          <button className="shipping-hero-btn" onClick={() => navigate(content.button_path)}>{content.button_label}</button>
        </div>
      </div>
    </section>
  );
}

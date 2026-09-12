import { resolvePageImage, type ShippingPageContent } from "../../features/page-content/templates";

export default function Testimonials({ content }: { content?: ShippingPageContent["testimonials"] }) {
  const title = content?.title || "What Our Customer Say";
  const items = content?.items && content.items.length > 0 ? content.items : [
    {
      name: "John Doe",
      role: "Customer",
      rating: 5,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
      image: "/images/team-emily.jpg",
      image_alt: "Customer John Doe",
      featured: false,
    },
    {
      name: "Jane Smith",
      role: "Customer",
      rating: 5,
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Exceptional service and very professional team.",
      image: "/images/team-sarah.jpg",
      image_alt: "Customer Jane Smith",
      featured: true,
    },
  ];

  return (
    <section className="shipping-testimonials">
      <div className="shipping-testimonials-container">
        <h2 className="shipping-testimonials-title">{title}</h2>
        <div className="shipping-testimonials-grid">
          {items.map((item, index) => (
            <div
              key={index}
              className={`shipping-testimonial-card${item.featured ? " shipping-testimonial-featured" : ""}`}
            >
              <div className="shipping-testimonial-header">
                <img
                  src={resolvePageImage(item.image)}
                  alt={item.image_alt || item.name}
                  className="shipping-testimonial-avatar"
                />
                <div>
                  <h4 className="shipping-testimonial-name">{item.name}</h4>
                  <p className="shipping-testimonial-role">{item.role}</p>
                </div>
              </div>
              <div className="shipping-testimonial-rating">
                {"★".repeat(Math.max(1, Math.min(5, item.rating || 5)))}
              </div>
              <p className="shipping-testimonial-text">{item.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

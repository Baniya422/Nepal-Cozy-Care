export default function AboutServices() {
  return (
    <section className="shipping-section">
      <div className="shipping-container">
        <div className="shipping-content-left">
          <h2 className="shipping-section-title">How We Deliver</h2>
          <p className="shipping-section-text">
            We understand how precious your plants are. That's why we've developed 
            a specialized packaging system using eco-friendly materials that protect 
            your green friends during transit. Every plant is carefully secured, 
            watered, and packed with love before leaving our greenhouse.
          </p>
          <button className="shipping-read-more">Our Packaging</button>
        </div>
        <div className="shipping-image-right">
          <img src="/images/plant-box.jpg" alt="Secure plant packaging" />
        </div>
      </div>
    </section>
  );
}

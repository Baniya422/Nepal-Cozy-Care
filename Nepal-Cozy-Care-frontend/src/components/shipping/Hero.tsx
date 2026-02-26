export default function Hero() {
  return (
    <section 
      className="shipping-hero"
      style={{ backgroundImage: `url('/images/shipping-hero.jpg')` }}
    >
      <div className="shipping-hero-overlay">
        <div className="shipping-hero-content">
          <h1 className="shipping-hero-title">Welcome to<br />Delivery and<br />Shipping Services</h1>
          <button className="shipping-hero-btn">Read more</button>
        </div>
      </div>
    </section>
  );
}

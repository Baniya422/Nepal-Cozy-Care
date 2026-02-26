import { Package, Truck, Clock } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section className="shipping-section">
      <div className="shipping-container">
        <div className="shipping-content-left">
          <h2 className="shipping-section-title">Why Choose Us</h2>
          <div className="shipping-benefits">
            <div className="shipping-benefit-item">
              <div className="shipping-benefit-icon">
                <Package size={24} />
              </div>
              <div>
                <h3 className="shipping-benefit-title">Safe Package</h3>
                <p className="shipping-benefit-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="shipping-benefit-item">
              <div className="shipping-benefit-icon">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="shipping-benefit-title">Fast Delivery</h3>
                <p className="shipping-benefit-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="shipping-benefit-item">
              <div className="shipping-benefit-icon">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="shipping-benefit-title">24/7 Support</h3>
                <p className="shipping-benefit-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="shipping-image-right">
          <img src="/images/package-delivery.jpg" alt="Package delivery" />
        </div>
      </div>
    </section>
  );
}

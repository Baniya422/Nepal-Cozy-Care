import { CheckCircle } from "lucide-react";

export default function OurServices() {
  return (
    <section className="shipping-section shipping-section-alt">
      <div className="shipping-container">
        <div className="shipping-image-left">
          <img src="/images/delivery-person.jpg" alt="Our delivery team" />
        </div>
        <div className="shipping-content-right">
          <h2 className="shipping-section-title">Delivery Options</h2>
          <div className="shipping-features">
            <div className="shipping-feature-item">
              <CheckCircle className="shipping-feature-icon" />
              <div>
                <h3 className="shipping-feature-title">Same-Day Delivery</h3>
                <p className="shipping-feature-text">
                  Order before 2 PM and get your plants delivered the same day 
                  within Kathmandu city limits.
                </p>
              </div>
            </div>
            <div className="shipping-feature-item">
              <CheckCircle className="shipping-feature-icon" />
              <div>
                <h3 className="shipping-feature-title">Valley-Wide Shipping</h3>
                <p className="shipping-feature-text">
                  We deliver to Lalitpur, Bhaktapur, and surrounding areas 
                  within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

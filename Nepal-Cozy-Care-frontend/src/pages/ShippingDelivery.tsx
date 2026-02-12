import Layout from "../components/layout/Layout";
import "../styles/shipping.css";
import { Package, Truck, Clock, CheckCircle } from "lucide-react";

export default function ShippingDelivery() {
  return (
    <Layout>
      {/* Hero Section */}
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

      {/* About Our Services Section */}
      <section className="shipping-section">
        <div className="shipping-container">
          <div className="shipping-content-left">
            <h2 className="shipping-section-title">About Our Services</h2>
            <p className="shipping-section-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, 
              luctus nec ullamcorper mattis, pulvinar dapibus leo. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices 
              gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.
            </p>
            <button className="shipping-read-more">Read more</button>
          </div>
          <div className="shipping-image-right">
            <img src="/images/plant-box.jpg" alt="Plant in box" />
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="shipping-section shipping-section-alt">
        <div className="shipping-container">
          <div className="shipping-image-left">
            <img src="/images/delivery-person.jpg" alt="Delivery service" />
          </div>
          <div className="shipping-content-right">
            <h2 className="shipping-section-title">Our Services</h2>
            <div className="shipping-features">
              <div className="shipping-feature-item">
                <CheckCircle className="shipping-feature-icon" />
                <div>
                  <h3 className="shipping-feature-title">On-demand packages</h3>
                  <p className="shipping-feature-text">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              <div className="shipping-feature-item">
                <CheckCircle className="shipping-feature-icon" />
                <div>
                  <h3 className="shipping-feature-title">Scheduled packages</h3>
                  <p className="shipping-feature-text">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
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

      {/* Customer Testimonials Section */}
      <section className="shipping-testimonials">
        <div className="shipping-testimonials-container">
          <h2 className="shipping-testimonials-title">What Our Customer Say</h2>
          <div className="shipping-testimonials-grid">
            {/* Testimonial 1 */}
            <div className="shipping-testimonial-card">
              <div className="shipping-testimonial-header">
                <img 
                  src="/images/customer1.jpg" 
                  alt="Customer" 
                  className="shipping-testimonial-avatar"
                />
                <div>
                  <h4 className="shipping-testimonial-name">John Doe</h4>
                  <p className="shipping-testimonial-role">Customer</p>
                </div>
              </div>
              <div className="shipping-testimonial-rating">
                ★★★★★
              </div>
              <p className="shipping-testimonial-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, 
                luctus nec ullamcorper mattis, pulvinar dapibus leo.
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="shipping-testimonial-card shipping-testimonial-featured">
              <div className="shipping-testimonial-header">
                <img 
                  src="/images/customer2.jpg" 
                  alt="Customer" 
                  className="shipping-testimonial-avatar"
                />
                <div>
                  <h4 className="shipping-testimonial-name">Jane Smith</h4>
                  <p className="shipping-testimonial-role">Customer</p>
                </div>
              </div>
              <div className="shipping-testimonial-rating">
                ★★★★★
              </div>
              <p className="shipping-testimonial-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, 
                luctus nec ullamcorper mattis, pulvinar dapibus leo. Exceptional service 
                and very professional team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

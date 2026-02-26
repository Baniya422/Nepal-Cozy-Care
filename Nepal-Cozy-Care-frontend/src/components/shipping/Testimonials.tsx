export default function Testimonials() {
  return (
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
  );
}

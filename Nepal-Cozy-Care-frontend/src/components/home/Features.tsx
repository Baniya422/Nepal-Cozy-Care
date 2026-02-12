import { Shield, Headphones, Truck } from "lucide-react";

export default function Features() {
  return (
    <section className="features">
      <div className="features-inner">
        <div className="feature">
          <Shield size={32} className="feature-icon" />
          <div className="feature-text">
            <strong>100% Authentic</strong>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>

        <div className="feature">
          <Headphones size={32} className="feature-icon" />
          <div className="feature-text">
            <strong>Support 24/7</strong>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>

        <div className="feature">
          <Truck size={32} className="feature-icon" />
          <div className="feature-text">
            <strong>Free Delivery</strong>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

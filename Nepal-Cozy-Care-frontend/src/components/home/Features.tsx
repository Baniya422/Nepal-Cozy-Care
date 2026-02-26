import { Shield, Headphones, Truck } from "lucide-react";

// Trust badges - why customers choose us
export default function Features() {
  return (
    <section className="features">
      <div className="features-inner">
        <div className="feature">
          <Shield size={32} className="feature-icon" />
          <div className="feature-text">
            <strong>Healthy Guarantee</strong>
            <p>Every plant checked before delivery</p>
          </div>
        </div>

        <div className="feature">
          <Headphones size={32} className="feature-icon" />
          <div className="feature-text">
            <strong>Plant Doctor</strong>
            <p>Free care advice via WhatsApp</p>
          </div>
        </div>

        <div className="feature">
          <Truck size={32} className="feature-icon" />
          <div className="feature-text">
            <strong>Free Delivery</strong>
            <p>All over Kathmandu Valley</p>
          </div>
        </div>
      </div>
    </section>
  );
}

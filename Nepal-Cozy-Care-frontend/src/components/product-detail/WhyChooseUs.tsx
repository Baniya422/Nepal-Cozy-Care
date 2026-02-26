import { Truck, Shield, Leaf, BookOpen } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <div className="why-choose-section">
      <h3>Why choose cozy care?</h3>
      <div className="features-grid">
        <div className="feature">
          <Truck size={24} />
          <span>Fast & Secure Delivery</span>
        </div>
        <div className="feature">
          <Shield size={24} />
          <span>Hand-Picked, Healthy Plants from own Green House</span>
        </div>
        <div className="feature">
          <Leaf size={24} />
          <span>All-in-One Plant Care + Shipping</span>
        </div>
        <div className="feature">
          <BookOpen size={24} />
          <span>Expert Care Tips and Guides</span>
        </div>
      </div>
    </div>
  );
}

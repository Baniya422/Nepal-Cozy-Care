import { useState } from "react";

export default function Sidebar() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
    alert("Thank you for subscribing!");
  };

  return (
    <aside className="blogs-sidebar">
      {/* Top Trends */}
      <div className="blogs-sidebar-section">
        <h3 className="blogs-sidebar-title">Top trends</h3>
        <div className="blogs-trends-list">
          <div className="blogs-trend-item">
            <img src="/images/trend1.jpg" alt="Trend" className="blogs-trend-image" />
            <p className="blogs-trend-text">Best Indoor Plants for Beginners: Easy Care Tips</p>
          </div>
          <div className="blogs-trend-item">
            <img src="/images/trend2.jpg" alt="Trend" className="blogs-trend-image" />
            <p className="blogs-trend-text">Best Indoor Plants for Small Spaces and Low Light</p>
          </div>
          <div className="blogs-trend-item">
            <img src="/images/trend3.jpg" alt="Trend" className="blogs-trend-image" />
            <p className="blogs-trend-text">Best Plants for The Great Outdoors: Your Guide</p>
          </div>
          <div className="blogs-trend-item">
            <img src="/images/trend4.jpg" alt="Trend" className="blogs-trend-image" />
            <p className="blogs-trend-text">Discover the Health and Wellness Benefits of House Plants</p>
          </div>
          <div className="blogs-trend-item">
            <img src="/images/trend5.jpg" alt="Trend" className="blogs-trend-image" />
            <p className="blogs-trend-text">How to Keep Your Indoor Plants Healthy Year Round</p>
          </div>
        </div>
      </div>

      {/* Top Stories */}
      <div className="blogs-sidebar-section">
        <h3 className="blogs-sidebar-title">Top stories</h3>
        <div className="blogs-stories-list">
          <p className="blogs-story-item">Watering Schedule for Different Plant Types</p>
          <p className="blogs-story-item">Common Mistakes to Avoid When Caring for Indoor Plants</p>
          <p className="blogs-story-item">How to Repot Your Plant: Step-by-Step Guide</p>
          <p className="blogs-story-item">Understanding Plant Nutrients and Fertilizers</p>
          <p className="blogs-story-item">Best Low-Maintenance Plants for Busy People</p>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="blogs-newsletter">
        <h3 className="blogs-newsletter-title">Daily Newsletter</h3>
        <p className="blogs-newsletter-text">Get all the latest news and tips delivered to your inbox</p>
        <form onSubmit={handleNewsletterSubmit} className="blogs-newsletter-form">
          <input
            type="email"
            placeholder="Name"
            className="blogs-newsletter-input"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="blogs-newsletter-input"
            required
          />
          <button type="submit" className="blogs-newsletter-btn">
            SUBSCRIBE
          </button>
        </form>
      </div>
    </aside>
  );
}

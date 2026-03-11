import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="contact-info">
      <span className="contact-side-eyebrow">Support Channels</span>
      <h1 className="contact-title">We help with delivery, orders, and healthy plants.</h1>
      <p className="contact-description">
        Reach out if you need help before ordering, after checkout, or while waiting for
        delivery. Include your order number if your message is about a recent purchase.
      </p>

      <div className="contact-promise-list">
        <div className="contact-promise-item">Order support and confirmation guidance</div>
        <div className="contact-promise-item">Location and landmark clarification</div>
        <div className="contact-promise-item">Plant care help after purchase</div>
      </div>

      <div className="contact-details">
        <div className="contact-detail-item">
          <div className="contact-icon-wrapper">
            <Mail size={20} />
          </div>
          <div className="contact-detail-content">
            <span className="contact-detail-label">Email</span>
            <span className="contact-detail-value">support@cozycare.com</span>
          </div>
        </div>

        <div className="contact-detail-item">
          <div className="contact-icon-wrapper">
            <Phone size={20} />
          </div>
          <div className="contact-detail-content">
            <span className="contact-detail-label">Call or WhatsApp</span>
            <span className="contact-detail-value">+977 9876543211</span>
          </div>
        </div>

        <div className="contact-detail-item">
          <div className="contact-icon-wrapper">
            <MapPin size={20} />
          </div>
          <div className="contact-detail-content">
            <span className="contact-detail-label">Delivery Support Base</span>
            <span className="contact-detail-value">Kathmandu Valley, Nepal</span>
          </div>
        </div>

        <div className="contact-detail-item">
          <div className="contact-icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="contact-detail-content">
            <span className="contact-detail-label">Mon - Sat 9:00 - 18:00</span>
            <span className="contact-detail-value">Sunday Closed</span>
          </div>
        </div>
      </div>

      <div className="contact-note-card">
        <h3>Best way to get faster help</h3>
        <p>
          For delivery questions, include your order number, city, and a nearby landmark. That
          makes it much easier for our admin team to confirm the location with you.
        </p>
      </div>
    </div>
  );
}

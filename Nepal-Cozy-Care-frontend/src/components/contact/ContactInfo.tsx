import { Mail, Phone, Clock } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="contact-info">
      <h1 className="contact-title">Get in touch with us</h1>
      <p className="contact-description">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
      </p>

      <div className="contact-details">
        <div className="contact-detail-item">
          <div className="contact-icon-wrapper">
            <Mail size={20} />
          </div>
          <div className="contact-detail-content">
            <span className="contact-detail-label">Email</span>
            <span className="contact-detail-value">CozyCare@gmail.com</span>
          </div>
        </div>

        <div className="contact-detail-item">
          <div className="contact-icon-wrapper">
            <Phone size={20} />
          </div>
          <div className="contact-detail-content">
            <span className="contact-detail-label">Call Us</span>
            <span className="contact-detail-value">+977 9876543211</span>
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
    </div>
  );
}

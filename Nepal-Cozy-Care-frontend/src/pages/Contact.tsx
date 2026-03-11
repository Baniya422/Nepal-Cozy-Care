import { Leaf, MapPin, Phone } from "lucide-react";
import Layout from "../components/layout/Layout";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";
import Banner from "../components/contact/Banner";
import "../styles/contact.css";

export default function Contact() {
  return (
    <Layout>
      <div className="contact-page">
        <section className="contact-hero">
          <div className="contact-container contact-hero-grid">
            <div className="contact-hero-copy">
              <span className="contact-eyebrow">Contact Cozy Care</span>
              <h1>Talk to us about orders, delivery locations, and plant care.</h1>
              <p>
                Use this page for general support, order follow-up, and delivery help. After an
                order is placed, our admin team can call, email, or WhatsApp you to confirm the
                address and make delivery smoother.
              </p>
            </div>

            <div className="contact-support-grid">
              <div className="contact-support-card">
                <Phone size={20} />
                <h3>Order Confirmation</h3>
                <p>Get quick help for order approval, delivery timing, or callback requests.</p>
              </div>
              <div className="contact-support-card">
                <MapPin size={20} />
                <h3>Location Check</h3>
                <p>Add landmarks and delivery notes so admin can confirm the exact location.</p>
              </div>
              <div className="contact-support-card">
                <Leaf size={20} />
                <h3>Plant Care Help</h3>
                <p>Ask for plant care guidance, post-purchase support, or product suggestions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <div className="contact-container">
            <ContactInfo />
            <ContactForm />
          </div>
        </section>

        <Banner />
      </div>
    </Layout>
  );
}

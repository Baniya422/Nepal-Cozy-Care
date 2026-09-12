import { Leaf, MapPin, Phone } from "lucide-react";
import Layout from "../components/layout/Layout";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";
import Banner from "../components/contact/Banner";
import "../styles/contact.css";
import { defaultContactContent, useContentTemplate } from "../features/page-content/templates";
export default function Contact() {
  const content = useContentTemplate("contact_page", defaultContactContent);
  const supportIcons = [Phone, MapPin, Leaf];
  return (
    <Layout>
      <div className="contact-page">
        <section className="contact-hero">
          <div className="contact-container contact-hero-grid">
            <div className="contact-hero-copy">
              <span className="contact-eyebrow">{content.hero.eyebrow}</span>
              <h1>{content.hero.title}</h1>
              <p>{content.hero.description}</p>
            </div>
            <div className="contact-support-grid">
              {content.hero.cards.map((card, index) => {
                const Icon = supportIcons[index] ?? Leaf;
                return (
                  <div className="contact-support-card" key={`${card.title}-${index}`}>
                    <Icon size={20} />
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {}
        <section className="contact-section">
          <div className="contact-container">
            <ContactInfo content={content.info} />
            <ContactForm content={content.form} />
          </div>
        </section>
        <Banner images={content.banner_images} />
      </div>
    </Layout>
  );
}

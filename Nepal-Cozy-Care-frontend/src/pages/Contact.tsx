import Layout from "../components/layout/Layout";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";
import Banner from "../components/contact/Banner";
import "../styles/contact.css";

export default function Contact() {
  return (
    <Layout>
      <div className="contact-page">
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

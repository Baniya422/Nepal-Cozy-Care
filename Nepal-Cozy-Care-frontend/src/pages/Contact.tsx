import { useState } from "react";
import { Mail, Phone, Clock } from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/contact.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", city: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="contact-page">
        {/* Contact Section */}
        <section className="contact-section">
          <div className="contact-container">
            {/* Left Side - Info */}
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

            {/* Right Side - Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name*"
                    className="contact-input"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email*"
                    className="contact-input"
                    required
                  />
                </div>

                <div className="contact-form-row">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number*"
                    className="contact-input"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City*"
                    className="contact-input"
                    required
                  />
                </div>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  className="contact-textarea"
                  rows={5}
                />

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit Message"}
                </button>

                {submitStatus === "success" && (
                  <p className="contact-status success">Thank you! Your message has been sent.</p>
                )}
                {submitStatus === "error" && (
                  <p className="contact-status error">Something went wrong. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Nepal Images Banner */}
        <section className="contact-banner">
          <div className="contact-banner-images">
            <div className="contact-banner-image-wrapper">
              <img
                src="/images/nepal-mountains.jpg"
                alt="Nepal Mountains"
                className="contact-banner-image"
              />
            </div>
            <div className="contact-banner-image-wrapper">
              <img
                src="/images/nepal-stupa.jpg"
                alt="Nepal Stupa"
                className="contact-banner-image"
              />
            </div>
            <div className="contact-banner-image-wrapper">
              <img
                src="/images/nepal-plane.jpg"
                alt="Nepal Plane"
                className="contact-banner-image"
              />
            </div>
            <div className="contact-banner-image-wrapper">
              <img
                src="/images/nepal-landscape.jpg"
                alt="Nepal Landscape"
                className="contact-banner-image"
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

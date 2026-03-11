import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    subject: "general_inquiry",
    preferred_contact_method: "phone",
    order_reference: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setFeedbackMessage("");

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSubmitStatus("success");
        setFeedbackMessage(data.message || "Thank you! Your message has been sent.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          city: "",
          subject: "general_inquiry",
          preferred_contact_method: "phone",
          order_reference: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setFeedbackMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setFeedbackMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-wrapper">
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="contact-form-head">
          <h2>Send a support request</h2>
          <p>
            Choose the topic and how you want us to contact you back. For order issues, add the
            order number if you have it.
          </p>
        </div>

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
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="contact-input"
            required
          >
            <option value="general_inquiry">General Inquiry</option>
            <option value="order_support">Order Support</option>
            <option value="delivery_help">Delivery Help</option>
            <option value="plant_care">Plant Care</option>
            <option value="bulk_order">Bulk Order</option>
          </select>
          <select
            name="preferred_contact_method"
            value={formData.preferred_contact_method}
            onChange={handleChange}
            className="contact-input"
            required
          >
            <option value="phone">Call Me</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div className="contact-form-row">
          <input
            type="text"
            name="order_reference"
            value={formData.order_reference}
            onChange={handleChange}
            placeholder="Order Number (optional)"
            className="contact-input"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number*"
            className="contact-input"
            required
          />
        </div>

        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City / Delivery Area*"
          className="contact-input"
          required
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us what you need help with. If this is a delivery issue, include landmarks or location clarification."
          className="contact-textarea"
          rows={5}
          required
        />

        <div className="contact-form-footer">
          <p className="contact-form-note">
            Admin will use your preferred contact method to reply or confirm order details.
          </p>
          <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Support Request"}
          </button>
        </div>

        {submitStatus === "success" && (
          <p className="contact-status success">{feedbackMessage}</p>
        )}
        {submitStatus === "error" && (
          <p className="contact-status error">{feedbackMessage}</p>
        )}
      </form>
    </div>
  );
}

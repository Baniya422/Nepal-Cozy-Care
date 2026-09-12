import { useState } from "react";
import type { ContactPageContent } from "../../features/page-content/templates";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
export default function ContactForm({ content }: { content: ContactPageContent["form"] }) {
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
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <div className="contact-form-row">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={content.name_placeholder}
            className="contact-input"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={content.email_placeholder}
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
            {content.subject_options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          <select
            name="preferred_contact_method"
            value={formData.preferred_contact_method}
            onChange={handleChange}
            className="contact-input"
            required
          >
            {content.contact_method_options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="contact-form-row">
          <input
            type="text"
            name="order_reference"
            value={formData.order_reference}
            onChange={handleChange}
            placeholder={content.order_placeholder}
            className="contact-input"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={content.phone_placeholder}
            className="contact-input"
            required
          />
        </div>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder={content.city_placeholder}
          className="contact-input"
          required
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={content.message_placeholder}
          className="contact-textarea"
          rows={5}
          required
        />
        <div className="contact-form-footer">
          <p className="contact-form-note">
            {content.note}
          </p>
          <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? content.submitting_label : content.button_label}
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

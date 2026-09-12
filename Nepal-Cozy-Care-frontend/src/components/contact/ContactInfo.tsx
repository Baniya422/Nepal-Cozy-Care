import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ContactPageContent } from "../../features/page-content/templates";
const detailIcons = [Mail, Phone, MapPin, Clock];
export default function ContactInfo({ content }: { content: ContactPageContent["info"] }) {
  return (
    <div className="contact-info">
      <span className="contact-side-eyebrow">{content.eyebrow}</span>
      <h1 className="contact-title">{content.title}</h1>
      <p className="contact-description">{content.description}</p>
      <div className="contact-promise-list">
        {content.promises.map((promise, index) => <div className="contact-promise-item" key={`${promise}-${index}`}>{promise}</div>)}
      </div>
      <div className="contact-details">
        {content.details.map((detail, index) => {
          const Icon = detailIcons[index] ?? Mail;
          return (
            <div className="contact-detail-item" key={`${detail.label}-${index}`}>
              <div className="contact-icon-wrapper"><Icon size={20} /></div>
              <div className="contact-detail-content">
                <span className="contact-detail-label">{detail.label}</span>
                <span className="contact-detail-value">{detail.value}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="contact-note-card">
        <h3>{content.note_title}</h3>
        <p>{content.note_description}</p>
      </div>
    </div>
  );
}

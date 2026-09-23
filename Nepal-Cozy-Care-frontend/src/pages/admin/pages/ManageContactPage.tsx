import { Send, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  ImageUploader,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManageContactPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    uploadImage,
    handleSave,
  } = usePageContentEditor({
    pageKey: "contact_page",
    pageName: "Contact & Support",
    pageUrl: "/contact",
  });

  const hero = payload.hero || {};
  const cards = Array.isArray(hero.cards) ? hero.cards : [];
  const info = payload.info || {};
  const promises = Array.isArray(info.promises) ? info.promises : [];
  const details = Array.isArray(info.details) ? info.details : [];
  const form = payload.form || {};
  const subjectOptions = Array.isArray(form.subject_options) ? form.subject_options : [];
  const contactMethodOptions = Array.isArray(form.contact_method_options) ? form.contact_method_options : [];
  const bannerImages = Array.isArray(payload.banner_images) ? payload.banner_images : [];

  return (
    <PageEditorShell
      title="Contact & Support Page Editor"
      subtitle="Configure support channels, response times, inquiry form options, and emergency hotline numbers."
      icon={Send}
      pageUrl="/contact"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Contact Hero */}
        <EditorCard title="Contact Hero & Support Cards" description="Introductory banner and support categories." badge={`${cards.length} Cards`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <FormInput label="Eyebrow Kicker" value={hero.eyebrow} onChange={(val) => handleFieldChange(["hero", "eyebrow"], val)} />
            <FormInput label="Hero Title" value={hero.title} onChange={(val) => handleFieldChange(["hero", "title"], val)} />
          </div>
          <FormInput
            label="Hero Description"
            multiline
            rows={3}
            value={hero.description}
            onChange={(val) => handleFieldChange(["hero", "description"], val)}
          />

          <h4 style={{ margin: "1.25rem 0 0.5rem", fontSize: "0.95rem", color: "#102e23" }}>Support Cards</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {cards.map((card: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["hero", "cards"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Card Title"
                  value={card.title}
                  onChange={(val) => handleArrayItemChange(["hero", "cards"], index, "title", val)}
                />
                <FormInput
                  label="Card Description"
                  multiline
                  rows={2}
                  value={card.description}
                  onChange={(val) => handleArrayItemChange(["hero", "cards"], index, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["hero", "cards"], { title: "New Support Category", description: "Category description." })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Support Card
          </button>
        </EditorCard>

        {/* Contact Information & Channels */}
        <EditorCard title="Contact Channels & Office Info" description="Phone numbers, email, physical nursery address, and hours.">
          <FormInput label="Section Title" value={info.title} onChange={(val) => handleFieldChange(["info", "title"], val)} />
          <FormInput
            label="Section Subtitle"
            multiline
            rows={2}
            value={info.subtitle}
            onChange={(val) => handleFieldChange(["info", "subtitle"], val)}
          />

          <h4 style={{ margin: "1.25rem 0 0.5rem", fontSize: "0.95rem", color: "#102e23" }}>Contact Channels</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {details.map((detail: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["info", "details"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Channel Title"
                  value={detail.title}
                  onChange={(val) => handleArrayItemChange(["info", "details"], index, "title", val)}
                />
                <FormInput
                  label="Icon (e.g. Phone, Mail, MapPin, Clock)"
                  value={detail.icon}
                  onChange={(val) => handleArrayItemChange(["info", "details"], index, "icon", val)}
                />
                <FormInput
                  label="Primary Value"
                  value={detail.value}
                  onChange={(val) => handleArrayItemChange(["info", "details"], index, "value", val)}
                />
                <FormInput
                  label="Secondary Value / Hint"
                  value={detail.secondary_value}
                  onChange={(val) => handleArrayItemChange(["info", "details"], index, "secondary_value", val)}
                />
                <FormInput
                  label="Action URL (e.g. tel:+9779800000000)"
                  value={detail.action_url}
                  onChange={(val) => handleArrayItemChange(["info", "details"], index, "action_url", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["info", "details"], { icon: "Phone", title: "New Channel", value: "+977-9800000000", action_url: "tel:+9779800000000" })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Contact Channel
          </button>

          <h4 style={{ margin: "1.5rem 0 0.5rem", fontSize: "0.95rem", color: "#102e23" }}>Customer Care Commitments</h4>
          {promises.map((promise: any, index: number) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                placeholder="Commitment Title"
                value={promise.title || ""}
                onChange={(e) => handleArrayItemChange(["info", "promises"], index, "title", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                placeholder="Short Description"
                value={promise.description || ""}
                onChange={(e) => handleArrayItemChange(["info", "promises"], index, "description", e.target.value)}
                style={{ flex: 2, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(["info", "promises"], index)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["info", "promises"], { title: "Prompt Response", description: "Within 2 hours." })}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Commitment
          </button>
        </EditorCard>

        {/* Inquiry Form Configuration */}
        <EditorCard title="Customer Inquiry Form Configuration" description="Form headings, subject dropdown choices, and contact methods.">
          <FormInput label="Form Headline" value={form.title} onChange={(val) => handleFieldChange(["form", "title"], val)} />
          <FormInput
            label="Form Subtitle"
            multiline
            rows={2}
            value={form.subtitle}
            onChange={(val) => handleFieldChange(["form", "subtitle"], val)}
          />
          <FormInput
            label="Submit Button Text"
            value={form.submit_button_text}
            onChange={(val) => handleFieldChange(["form", "submit_button_text"], val)}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
                Subject Dropdown Choices
              </label>
              {subjectOptions.map((opt: string, index: number) => (
                <div key={index} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleArrayItemChange(["form", "subject_options"], index, "", e.target.value)}
                    style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem(["form", "subject_options"], index)}
                    style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.45rem", cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => handleAddArrayItem(["form", "subject_options"], "New Subject")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", marginTop: "0.4rem" }}
              >
                <Plus size={13} /> Add Choice
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
                Preferred Contact Methods
              </label>
              {contactMethodOptions.map((opt: string, index: number) => (
                <div key={index} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleArrayItemChange(["form", "contact_method_options"], index, "", e.target.value)}
                    style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem(["form", "contact_method_options"], index)}
                    style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.45rem", cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => handleAddArrayItem(["form", "contact_method_options"], "WhatsApp")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", marginTop: "0.4rem" }}
              >
                <Plus size={13} /> Add Method
              </button>
            </div>
          </div>
        </EditorCard>

        {/* Nepal Banner Images */}
        <EditorCard title="Nepal Landscape & Heritage Photo Gallery" description="Images displayed at the bottom of the contact page." badge={`${bannerImages.length} Photos`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {bannerImages.map((imgItem: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["banner_images"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <ImageUploader
                  label={`Photo #${index + 1}`}
                  value={imgItem.image}
                  onChange={(val) => handleArrayItemChange(["banner_images"], index, "image", val)}
                  uploadImage={uploadImage}
                />
                <FormInput
                  label="Alt Description"
                  value={imgItem.alt}
                  onChange={(val) => handleArrayItemChange(["banner_images"], index, "alt", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["banner_images"], { image: "/images/nepal-mountains.jpg", alt: "Nepal Landscape" })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Gallery Photo
          </button>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

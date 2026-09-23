import { Truck, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  ImageUploader,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManageShippingPage() {
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
    pageKey: "shipping_page",
    pageName: "Shipping & Delivery",
    pageUrl: "/shipping",
  });

  const hero = payload.hero || {};
  const titleLines = Array.isArray(hero.title_lines) ? hero.title_lines : [];
  const about = payload.about || {};
  const delivery = payload.delivery || {};
  const deliveryOptions = Array.isArray(delivery.options) ? delivery.options : [];
  const benefits = payload.benefits || {};
  const benefitItems = Array.isArray(benefits.items) ? benefits.items : [];
  const testimonials = payload.testimonials || {};
  const testimonialItems = Array.isArray(testimonials.items) ? testimonials.items : [];

  return (
    <PageEditorShell
      title="Shipping & Delivery Page Editor"
      subtitle="Edit packaging guarantees, delivery tiers, Kathmandu valley coverage, and customer reviews."
      icon={Truck}
      pageUrl="/shipping"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Hero */}
        <EditorCard title="Hero Banner & Title Lines" description="Header banner for Shipping & Delivery.">
          <ImageUploader
            label="Hero Background Image"
            value={hero.background_image}
            onChange={(val) => handleFieldChange(["hero", "background_image"], val)}
            uploadImage={uploadImage}
          />
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
            Hero Title Lines
          </label>
          {titleLines.map((line: string, lIdx: number) => (
            <div key={lIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={line || ""}
                onChange={(e) => handleArrayItemChange(["hero", "title_lines"], lIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(["hero", "title_lines"], lIdx)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["hero", "title_lines"], "New Title Line")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", marginBottom: "1rem" }}
          >
            <Plus size={14} /> Add Title Line
          </button>
          <FormInput
            label="Subtitle"
            multiline
            rows={2}
            value={hero.subtitle}
            onChange={(val) => handleFieldChange(["hero", "subtitle"], val)}
          />
        </EditorCard>

        {/* Packaging Protection / About */}
        <EditorCard title="Packaging Protection & Safe Transit Guarantee" description="How plants are protected and secured during shipment.">
          <FormInput label="Badge Text" value={about.badge} onChange={(val) => handleFieldChange(["about", "badge"], val)} />
          <FormInput label="Section Title" value={about.title} onChange={(val) => handleFieldChange(["about", "title"], val)} />
          <FormInput
            label="Section Subtitle"
            multiline
            rows={2}
            value={about.subtitle}
            onChange={(val) => handleFieldChange(["about", "subtitle"], val)}
          />
          <FormInput
            label="Description Paragraph"
            multiline
            rows={3}
            value={about.description}
            onChange={(val) => handleFieldChange(["about", "description"], val)}
          />
          <ImageUploader
            label="Packaging Feature Photo"
            value={about.image}
            onChange={(val) => handleFieldChange(["about", "image"], val)}
            uploadImage={uploadImage}
          />
          <FormInput label="Image Alt Description" value={about.image_alt} onChange={(val) => handleFieldChange(["about", "image_alt"], val)} />
        </EditorCard>

        {/* Delivery Options */}
        <EditorCard title="Delivery Tiers & Rates" description="Shipping speeds and valley options." badge={`${deliveryOptions.length} Tiers`}>
          <FormInput label="Delivery Eyebrow" value={delivery.badge} onChange={(val) => handleFieldChange(["delivery", "badge"], val)} />
          <FormInput label="Delivery Headline" value={delivery.title} onChange={(val) => handleFieldChange(["delivery", "title"], val)} />
          <FormInput
            label="Delivery Subtitle"
            multiline
            rows={2}
            value={delivery.subtitle}
            onChange={(val) => handleFieldChange(["delivery", "subtitle"], val)}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
            {deliveryOptions.map((opt: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["delivery", "options"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Option Title (e.g. Same-Day Valley Express)"
                  value={opt.title}
                  onChange={(val) => handleArrayItemChange(["delivery", "options"], index, "title", val)}
                />
                <FormInput
                  label="Icon (e.g. Zap, Truck, Package, ShieldCheck)"
                  value={opt.icon}
                  onChange={(val) => handleArrayItemChange(["delivery", "options"], index, "icon", val)}
                />
                <FormInput
                  label="Delivery Window / Time"
                  value={opt.time}
                  onChange={(val) => handleArrayItemChange(["delivery", "options"], index, "time", val)}
                />
                <FormInput
                  label="Shipping Price / Cost"
                  value={opt.price}
                  onChange={(val) => handleArrayItemChange(["delivery", "options"], index, "price", val)}
                />
                <FormInput
                  label="Details Description"
                  multiline
                  rows={2}
                  value={opt.description}
                  onChange={(val) => handleArrayItemChange(["delivery", "options"], index, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["delivery", "options"], { icon: "Truck", title: "Standard Delivery", time: "2-3 Days", price: "Rs. 100", description: "Standard Kathmandu valley delivery." })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Delivery Option
          </button>
        </EditorCard>

        {/* Benefits / Guarantees */}
        <EditorCard title="Customer Care & Guarantee Badges" description="Features displayed below delivery options.">
          <FormInput label="Badge" value={benefits.badge} onChange={(val) => handleFieldChange(["benefits", "badge"], val)} />
          <FormInput label="Headline" value={benefits.title} onChange={(val) => handleFieldChange(["benefits", "title"], val)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
            {benefitItems.map((ben: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["benefits", "items"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Benefit Title"
                  value={ben.title}
                  onChange={(val) => handleArrayItemChange(["benefits", "items"], index, "title", val)}
                />
                <FormInput
                  label="Icon"
                  value={ben.icon}
                  onChange={(val) => handleArrayItemChange(["benefits", "items"], index, "icon", val)}
                />
                <FormInput
                  label="Description"
                  multiline
                  rows={2}
                  value={ben.description}
                  onChange={(val) => handleArrayItemChange(["benefits", "items"], index, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["benefits", "items"], { icon: "CheckCircle2", title: "100% Healthy Guarantee", description: "Guaranteed alive and thriving." })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Guarantee Feature
          </button>
        </EditorCard>

        {/* Testimonials */}
        <EditorCard title="Customer Reviews & Testimonials" description="Verified shipping feedback." badge={`${testimonialItems.length} Reviews`}>
          <FormInput label="Badge" value={testimonials.badge} onChange={(val) => handleFieldChange(["testimonials", "badge"], val)} />
          <FormInput label="Headline" value={testimonials.title} onChange={(val) => handleFieldChange(["testimonials", "title"], val)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
            {testimonialItems.map((item: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["testimonials", "items"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Customer Name"
                  value={item.name}
                  onChange={(val) => handleArrayItemChange(["testimonials", "items"], index, "name", val)}
                />
                <FormInput
                  label="Role / Location"
                  value={item.role}
                  onChange={(val) => handleArrayItemChange(["testimonials", "items"], index, "role", val)}
                />
                <FormInput
                  label="Review Quote"
                  multiline
                  rows={3}
                  value={item.quote}
                  onChange={(val) => handleArrayItemChange(["testimonials", "items"], index, "quote", val)}
                />
                <ImageUploader
                  label="Customer Photo"
                  value={item.image}
                  onChange={(val) => handleArrayItemChange(["testimonials", "items"], index, "image", val)}
                  uploadImage={uploadImage}
                />
                <div style={{ marginTop: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.featured)}
                      onChange={(e) => handleArrayItemChange(["testimonials", "items"], index, "featured", e.target.checked)}
                    />
                    Show as Featured Testimonial
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["testimonials", "items"], {
                name: "New Reviewer",
                role: "Verified Buyer",
                rating: 5,
                quote: "The plant arrived in pristine condition!",
                image: "/images/team-sarah.jpg",
                image_alt: "Verified Buyer",
                featured: false,
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Testimonial Review
          </button>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

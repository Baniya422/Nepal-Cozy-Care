import { HelpCircle, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManageHelpCenterPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleSave,
  } = usePageContentEditor({
    pageKey: "help_center",
    pageName: "Help Center & FAQs",
    pageUrl: "/help-center",
  });

  const faqItems = Array.isArray(payload.faq_items) ? payload.faq_items : [];
  const categories = Array.isArray(payload.categories) ? payload.categories : [];
  const topicCards = Array.isArray(payload.topic_cards) ? payload.topic_cards : [];

  return (
    <PageEditorShell
      title="Help Center & FAQs Editor"
      subtitle="Manage FAQ questions, answers, support phone/email desk info, and knowledge categories."
      icon={HelpCircle}
      pageUrl="/help-center"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Support Intro & Contact Channels */}
        <EditorCard title="Support Desk & Contact Channels" description="Support intro, dedicated contact phone and email address.">
          <FormInput
            label="Support Intro Banner"
            multiline
            rows={2}
            value={payload.support_intro}
            onChange={(val) => handleFieldChange(["support_intro"], val)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormInput
              label="Support Phone Number"
              value={payload.contact_phone}
              onChange={(val) => handleFieldChange(["contact_phone"], val)}
            />
            <FormInput
              label="Support Email Address"
              value={payload.contact_email}
              onChange={(val) => handleFieldChange(["contact_email"], val)}
            />
          </div>
        </EditorCard>

        {/* Categories */}
        <EditorCard title="Help Categories" description="Tabs used to filter FAQ questions." badge={`${categories.length} Categories`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {categories.map((cat: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["categories"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Category Key (e.g. shipping, orders)"
                  value={cat.key}
                  onChange={(val) => handleArrayItemChange(["categories"], index, "key", val)}
                />
                <FormInput
                  label="Category Display Label"
                  value={cat.label}
                  onChange={(val) => handleArrayItemChange(["categories"], index, "label", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["categories"], { key: `cat_${Date.now()}`, label: "New Category" })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Category
          </button>
        </EditorCard>

        {/* Topic Cards */}
        <EditorCard title="Topic Highlights" description="Featured topic cards at top of Help Center." badge={`${topicCards.length} Topics`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {topicCards.map((topic: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["topic_cards"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Topic Title"
                  value={topic.title}
                  onChange={(val) => handleArrayItemChange(["topic_cards"], index, "title", val)}
                />
                <FormInput
                  label="Icon (e.g. Package, ShieldCheck, HeartPulse, RefreshCw)"
                  value={topic.icon}
                  onChange={(val) => handleArrayItemChange(["topic_cards"], index, "icon", val)}
                />
                <FormInput
                  label="Description"
                  multiline
                  rows={2}
                  value={topic.description}
                  onChange={(val) => handleArrayItemChange(["topic_cards"], index, "description", val)}
                />
                <FormInput
                  label="Target Link (e.g. #orders)"
                  value={topic.link}
                  onChange={(val) => handleArrayItemChange(["topic_cards"], index, "link", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["topic_cards"], { icon: "HelpCircle", title: "New Topic", description: "Topic description.", link: "#" })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Topic Card
          </button>
        </EditorCard>

        {/* FAQs */}
        <EditorCard title="FAQ Questions & Answers" description="Accordion questions visible to visitors." badge={`${faqItems.length} FAQs`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqItems.map((faq: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["faq_items"], index)}
                  style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={18} />
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                  <FormInput
                    label="Associated Category Key"
                    value={faq.category}
                    placeholder="e.g. general, shipping, care, orders"
                    onChange={(val) => handleArrayItemChange(["faq_items"], index, "category", val)}
                  />
                  <FormInput
                    label="Question Title"
                    value={faq.question}
                    placeholder="What is your return policy?"
                    onChange={(val) => handleArrayItemChange(["faq_items"], index, "question", val)}
                  />
                </div>
                <FormInput
                  label="Detailed Answer"
                  multiline
                  rows={3}
                  value={faq.answer}
                  placeholder="Provide helpful, friendly instructions..."
                  onChange={(val) => handleArrayItemChange(["faq_items"], index, "answer", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["faq_items"], {
                category: "general",
                question: "New FAQ Question?",
                answer: "Helpful answer to assist customer inquiries.",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add FAQ Question
          </button>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

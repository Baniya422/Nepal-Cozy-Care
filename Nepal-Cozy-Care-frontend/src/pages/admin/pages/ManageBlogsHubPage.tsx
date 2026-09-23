import { BookOpen, Sparkles } from "lucide-react";
import {
  EditorCard,
  FormInput,
  ImageUploader,
  PageEditorShell,
  resolvePageImage,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManageBlogsHubPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    uploadImage,
    handleSave,
  } = usePageContentEditor({
    pageKey: "blogs_page",
    pageName: "Care Blogs Hub",
    pageUrl: "/blogs",
  });

  const hero = payload?.hero || {};
  const newsletter = payload?.newsletter || {};

  const PRESETS = [
    { label: "Lush Conservatory", path: "/images/blog-hero-lush.jpg" },
    { label: "Monstera Macro Leaf", path: "/images/blog-leaf-macro.jpg" },
    { label: "Indoor Green House", path: "/images/about-plants.jpg" },
    { label: "Winter Garden", path: "/images/winter-garden.png" },
  ];

  return (
    <PageEditorShell
      title="Care Blogs Hub Page Editor"
      subtitle="Edit featured editorial headline, hero background photography, kicker text, and newsletter banner."
      icon={BookOpen}
      pageUrl="/blogs"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Live Visual Preview Banner */}
        <EditorCard
          title="Live Visual Hero Preview"
          description="Instant visual preview of how the botanical blog header looks to public visitors."
          badge="Live Interactive Preview"
        >
          <div
            style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              padding: "2.5rem 2rem",
              color: "#ffffff",
              background: "#102e23",
              minHeight: "260px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            {hero.background_image && (
              <img
                src={resolvePageImage(hero.background_image)}
                alt="Hero Preview Background"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.35,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(16,46,35,0.7) 0%, rgba(16,46,35,0.92) 100%)",
              }}
            />

            <div style={{ position: "relative", zIndex: 2, maxWidth: "750px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "999px",
                  background: "rgba(167, 243, 208, 0.2)",
                  border: "1px solid rgba(167, 243, 208, 0.4)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#a7f3d0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.75rem",
                }}
              >
                <Sparkles size={12} /> {hero.kicker || "Nepal Cozy Care Botanical Journal"}
              </span>

              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#ffffff", lineHeight: 1.25 }}>
                {hero.title_main || "Stories from the Soil:"}{" "}
                <span style={{ color: "#a7f3d0" }}>{hero.title_highlight || "Cultivating Life & Serenity"}</span>
              </h2>

              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", margin: "0 auto 1.25rem", maxWidth: "600px", lineHeight: 1.5 }}>
                {hero.subtitle || "Deep-dive care handbooks and expert wisdom."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1.25rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  fontSize: "0.8rem",
                  color: "#cbd5e1",
                }}
              >
                <span>📖 {hero.badge_1 || "60+ Guides"}</span>
                <span>🌱 {hero.badge_2 || "12,000+ Readers"}</span>
                <span>🩺 {hero.badge_3 || "Expert Verified"}</span>
              </div>
            </div>
          </div>
        </EditorCard>

        {/* Hero Banner Form Settings */}
        <EditorCard
          title="Hero Banner Typography & Headings"
          description="Configure the primary headline, green highlight phrase, description, and trust badges."
          badge="Hero Section"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
            <FormInput
              label="Kicker Badge (Eyebrow Text)"
              value={hero.kicker}
              placeholder="e.g. NEPAL COZY CARE BOTANICAL JOURNAL & CARE STORIES"
              onChange={(val) => handleFieldChange(["hero", "kicker"], val)}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <FormInput
                label="Primary Title (White Text)"
                value={hero.title_main}
                placeholder="Stories from the Soil:"
                onChange={(val) => handleFieldChange(["hero", "title_main"], val)}
              />
              <FormInput
                label="Highlighted Title Phrase (Green Accented)"
                value={hero.title_highlight}
                placeholder="Cultivating Life & Serenity"
                onChange={(val) => handleFieldChange(["hero", "title_highlight"], val)}
              />
            </div>

            <FormInput
              label="Editorial Lead Paragraph / Subtitle"
              value={hero.subtitle}
              multiline
              rows={3}
              placeholder="Deep-dive care handbooks, urban gardening tips, and botanical insights crafted for Kathmandu Valley plant parents."
              onChange={(val) => handleFieldChange(["hero", "subtitle"], val)}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "0.5rem" }}>
              <FormInput
                label="Trust Badge 1"
                value={hero.badge_1}
                placeholder="60+ Plant Guides"
                onChange={(val) => handleFieldChange(["hero", "badge_1"], val)}
              />
              <FormInput
                label="Trust Badge 2"
                value={hero.badge_2}
                placeholder="12,000+ Readers"
                onChange={(val) => handleFieldChange(["hero", "badge_2"], val)}
              />
              <FormInput
                label="Trust Badge 3"
                value={hero.badge_3}
                placeholder="Horticulture Verified"
                onChange={(val) => handleFieldChange(["hero", "badge_3"], val)}
              />
            </div>
          </div>
        </EditorCard>

        {/* Hero Background Image Settings */}
        <EditorCard
          title="Hero Background Photography"
          description="Upload custom photography or pick from one of the curated botanical presets."
          badge="Photography"
        >
          <ImageUploader
            label="Current Hero Background"
            value={hero.background_image}
            onChange={(val) => handleFieldChange(["hero", "background_image"], val)}
            uploadImage={uploadImage}
          />

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
              Or Click to Select a Curated Preset Photo:
            </label>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => handleFieldChange(["hero", "background_image"], preset.path)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "6px",
                    border: hero.background_image === preset.path ? "2px solid #10b981" : "1px solid #cbd5e1",
                    background: hero.background_image === preset.path ? "#ecfdf5" : "#ffffff",
                    color: hero.background_image === preset.path ? "#065f46" : "#334155",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </EditorCard>

        {/* Newsletter Call-to-Action Settings */}
        <EditorCard
          title="Community Newsletter CTA"
          description="Customize the botanical newsletter prompt at the bottom of the blog index."
          badge="Engagement"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormInput
              label="Eyebrow / Badge"
              value={newsletter.eyebrow}
              placeholder="Botanical Dispatch"
              onChange={(val) => handleFieldChange(["newsletter", "eyebrow"], val)}
            />
            <FormInput
              label="Newsletter Headline"
              value={newsletter.title}
              placeholder="Join 12,000+ Kathmandu Plant Parents"
              onChange={(val) => handleFieldChange(["newsletter", "title"], val)}
            />
          </div>
          <FormInput
            label="Newsletter Description"
            value={newsletter.subtitle}
            multiline
            rows={2}
            placeholder="Receive handpicked seasonal advice for Kathmandu Valley..."
            onChange={(val) => handleFieldChange(["newsletter", "subtitle"], val)}
          />
          <FormInput
            label="Subscribe Button Label"
            value={newsletter.button_text}
            placeholder="Subscribe Free"
            onChange={(val) => handleFieldChange(["newsletter", "button_text"], val)}
          />
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, Save, Upload, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  defaultHomepageContent,
  resolveHomepageImage,
  type CtaContent,
  type HomepageContent,
  type InfoSectionContent,
  type ProductSectionContent,
  type TextCardContent,
  type ToolContent,
} from "../../features/homepage/content";
import { compressImage } from "../../utils/imageCompressor";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
};

function Field({ label, value, onChange, multiline = false, hint }: FieldProps) {
  return (
    <div className="admin-form-group">
      <label>{label}</label>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <small className="admin-field-hint">{hint}</small> : null}
    </div>
  );
}

function SectionCard({ id, title, description, children }: { id?: string; title: string; description?: string; children: ReactNode }) {
  const sectionId = id || `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section id={sectionId} className="admin-editor-card" style={{ scrollMarginTop: "140px" }}>
      <div className="admin-editor-card-head">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const compressedFile = await compressImage(file, { maxWidth: 1600, quality: 0.82 });
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("directory", "homepage");
      const response = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Image upload failed.");
      onChange(data.data?.path || value);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="admin-form-group admin-home-image-field">
      <label>{label}</label>
      <div className="admin-home-image-row">
        {value ? <img src={resolveHomepageImage(value, API)} alt="Homepage preview" /> : null}
        <div>
          <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
          <label className="admin-btn admin-btn-secondary admin-upload-label">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(event) => void uploadImage(event.target.files?.[0])}
            />
          </label>
          {error ? <small className="admin-field-error">{error}</small> : null}
        </div>
      </div>
    </div>
  );
}

type HeroTextKey = "badge" | "title" | "description";
type SmartTextKey = "kicker" | "title" | "description";
type SeasonalTextKey = "kicker" | "title" | "description" | "badge_suffix" | "empty_title_suffix" | "empty_description";
type ProductKey = keyof HomepageContent["product_sections"];
type InfoKey = "garden" | "mission";

export default function ManageHomepage() {
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API}/api/admin/homepage`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Could not load homepage content.");
        if (data.data?.payload) setContent(data.data.payload as HomepageContent);
      } catch (error) {
        setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not load homepage content." });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`${API}/api/admin/homepage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ payload: content }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not save homepage content.");
      setContent(data.data.payload as HomepageContent);
      setNotice({ type: "success", text: data.message || "Homepage content saved." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save homepage content." });
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: HeroTextKey, value: string) =>
    setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  const updateHeroCta = (key: "primary_cta" | "secondary_cta", field: keyof CtaContent, value: string) =>
    setContent((current) => ({ ...current, hero: { ...current.hero, [key]: { ...current.hero[key], [field]: value } } }));
  const updateHighlight = (index: number, value: string) =>
    setContent((current) => ({ ...current, hero: { ...current.hero, highlights: current.hero.highlights.map((item, itemIndex) => itemIndex === index ? value : item) } }));
  const updateFeature = (index: number, field: keyof TextCardContent, value: string) =>
    setContent((current) => ({ ...current, features: current.features.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const updateSmart = (field: SmartTextKey, value: string) =>
    setContent((current) => ({ ...current, smart_tools: { ...current.smart_tools, [field]: value } }));
  const updateTool = (index: number, field: keyof ToolContent, value: string) =>
    setContent((current) => ({ ...current, smart_tools: { ...current.smart_tools, items: current.smart_tools.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } }));
  const updateSeasonal = (field: SeasonalTextKey, value: string) =>
    setContent((current) => ({ ...current, seasonal: { ...current.seasonal, [field]: value } }));
  const updateSeasonalCta = (key: "primary_cta" | "secondary_cta" | "empty_action", field: keyof CtaContent, value: string) =>
    setContent((current) => ({ ...current, seasonal: { ...current.seasonal, [key]: { ...current.seasonal[key], [field]: value } } }));
  const updateProduct = (key: ProductKey, field: keyof ProductSectionContent, value: string) =>
    setContent((current) => ({ ...current, product_sections: { ...current.product_sections, [key]: { ...current.product_sections[key], [field]: value } } }));
  const updateInfo = (key: InfoKey, field: keyof InfoSectionContent, value: string) =>
    setContent((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));

  const HOMEPAGE_SECTIONS = [
    { id: "sec-hero", label: "Hero Banner" },
    { id: "sec-features", label: "Features" },
    { id: "sec-smart-tools", label: "Smart Tools" },
    { id: "sec-seasonal", label: "Seasonal" },
    { id: "sec-products", label: "Products" },
    { id: "sec-garden", label: "Greenhouse" },
    { id: "sec-mission", label: "Mission" },
    { id: "sec-about", label: "About" },
  ];

  const [activeSectionId, setActiveSectionId] = useState<string>("");

  const scrollToSection = (secId: string) => {
    setActiveSectionId(secId);
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
      el.style.borderColor = "#10b981";
      el.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.3)";
      setTimeout(() => {
        el.style.borderColor = "";
        el.style.boxShadow = "";
      }, 1600);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page admin-editor-page">
        <div className="admin-page-header">
          <div>
            <h2>Homepage Content</h2>
            <p>Edit the copy, links, and images displayed on the public home page.</p>
          </div>
          <div className="admin-page-actions">
            <Link className="admin-btn admin-btn-secondary" to="/" target="_blank">
              <ExternalLink size={17} /> Preview
            </Link>
            <button className="admin-btn admin-btn-primary" onClick={() => void save()} disabled={saving || loading}>
              <Save size={17} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
        {notice ? <div className={`admin-notice admin-notice-${notice.type}`}>{notice.text}</div> : null}

        {/* Sticky Quick-Jump Section Navigation Bar */}
        <div
          style={{
            position: "sticky",
            top: "76px",
            zIndex: 30,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            padding: "0.65rem 1rem",
            marginBottom: "1.5rem",
            border: "1px solid #cbd5e1",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#1b4e54",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              paddingRight: "0.75rem",
              borderRight: "1px solid #e2e8f0",
            }}
          >
            <Layers size={15} color="#10b981" />
            <span>Sections</span>
            <span
              style={{
                background: "#e8f3ef",
                color: "#1b4e54",
                fontSize: "0.74rem",
                padding: "0.1rem 0.45rem",
                borderRadius: "999px",
                fontWeight: 800,
              }}
            >
              {HOMEPAGE_SECTIONS.length}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              overflowX: "auto",
              scrollbarWidth: "none",
              padding: "0.1rem 0",
            }}
          >
            {HOMEPAGE_SECTIONS.map((sec, idx) => {
              const isCurrent = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.45rem 0.95rem",
                    borderRadius: "999px",
                    border: isCurrent ? "1px solid #10b981" : "1px solid #cbd5e1",
                    background: isCurrent ? "#10b981" : "#ffffff",
                    color: isCurrent ? "#ffffff" : "#1e293b",
                    fontSize: "0.83rem",
                    fontWeight: isCurrent ? 700 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    boxShadow: isCurrent ? "0 2px 8px rgba(16, 185, 129, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.04)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.borderColor = "#10b981";
                      e.currentTarget.style.background = "#ecfdf5";
                      e.currentTarget.style.color = "#065f46";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.color = "#1e293b";
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      opacity: isCurrent ? 0.9 : 0.6,
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? <div className="admin-loading">Loading homepage content...</div> : (
          <div className="admin-editor-stack">
            <SectionCard id="sec-hero" title="Hero" description="The first section visitors see.">
              <ImageField label="Background image" value={content.hero.background_image} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, background_image: value } }))} />
              <div className="admin-form-grid">
                <Field label="Badge" value={content.hero.badge} onChange={(value) => updateHero("badge", value)} />
                <Field label="Title" value={content.hero.title} onChange={(value) => updateHero("title", value)} />
              </div>
              <Field label="Description" value={content.hero.description} onChange={(value) => updateHero("description", value)} multiline />
              <div className="admin-form-grid">
                <Field label="Primary button" value={content.hero.primary_cta.label} onChange={(value) => updateHeroCta("primary_cta", "label", value)} />
                <Field label="Primary button path" value={content.hero.primary_cta.path} onChange={(value) => updateHeroCta("primary_cta", "path", value)} />
                <Field label="Secondary button" value={content.hero.secondary_cta.label} onChange={(value) => updateHeroCta("secondary_cta", "label", value)} />
                <Field label="Secondary button path" value={content.hero.secondary_cta.path} onChange={(value) => updateHeroCta("secondary_cta", "path", value)} />
              </div>
              <h4 className="admin-editor-subtitle">Highlights</h4>
              <div className="admin-form-grid admin-form-grid-three">
                {content.hero.highlights.map((item, index) => <Field key={index} label={`Highlight ${index + 1}`} value={item} onChange={(value) => updateHighlight(index, value)} />)}
              </div>
            </SectionCard>

            <SectionCard id="sec-features" title="Service Features">
              <div className="admin-editor-card-grid">
                {content.features.map((feature, index) => (
                  <div className="admin-editor-inline-card" key={index}>
                    <Field label={`Feature ${index + 1}`} value={feature.title} onChange={(value) => updateFeature(index, "title", value)} />
                    <Field label="Description" value={feature.description} onChange={(value) => updateFeature(index, "description", value)} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard id="sec-smart-tools" title="Smart Care Tools">
              <div className="admin-form-grid">
                <Field label="Kicker" value={content.smart_tools.kicker} onChange={(value) => updateSmart("kicker", value)} />
                <Field label="Title" value={content.smart_tools.title} onChange={(value) => updateSmart("title", value)} />
              </div>
              <Field label="Description" value={content.smart_tools.description} onChange={(value) => updateSmart("description", value)} multiline />
              <div className="admin-editor-card-grid">
                {content.smart_tools.items.map((tool, index) => (
                  <div className="admin-editor-inline-card" key={index}>
                    <Field label={`Tool ${index + 1}`} value={tool.title} onChange={(value) => updateTool(index, "title", value)} />
                    <Field label="Description" value={tool.description} onChange={(value) => updateTool(index, "description", value)} multiline />
                    <Field label="Button" value={tool.action} onChange={(value) => updateTool(index, "action", value)} />
                    <Field label="Path" value={tool.path} onChange={(value) => updateTool(index, "path", value)} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard id="sec-seasonal" title="Seasonal Preview" description="The reminder cards themselves are managed under Seasonal Reminders.">
              <div className="admin-form-grid">
                <Field label="Kicker" value={content.seasonal.kicker} onChange={(value) => updateSeasonal("kicker", value)} />
                <Field label="Title" value={content.seasonal.title} onChange={(value) => updateSeasonal("title", value)} />
              </div>
              <Field label="Description" value={content.seasonal.description} onChange={(value) => updateSeasonal("description", value)} multiline />
              <div className="admin-form-grid">
                <Field label="Active badge ending" value={content.seasonal.badge_suffix} onChange={(value) => updateSeasonal("badge_suffix", value)} />
                <Field label="Empty-card title ending" value={content.seasonal.empty_title_suffix} onChange={(value) => updateSeasonal("empty_title_suffix", value)} />
                <Field label="Primary button" value={content.seasonal.primary_cta.label} onChange={(value) => updateSeasonalCta("primary_cta", "label", value)} />
                <Field label="Primary path" value={content.seasonal.primary_cta.path} onChange={(value) => updateSeasonalCta("primary_cta", "path", value)} />
                <Field label="Secondary button" value={content.seasonal.secondary_cta.label} onChange={(value) => updateSeasonalCta("secondary_cta", "label", value)} />
                <Field label="Secondary path" value={content.seasonal.secondary_cta.path} onChange={(value) => updateSeasonalCta("secondary_cta", "path", value)} />
              </div>
              <Field label="Empty-card description" value={content.seasonal.empty_description} onChange={(value) => updateSeasonal("empty_description", value)} multiline />
              <div className="admin-form-grid">
                <Field label="Empty-card button" value={content.seasonal.empty_action.label} onChange={(value) => updateSeasonalCta("empty_action", "label", value)} />
                <Field label="Empty-card path" value={content.seasonal.empty_action.path} onChange={(value) => updateSeasonalCta("empty_action", "path", value)} />
              </div>
            </SectionCard>

            <SectionCard id="sec-products" title="Product Sections" description="Choose products and homepage flags under Manage Plants; edit the section labels here.">
              <div className="admin-editor-card-grid">
                {(Object.keys(content.product_sections) as ProductKey[]).map((key) => {
                  const section = content.product_sections[key];
                  return (
                    <div className="admin-editor-inline-card" key={key}>
                      <Field label="Section title" value={section.title} onChange={(value) => updateProduct(key, "title", value)} />
                      <Field label="Empty message" value={section.empty_message} onChange={(value) => updateProduct(key, "empty_message", value)} />
                      <Field label="Button label" value={section.button_label} onChange={(value) => updateProduct(key, "button_label", value)} />
                      <Field label="Button path" value={section.button_path} onChange={(value) => updateProduct(key, "button_path", value)} />
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {(["garden", "mission"] as InfoKey[]).map((key) => (
              <SectionCard id={key === "garden" ? "sec-garden" : "sec-mission"} title={key === "garden" ? "Greenhouse Section" : "Mission Section"} key={key}>
                <ImageField label="Image" value={content[key].image} onChange={(value) => updateInfo(key, "image", value)} />
                <div className="admin-form-grid">
                  <Field label="Title" value={content[key].title} onChange={(value) => updateInfo(key, "title", value)} />
                  <Field label="Image description" value={content[key].image_alt} onChange={(value) => updateInfo(key, "image_alt", value)} />
                </div>
                <Field label="Description" value={content[key].description} onChange={(value) => updateInfo(key, "description", value)} multiline />
                <div className="admin-form-grid">
                  <Field label="Button label" value={content[key].button_label} onChange={(value) => updateInfo(key, "button_label", value)} />
                  <Field label="Button path" value={content[key].button_path} onChange={(value) => updateInfo(key, "button_path", value)} />
                </div>
              </SectionCard>
            ))}

            <SectionCard id="sec-about" title="About Section">
              <Field label="Title" value={content.about.title} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, title: value } }))} />
              <Field label="Description" value={content.about.description} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, description: value } }))} multiline />
              <div className="admin-form-grid">
                <Field label="Button label" value={content.about.button_label} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, button_label: value } }))} />
                <Field label="Button path" value={content.about.button_path} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, button_path: value } }))} />
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

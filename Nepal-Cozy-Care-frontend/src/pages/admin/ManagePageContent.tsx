import { useEffect, useState, type ReactNode } from "react";
import {
  ExternalLink,
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Send,
  Truck,
  Sparkles,
  Stethoscope,
  Info,
  Eye,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type PageItem = {
  key: string;
  name: string;
  url: string;
  payload: Record<string, any>;
  updated_at: string | null;
  technical?: boolean;
};

export function resolvePageImage(path: string): string {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
  return `${API}/storage/${path}`;
}

const PAGE_ICONS: Record<string, any> = {
  blogs_page: BookOpen,
  about_page: Info,
  our_mission: BookOpen,
  contact_page: Send,
  shipping_page: Truck,
  help_center: HelpCircle,
  plant_finder: Sparkles,
  plant_health: Stethoscope,
};

export default function ManagePageContent() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>("blogs_page");
  const [currentPayload, setCurrentPayload] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const token = localStorage.getItem("token");

  const loadPages = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const response = await fetch(`${API}/api/admin/page-content`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load page content.");
      const data = await response.json();
      const pageList: PageItem[] = data.data?.pages || [];
      setPages(pageList);

      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      const targetKey = tabParam && pageList.some((p) => p.key === tabParam) ? tabParam : activeKey;
      const found = pageList.find((p) => p.key === targetKey) || pageList.find((p) => p.key === "blogs_page") || pageList[0];
      if (found) {
        setActiveKey(found.key);
        setCurrentPayload(JSON.parse(JSON.stringify(found.payload || {})));
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load pages." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPages();
  }, []);

  const handleSelectPage = (key: string) => {
    setActiveKey(key);
    setStatusMessage(null);
    const found = pages.find((p) => p.key === key);
    if (found) {
      setCurrentPayload(JSON.parse(JSON.stringify(found.payload || {})));
    }
  };

  const handleFieldChange = (path: string[], value: any) => {
    setCurrentPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target = clone;
      for (let i = 0; i < path.length - 1; i++) {
        if (!target[path[i]]) {
          target[path[i]] = {};
        }
        target = target[path[i]];
      }
      target[path[path.length - 1]] = value;
      return clone;
    });
  };

  const handleArrayItemChange = (arrayPath: string[], index: number, field: string, value: any) => {
    setCurrentPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target = clone;
      for (const seg of arrayPath) {
        if (!target[seg]) target[seg] = [];
        target = target[seg];
      }
      if (Array.isArray(target) && target[index] !== undefined) {
        if (typeof target[index] === "object" && target[index] !== null && field) {
          target[index][field] = value;
        } else {
          target[index] = value;
        }
      }
      return clone;
    });
  };

  const handleAddArrayItem = (arrayPath: string[], itemTemplate: any) => {
    setCurrentPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target = clone;
      for (const seg of arrayPath) {
        if (!target[seg]) target[seg] = [];
        target = target[seg];
      }
      if (Array.isArray(target)) {
        target.push(itemTemplate);
      }
      return clone;
    });
  };

  const handleRemoveArrayItem = (arrayPath: string[], index: number) => {
    setCurrentPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target = clone;
      for (const seg of arrayPath) {
        if (!target[seg]) return prev;
        target = target[seg];
      }
      if (Array.isArray(target)) {
        target.splice(index, 1);
      }
      return clone;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`${API}/api/admin/page-content/${activeKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payload: currentPayload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save page content.");

      // Invalidate frontend local storage caches so public pages immediately refresh
      try {
        localStorage.removeItem("our_mission_template_v1");
        localStorage.removeItem("help_center_template_v1");
        localStorage.removeItem("plant_finder_template_v1");
        localStorage.removeItem("plant_health_template_v1");
      } catch {}

      // Dispatch global custom event for open public tabs/listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cozycare:content-updated", { detail: { key: activeKey } }));
      }

      setStatusMessage({
        type: "success",
        text: `✓ ${activePage?.name || "Page"} content saved successfully! Changes are live on the website.`,
      });

      // update in-memory page cache
      setPages((prev) =>
        prev.map((p) =>
          p.key === activeKey
            ? { ...p, payload: currentPayload, updated_at: new Date().toISOString() }
            : p
        )
      );
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, onUploadSuccess: (url: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", "pages");
    try {
      const response = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");
      onUploadSuccess(data.data?.path || "");
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    }
  };

  const activePage = pages.find((p) => p.key === activeKey);
  const PageIcon = PAGE_ICONS[activeKey] || Info;

  return (
    <AdminLayout>
      <div className="admin-page-content-manager" style={{ padding: "1.75rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
            marginBottom: "1.75rem",
            background: "#ffffff",
            padding: "1.5rem 1.75rem",
            borderRadius: "14px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span
                style={{
                  background: "#e8f3ef",
                  color: "#1b4e54",
                  padding: "0.35rem 0.55rem",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <PageIcon size={18} />
              </span>
              <h1 style={{ fontSize: "1.65rem", fontWeight: 700, color: "#102e23", margin: 0 }}>
                Page Content CMS
              </h1>
            </div>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
              Customize and update all public website content, headings, images, and copy visually in real time.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {activePage?.url && (
              <a
                href={activePage.url}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  textDecoration: "none",
                  padding: "0.6rem 1rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                }}
              >
                <Eye size={16} /> View Live Page <ExternalLink size={14} />
              </a>
            )}
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.4rem",
                fontSize: "0.92rem",
                fontWeight: 700,
                backgroundColor: "#1b4e54",
                boxShadow: "0 4px 12px rgba(27, 78, 84, 0.25)",
              }}
            >
              <Save size={18} /> {saving ? "Saving Changes..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.94rem",
              fontWeight: 500,
              background: statusMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: statusMessage.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${statusMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Page Switcher Navigation Bar */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            padding: "0.4rem 0.2rem 0.8rem",
            marginBottom: "1.75rem",
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          {pages.map((page) => {
            const IconComponent = PAGE_ICONS[page.key] || Info;
            const isSelected = activeKey === page.key;
            return (
              <button
                key={page.key}
                type="button"
                onClick={() => handleSelectPage(page.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.15rem",
                  borderRadius: "999px",
                  border: isSelected ? "none" : "1px solid #e2e8f0",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  background: isSelected ? "#1b4e54" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#475569",
                  boxShadow: isSelected ? "0 4px 12px rgba(27, 78, 84, 0.25)" : "none",
                }}
              >
                <IconComponent size={16} />
                {page.name}
              </button>
            );
          })}
        </div>

        {/* Page Content Visual Form */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#102e23" }}>Loading page content...</div>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>Fetching live structure and values from API.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {activeKey === "blogs_page" && (
              <BlogsPageEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                uploadImage={uploadImage}
              />
            )}

            {activeKey === "about_page" && (
              <AboutPageEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
                uploadImage={uploadImage}
              />
            )}

            {activeKey === "our_mission" && (
              <MissionPageEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
                uploadImage={uploadImage}
              />
            )}

            {activeKey === "contact_page" && (
              <ContactPageEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
                uploadImage={uploadImage}
              />
            )}

            {activeKey === "shipping_page" && (
              <ShippingPageEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
                uploadImage={uploadImage}
              />
            )}

            {activeKey === "help_center" && (
              <HelpCenterEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
              />
            )}

            {activeKey === "plant_finder" && (
              <PlantFinderEditor
                payload={currentPayload}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
              />
            )}

            {activeKey === "plant_health" && (
              <PlantHealthEditor
                payload={currentPayload}
                onChange={handleFieldChange}
                onArrayItemChange={handleArrayItemChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
              />
            )}

            {/* Bottom Save Reminder Bar */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1.25rem 1.5rem",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "0.9rem", color: "#475569" }}>
                Done modifying <strong>{activePage?.name}</strong>? Click save to push your changes immediately live.
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving || loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  backgroundColor: "#1b4e54",
                }}
              >
                <Save size={18} /> {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// =========================================================================
// UI Reusable Helpers
// =========================================================================

function EditorCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="admin-editor-card"
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        border: "1px solid #e2e8f0",
        padding: "1.6rem",
      }}
    >
      <div
        style={{
          marginBottom: "1.35rem",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#102e23" }}>{title}</h3>
          {description && <p style={{ margin: "0.3rem 0 0", color: "#64748b", fontSize: "0.86rem" }}>{description}</p>}
        </div>
        {badge && (
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.25rem 0.65rem",
              borderRadius: "999px",
              background: "#e8f3ef",
              color: "#1b4e54",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder = "",
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.35rem" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.65rem 0.85rem",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 0.85rem",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
          }}
        />
      )}
    </div>
  );
}

function ImageUploader({
  label,
  value,
  onChange,
  uploadImage,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  uploadImage: (file: File, cb: (url: string) => void) => void;
}) {
  const [uploading, setUploading] = useState(false);
  return (
    <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
        {label}
      </label>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          background: "#f8fafc",
          padding: "0.75rem",
          borderRadius: "8px",
          border: "1px dashed #cbd5e1",
        }}
      >
        {value ? (
          <img
            src={resolvePageImage(value)}
            alt="Preview"
            style={{
              width: "72px",
              height: "72px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
            }}
          />
        ) : (
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "8px",
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "0.75rem",
              textAlign: "center",
              padding: "4px",
            }}
          >
            No Image
          </div>
        )}
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/example.jpg or uploaded URL"
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              marginBottom: "0.45rem",
              fontSize: "0.85rem",
            }}
          />
          <label
            className="admin-btn admin-btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: uploading ? "wait" : "pointer",
              fontSize: "0.82rem",
              padding: "0.45rem 0.85rem",
              fontWeight: 600,
            }}
          >
            <Upload size={14} />
            {uploading ? "Uploading Image..." : "Upload New Image"}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploading(true);
                  uploadImage(file, (newUrl) => {
                    setUploading(false);
                    onChange(newUrl);
                  });
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 0. Care Blogs Hub Page Editor
// =========================================================================
function BlogsPageEditor({
  payload,
  onChange,
  uploadImage,
}: {
  payload: any;
  onChange: (path: string[], val: any) => void;
  uploadImage: (file: File, cb: (url: string) => void) => void;
}) {
  const hero = payload?.hero || {};
  const newsletter = payload?.newsletter || {};

  const PRESETS = [
    { label: "Lush Conservatory", path: "/images/blog-hero-lush.jpg" },
    { label: "Monstera Macro Leaf", path: "/images/blog-leaf-macro.jpg" },
    { label: "Indoor Green House", path: "/images/about-plants.jpg" },
    { label: "Winter Garden", path: "/images/winter-garden.png" },
  ];

  return (
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
            onChange={(val) => onChange(["hero", "kicker"], val)}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormInput
              label="Main Headline (First Part)"
              value={hero.title_main}
              placeholder="e.g. Stories from the Soil:"
              onChange={(val) => onChange(["hero", "title_main"], val)}
            />
            <FormInput
              label="Headline Accent / Highlight (Emerald Gradient)"
              value={hero.title_highlight}
              placeholder="e.g. Cultivating Life & Serenity"
              onChange={(val) => onChange(["hero", "title_highlight"], val)}
            />
          </div>

          <FormInput
            label="Hero Subtitle / Description"
            value={hero.subtitle}
            multiline
            rows={3}
            placeholder="Deep-dive care handbooks, interior styling guides, Nepal seasonal secrets..."
            onChange={(val) => onChange(["hero", "subtitle"], val)}
          />
        </div>
      </EditorCard>

      {/* Hero Background Image & Presets */}
      <EditorCard
        title="Hero Background Atmosphere"
        description="Choose or upload the background image displayed behind the animated conservatory sunbeams."
        badge="Imagery"
      >
        <ImageUploader
          label="Hero Background Image"
          value={hero.background_image}
          onChange={(val) => onChange(["hero", "background_image"], val)}
          uploadImage={uploadImage}
        />

        <div style={{ marginTop: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem" }}>
            Or Pick a Curated High-Definition Preset
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.path}
                type="button"
                onClick={() => onChange(["hero", "background_image"], preset.path)}
                style={{
                  background: hero.background_image === preset.path ? "#e8f3ef" : "#ffffff",
                  border: `1px solid ${hero.background_image === preset.path ? "#1b4e54" : "#cbd5e1"}`,
                  color: hero.background_image === preset.path ? "#1b4e54" : "#334155",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {hero.background_image === preset.path ? "✓ " : ""}{preset.label}
              </button>
            ))}
          </div>
        </div>
      </EditorCard>

      {/* Search Bar & Trust Badges */}
      <EditorCard
        title="Live Search Configuration & Trust Badges"
        description="Customize the search input placeholder, button label, and the 3 trust metric chips."
        badge="Engagement"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Search Bar Placeholder Text"
            value={hero.search_placeholder}
            placeholder="Search plant species, care problems, monsoon advice, or hacks..."
            onChange={(val) => onChange(["hero", "search_placeholder"], val)}
          />
          <FormInput
            label="Search Action Button Label"
            value={hero.search_button_text}
            placeholder="Find Guides"
            onChange={(val) => onChange(["hero", "search_button_text"], val)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
          <FormInput
            label="Trust Badge 1 (Handbook Count)"
            value={hero.badge_1}
            placeholder="60+ Deep-Dive Guides"
            onChange={(val) => onChange(["hero", "badge_1"], val)}
          />
          <FormInput
            label="Trust Badge 2 (Audience Counter)"
            value={hero.badge_2}
            placeholder="12,000+ Readers in Nepal"
            onChange={(val) => onChange(["hero", "badge_2"], val)}
          />
          <FormInput
            label="Trust Badge 3 (Authority Badge)"
            value={hero.badge_3}
            placeholder="100% Expert Botanist Verified"
            onChange={(val) => onChange(["hero", "badge_3"], val)}
          />
        </div>
      </EditorCard>

      {/* Newsletter Section */}
      <EditorCard
        title="Botanical Club Newsletter Section"
        description="Configure the email newsletter call-to-action banner shown at the bottom of the blog page."
        badge="Conversion"
      >
        <FormInput
          label="Newsletter Section Title"
          value={newsletter.title}
          placeholder="Cultivate a Greener Life Every Weekend"
          onChange={(val) => onChange(["newsletter", "title"], val)}
        />
        <FormInput
          label="Newsletter Description / Value Proposition"
          value={newsletter.subtitle}
          multiline
          rows={2}
          placeholder="Receive handpicked seasonal advice for Kathmandu Valley..."
          onChange={(val) => onChange(["newsletter", "subtitle"], val)}
        />
        <FormInput
          label="Subscribe Button Label"
          value={newsletter.button_text}
          placeholder="Subscribe Free"
          onChange={(val) => onChange(["newsletter", "button_text"], val)}
        />
      </EditorCard>
    </div>
  );
}

// =========================================================================
// 1. About Page Editor
// =========================================================================
function AboutPageEditor({
  payload,
  onChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
  uploadImage,
}: any) {
  const hero = payload.hero || {};
  const stats = Array.isArray(payload.stats) ? payload.stats : [];
  const story = payload.story || {};
  const paragraphs = Array.isArray(story.paragraphs) ? story.paragraphs : [];
  const mission = payload.mission || {};
  const missionCards = Array.isArray(mission.cards) ? mission.cards : [];
  const values = payload.values || {};
  const valueItems = Array.isArray(values.items) ? values.items : [];
  const whyChooseUs = payload.why_choose_us || {};
  const whyItems = Array.isArray(whyChooseUs.items) ? whyChooseUs.items : [];
  const team = payload.team || {};
  const teamMembers = Array.isArray(team.members) ? team.members : [];
  const cta = payload.cta || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Hero */}
      <EditorCard title="Hero Banner" description="Top visual introduction of the About Us page." badge="Hero">
        <FormInput label="Main Title" value={hero.title} onChange={(val) => onChange(["hero", "title"], val)} />
        <FormInput
          label="Subtitle / Lead Narrative"
          multiline
          rows={3}
          value={hero.subtitle}
          onChange={(val) => onChange(["hero", "subtitle"], val)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <FormInput
            label="Primary Button Label"
            value={hero.primary_cta?.label}
            onChange={(val) => onChange(["hero", "primary_cta", "label"], val)}
          />
          <FormInput
            label="Primary Button Link Path"
            value={hero.primary_cta?.path}
            onChange={(val) => onChange(["hero", "primary_cta", "path"], val)}
          />
          <FormInput
            label="Secondary Button Label"
            value={hero.secondary_cta?.label}
            onChange={(val) => onChange(["hero", "secondary_cta", "label"], val)}
          />
          <FormInput
            label="Secondary Button Link Path"
            value={hero.secondary_cta?.path}
            onChange={(val) => onChange(["hero", "secondary_cta", "path"], val)}
          />
        </div>
      </EditorCard>

      {/* Key Stats */}
      <EditorCard
        title="Key Statistics & Trust Metrics"
        description="Badges highlighting customer happiness, experience, and variety."
        badge={`${stats.length} Badges`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {stats.map((stat: any, index: number) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "1rem",
                borderRadius: "10px",
                position: "relative",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["stats"], index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                }}
                title="Remove badge"
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label={`Metric #${index + 1} Number`}
                value={stat.value}
                onChange={(val) => onArrayItemChange(["stats"], index, "value", val)}
                placeholder="10,000+"
              />
              <FormInput
                label="Metric Label"
                value={stat.label}
                onChange={(val) => onArrayItemChange(["stats"], index, "label", val)}
                placeholder="Happy Customers"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onAddArrayItem(["stats"], { value: "100+", label: "New Metric" })}
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Statistic Metric
        </button>
      </EditorCard>

      {/* Story */}
      <EditorCard title="Our Story Section" description="The journey and heartfelt origin of Cozy Care." badge="Story">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput label="Section Kicker" value={story.label} onChange={(val) => onChange(["story", "label"], val)} />
          <FormInput label="Story Title" value={story.title} onChange={(val) => onChange(["story", "title"], val)} />
        </div>

        <ImageUploader
          label="Story Main Image"
          value={story.image}
          onChange={(val) => onChange(["story", "image"], val)}
          uploadImage={uploadImage}
        />
        <FormInput
          label="Story Image Alt Text"
          value={story.image_alt}
          onChange={(val) => onChange(["story", "image_alt"], val)}
        />

        {/* Story Paragraphs */}
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
            Story Paragraphs ({paragraphs.length})
          </label>
          {paragraphs.map((pText: string, pIdx: number) => (
            <div key={pIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <textarea
                  rows={3}
                  value={pText || ""}
                  onChange={(e) => onArrayItemChange(["story", "paragraphs"], pIdx, "", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["story", "paragraphs"], pIdx)}
                style={{
                  background: "#fee2e2",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ef4444",
                  padding: "0.6rem",
                  cursor: "pointer",
                }}
                title="Delete paragraph"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => onAddArrayItem(["story", "paragraphs"], "New story paragraph text goes here.")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Story Paragraph
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Featured Quote Text"
            multiline
            rows={2}
            value={story.quote_text}
            onChange={(val) => onChange(["story", "quote_text"], val)}
          />
          <FormInput
            label="Quote Author / Attribution"
            value={story.quote_author}
            onChange={(val) => onChange(["story", "quote_author"], val)}
          />
        </div>
      </EditorCard>

      {/* Mission & Vision Cards */}
      <EditorCard
        title="Mission & Vision Cards"
        description="Core mission and vision statements displayed side by side."
        badge={`${missionCards.length} Cards`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Section Title"
            value={mission.title}
            onChange={(val) => onChange(["mission", "title"], val)}
          />
          <FormInput
            label="Section Subtitle"
            value={mission.subtitle}
            onChange={(val) => onChange(["mission", "subtitle"], val)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {missionCards.map((card: any, index: number) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "1rem",
                borderRadius: "10px",
                position: "relative",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["mission", "cards"], index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Card Title"
                value={card.title}
                onChange={(val) => onArrayItemChange(["mission", "cards"], index, "title", val)}
              />
              <FormInput
                label="Icon (e.g. Leaf, Globe, Heart)"
                value={card.icon}
                onChange={(val) => onArrayItemChange(["mission", "cards"], index, "icon", val)}
              />
              <FormInput
                label="Statement Body"
                multiline
                rows={4}
                value={card.text}
                onChange={(val) => onArrayItemChange(["mission", "cards"], index, "text", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["mission", "cards"], {
              icon: "Leaf",
              title: "Our Pledge",
              text: "Dedicated to healthy green homes.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Mission Card
        </button>
      </EditorCard>

      {/* Core Values */}
      <EditorCard
        title="Our Core Values"
        description="Guiding principles of care, quality, sustainability, and community."
        badge={`${valueItems.length} Values`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput label="Section Title" value={values.title} onChange={(val) => onChange(["values", "title"], val)} />
          <FormInput
            label="Section Subtitle"
            value={values.subtitle}
            onChange={(val) => onChange(["values", "subtitle"], val)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {valueItems.map((valItem: any, index: number) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "1rem",
                borderRadius: "10px",
                position: "relative",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["values", "items"], index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Value Title"
                value={valItem.title}
                onChange={(val) => onArrayItemChange(["values", "items"], index, "title", val)}
              />
              <FormInput
                label="Icon (e.g. Leaf, Heart, Users, Award)"
                value={valItem.icon}
                onChange={(val) => onArrayItemChange(["values", "items"], index, "icon", val)}
              />
              <FormInput
                label="Description"
                multiline
                rows={3}
                value={valItem.description}
                onChange={(val) => onArrayItemChange(["values", "items"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["values", "items"], {
              icon: "Heart",
              title: "New Value",
              description: "Value description.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Core Value
        </button>
      </EditorCard>

      {/* Why Choose Us */}
      <EditorCard
        title="Why Choose Cozy Care"
        description="Key advantages such as quality guarantee and expert support."
        badge={`${whyItems.length} Features`}
      >
        <FormInput
          label="Section Title"
          value={whyChooseUs.title}
          onChange={(val) => onChange(["why_choose_us", "title"], val)}
        />
        <ImageUploader
          label="Side Showcase Image"
          value={whyChooseUs.image}
          onChange={(val) => onChange(["why_choose_us", "image"], val)}
          uploadImage={uploadImage}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {whyItems.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "1rem",
                borderRadius: "10px",
                position: "relative",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["why_choose_us", "items"], index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Feature Title"
                value={item.title}
                onChange={(val) => onArrayItemChange(["why_choose_us", "items"], index, "title", val)}
              />
              <FormInput
                label="Icon (CheckCircle, HeadphonesIcon, Leaf, Globe)"
                value={item.icon}
                onChange={(val) => onArrayItemChange(["why_choose_us", "items"], index, "icon", val)}
              />
              <FormInput
                label="Description"
                multiline
                rows={2}
                value={item.description}
                onChange={(val) => onArrayItemChange(["why_choose_us", "items"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["why_choose_us", "items"], {
              icon: "CheckCircle",
              title: "Careful Inspection",
              description: "Every plant is inspected before delivery.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Feature Item
        </button>
      </EditorCard>

      {/* Meet Our Team */}
      <EditorCard
        title="Meet Our Team"
        description="Profiles of staff, botanists, and customer support."
        badge={`${teamMembers.length} Members`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput label="Section Title" value={team.title} onChange={(val) => onChange(["team", "title"], val)} />
          <FormInput
            label="Section Subtitle"
            value={team.subtitle}
            onChange={(val) => onChange(["team", "subtitle"], val)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {teamMembers.map((member: any, index: number) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                padding: "1rem",
                borderRadius: "10px",
                position: "relative",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["team", "members"], index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Full Name"
                value={member.name}
                onChange={(val) => onArrayItemChange(["team", "members"], index, "name", val)}
              />
              <FormInput
                label="Role / Title"
                value={member.role}
                onChange={(val) => onArrayItemChange(["team", "members"], index, "role", val)}
              />
              <ImageUploader
                label="Profile Photo"
                value={member.image}
                onChange={(val) => onArrayItemChange(["team", "members"], index, "image", val)}
                uploadImage={uploadImage}
              />
              <FormInput
                label="Bio / Description"
                multiline
                rows={2}
                value={member.bio}
                onChange={(val) => onArrayItemChange(["team", "members"], index, "bio", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["team", "members"], {
              name: "New Member",
              role: "Horticulture Specialist",
              bio: "Passionate about plants.",
              image: "/images/team-sarah.jpg",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Team Member
        </button>
      </EditorCard>

      {/* Bottom CTA */}
      <EditorCard title="Bottom Call to Action Banner" description="Final encouragement banner at page end.">
        <FormInput label="Banner Title" value={cta.title} onChange={(val) => onChange(["cta", "title"], val)} />
        <FormInput
          label="Banner Subtitle"
          multiline
          rows={2}
          value={cta.subtitle}
          onChange={(val) => onChange(["cta", "subtitle"], val)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Primary Button Label"
            value={cta.primary_cta?.label}
            onChange={(val) => onChange(["cta", "primary_cta", "label"], val)}
          />
          <FormInput
            label="Primary Button Link Path"
            value={cta.primary_cta?.path}
            onChange={(val) => onChange(["cta", "primary_cta", "path"], val)}
          />
          <FormInput
            label="Secondary Button Label"
            value={cta.secondary_cta?.label}
            onChange={(val) => onChange(["cta", "secondary_cta", "label"], val)}
          />
          <FormInput
            label="Secondary Button Link Path"
            value={cta.secondary_cta?.path}
            onChange={(val) => onChange(["cta", "secondary_cta", "path"], val)}
          />
        </div>
      </EditorCard>
    </div>
  );
}

// =========================================================================
// 2. Our Mission Page Editor
// =========================================================================
function MissionPageEditor({
  payload,
  onChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
  uploadImage,
}: any) {
  const hero = payload.hero || {};
  const highlights = Array.isArray(hero.highlights) ? hero.highlights : [];
  const story = payload.story || {};
  const bullets = Array.isArray(story.bullets) ? story.bullets : [];
  const pillarsSection = payload.pillars_section || {};
  const pillars = Array.isArray(pillarsSection.pillars) ? pillarsSection.pillars : [];
  const supportSection = payload.support_section || {};
  const supportSteps = Array.isArray(supportSection.steps) ? supportSection.steps : [];
  const vision = payload.vision || {};
  const impact = payload.impact || {};
  const impactGoals = Array.isArray(impact.goals) ? impact.goals : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Hero */}
      <EditorCard title="Mission Hero Header" description="The core purpose statement and showcase banner.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput label="Eyebrow Kicker" value={hero.eyebrow} onChange={(val) => onChange(["hero", "eyebrow"], val)} />
          <FormInput label="Main Hero Title" value={hero.title} onChange={(val) => onChange(["hero", "title"], val)} />
        </div>
        <FormInput
          label="Lead Purpose Paragraph"
          multiline
          rows={3}
          value={hero.lead}
          onChange={(val) => onChange(["hero", "lead"], val)}
        />
        <ImageUploader
          label="Hero Main Visual"
          value={hero.image}
          onChange={(val) => onChange(["hero", "image"], val)}
          uploadImage={uploadImage}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Top Floating Glass Note"
            value={hero.floating_note_top}
            onChange={(val) => onChange(["hero", "floating_note_top"], val)}
          />
          <FormInput
            label="Bottom Floating Glass Note"
            value={hero.floating_note_bottom}
            onChange={(val) => onChange(["hero", "floating_note_bottom"], val)}
          />
        </div>

        {/* Highlights */}
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
            Hero Highlights ({highlights.length})
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
            {highlights.map((h: any, idx: number) => (
              <div key={idx} style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", position: "relative" }}>
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["hero", "highlights"], idx)}
                  style={{ position: "absolute", top: "6px", right: "6px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
                <FormInput
                  label="Title / Highlight"
                  value={h.label}
                  onChange={(val) => onArrayItemChange(["hero", "highlights"], idx, "label", val)}
                />
                <FormInput
                  label="Detail / Subtitle"
                  value={h.value}
                  onChange={(val) => onArrayItemChange(["hero", "highlights"], idx, "value", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => onAddArrayItem(["hero", "highlights"], { label: "New Highlight", value: "Detail text" })}
            style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Hero Highlight
          </button>
        </div>
      </EditorCard>

      {/* Why We Built Cozy Care */}
      <EditorCard title="Why We Built Cozy Care" description="Our origin motive and customer promise bullets.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput label="Kicker Label" value={story.kicker} onChange={(val) => onChange(["story", "kicker"], val)} />
          <FormInput label="Story Title" value={story.title} onChange={(val) => onChange(["story", "title"], val)} />
        </div>
        <FormInput
          label="Story Narrative"
          multiline
          rows={3}
          value={story.description}
          onChange={(val) => onChange(["story", "description"], val)}
        />

        {/* Bullets */}
        <div style={{ margin: "1rem 0" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
            Mission Bullets ({bullets.length})
          </label>
          {bullets.map((bText: string, bIdx: number) => (
            <div key={bIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={bText || ""}
                onChange={(e) => onArrayItemChange(["story", "bullets"], bIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["story", "bullets"], bIdx)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => onAddArrayItem(["story", "bullets"], "New mission bullet point")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Bullet Point
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Quote Text"
            multiline
            rows={2}
            value={story.quote_text}
            onChange={(val) => onChange(["story", "quote_text"], val)}
          />
          <FormInput
            label="Quote Caption"
            value={story.quote_caption}
            onChange={(val) => onChange(["story", "quote_caption"], val)}
          />
        </div>
      </EditorCard>

      {/* Core Pillars */}
      <EditorCard title="Core Pillars" description="The 3 primary principles driving our plant recommendations." badge={`${pillars.length} Pillars`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput
            label="Section Kicker"
            value={pillarsSection.kicker}
            onChange={(val) => onChange(["pillars_section", "kicker"], val)}
          />
          <FormInput
            label="Section Title"
            value={pillarsSection.title}
            onChange={(val) => onChange(["pillars_section", "title"], val)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {pillars.map((pillar: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["pillars_section", "pillars"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Eyebrow Tag (e.g. Learn, Live Better)"
                value={pillar.eyebrow}
                onChange={(val) => onArrayItemChange(["pillars_section", "pillars"], index, "eyebrow", val)}
              />
              <FormInput
                label="Pillar Title"
                value={pillar.title}
                onChange={(val) => onArrayItemChange(["pillars_section", "pillars"], index, "title", val)}
              />
              <FormInput
                label="Description"
                multiline
                rows={3}
                value={pillar.description}
                onChange={(val) => onArrayItemChange(["pillars_section", "pillars"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["pillars_section", "pillars"], {
              eyebrow: "Principle",
              title: "New Pillar",
              description: "Description of the pillar.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Pillar
        </button>
      </EditorCard>

      {/* Support Steps */}
      <EditorCard title="Support Journey Steps" description="Step-by-step path for customer success." badge={`${supportSteps.length} Steps`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput
            label="Section Kicker"
            value={supportSection.kicker}
            onChange={(val) => onChange(["support_section", "kicker"], val)}
          />
          <FormInput
            label="Section Title"
            value={supportSection.title}
            onChange={(val) => onChange(["support_section", "title"], val)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {supportSteps.map((step: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["support_section", "steps"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Step Number (e.g. 01, 02)"
                value={step.step}
                onChange={(val) => onArrayItemChange(["support_section", "steps"], index, "step", val)}
              />
              <FormInput
                label="Step Title"
                value={step.title}
                onChange={(val) => onArrayItemChange(["support_section", "steps"], index, "title", val)}
              />
              <FormInput
                label="Description"
                multiline
                rows={3}
                value={step.description}
                onChange={(val) => onArrayItemChange(["support_section", "steps"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["support_section", "steps"], {
              step: `0${supportSteps.length + 1}`,
              title: "Next Step",
              description: "Step details here.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Journey Step
        </button>
      </EditorCard>

      {/* Vision & Impact */}
      <EditorCard title="Vision & Measurable Impact Goals" description="Long-term vision statement and impact goals.">
        <FormInput label="Vision Kicker" value={vision.kicker} onChange={(val) => onChange(["vision", "kicker"], val)} />
        <FormInput label="Vision Title" value={vision.title} onChange={(val) => onChange(["vision", "title"], val)} />
        <FormInput
          label="Vision Description"
          multiline
          rows={3}
          value={vision.description}
          onChange={(val) => onChange(["vision", "description"], val)}
        />

        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          <FormInput label="Impact Section Kicker" value={impact.kicker} onChange={(val) => onChange(["impact", "kicker"], val)} />
          <FormInput label="Impact Section Title" value={impact.title} onChange={(val) => onChange(["impact", "title"], val)} />
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
            Impact Goals ({impactGoals.length})
          </label>
          {impactGoals.map((goalText: string, gIdx: number) => (
            <div key={gIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={goalText || ""}
                onChange={(e) => onArrayItemChange(["impact", "goals"], gIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["impact", "goals"], gIdx)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => onAddArrayItem(["impact", "goals"], "New measurable impact goal")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Impact Goal
          </button>
        </div>
      </EditorCard>
    </div>
  );
}

// =========================================================================
// 3. Contact Page Editor
// =========================================================================
function ContactPageEditor({
  payload,
  onChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
  uploadImage,
}: any) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Contact Hero */}
      <EditorCard title="Contact Hero & Support Cards" description="Introductory banner and support categories." badge={`${cards.length} Cards`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput label="Eyebrow Kicker" value={hero.eyebrow} onChange={(val) => onChange(["hero", "eyebrow"], val)} />
          <FormInput label="Hero Title" value={hero.title} onChange={(val) => onChange(["hero", "title"], val)} />
        </div>
        <FormInput
          label="Hero Description"
          multiline
          rows={3}
          value={hero.description}
          onChange={(val) => onChange(["hero", "description"], val)}
        />

        <h4 style={{ margin: "1.25rem 0 0.5rem", fontSize: "0.95rem", color: "#102e23" }}>Support Cards</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {cards.map((card: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["hero", "cards"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Card Title"
                value={card.title}
                onChange={(val) => onArrayItemChange(["hero", "cards"], index, "title", val)}
              />
              <FormInput
                label="Card Description"
                multiline
                rows={2}
                value={card.description}
                onChange={(val) => onArrayItemChange(["hero", "cards"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onAddArrayItem(["hero", "cards"], { title: "New Support Category", description: "Category description." })}
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Support Card
        </button>
      </EditorCard>

      {/* Support Channels & Promises */}
      <EditorCard title="Support Channels & Company Information" description="Email, phone, working hours, and promises." badge={`${details.length} Details`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
          <FormInput label="Section Eyebrow" value={info.eyebrow} onChange={(val) => onChange(["info", "eyebrow"], val)} />
          <FormInput label="Section Title" value={info.title} onChange={(val) => onChange(["info", "title"], val)} />
        </div>
        <FormInput
          label="Section Description"
          multiline
          rows={2}
          value={info.description}
          onChange={(val) => onChange(["info", "description"], val)}
        />

        {/* Details list */}
        <h4 style={{ margin: "1.25rem 0 0.5rem", fontSize: "0.95rem", color: "#102e23" }}>Contact Channels & Hours</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {details.map((detail: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["info", "details"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Channel Label"
                value={detail.label}
                onChange={(val) => onArrayItemChange(["info", "details"], index, "label", val)}
              />
              <FormInput
                label="Channel Value / Detail"
                value={detail.value}
                onChange={(val) => onArrayItemChange(["info", "details"], index, "value", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onAddArrayItem(["info", "details"], { label: "New Channel", value: "Details" })}
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Contact Detail
        </button>

        {/* Promises */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
            Our Promises Checklist ({promises.length})
          </label>
          {promises.map((pText: string, pIdx: number) => (
            <div key={pIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={pText || ""}
                onChange={(e) => onArrayItemChange(["info", "promises"], pIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["info", "promises"], pIdx)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => onAddArrayItem(["info", "promises"], "New customer support promise")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Promise
          </button>
        </div>

        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          <FormInput
            label="Help Tip Box Title"
            value={info.note_title}
            onChange={(val) => onChange(["info", "note_title"], val)}
          />
          <FormInput
            label="Help Tip Box Description"
            multiline
            rows={2}
            value={info.note_description}
            onChange={(val) => onChange(["info", "note_description"], val)}
          />
        </div>
      </EditorCard>

      {/* Form Configuration */}
      <EditorCard title="Support Form Settings & Placeholders" description="Input titles, placeholder text, and submit buttons.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput label="Form Card Title" value={form.title} onChange={(val) => onChange(["form", "title"], val)} />
          <FormInput label="Form Card Description" value={form.description} onChange={(val) => onChange(["form", "description"], val)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <FormInput label="Name Placeholder" value={form.name_placeholder} onChange={(val) => onChange(["form", "name_placeholder"], val)} />
          <FormInput label="Email Placeholder" value={form.email_placeholder} onChange={(val) => onChange(["form", "email_placeholder"], val)} />
          <FormInput label="Phone Placeholder" value={form.phone_placeholder} onChange={(val) => onChange(["form", "phone_placeholder"], val)} />
          <FormInput label="City / Area Placeholder" value={form.city_placeholder} onChange={(val) => onChange(["form", "city_placeholder"], val)} />
          <FormInput label="Order Number Placeholder" value={form.order_placeholder} onChange={(val) => onChange(["form", "order_placeholder"], val)} />
        </div>
        <FormInput
          label="Message Textarea Placeholder"
          value={form.message_placeholder}
          onChange={(val) => onChange(["form", "message_placeholder"], val)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput label="Submit Button Label" value={form.button_label} onChange={(val) => onChange(["form", "button_label"], val)} />
          <FormInput label="Submitting Status Label" value={form.submitting_label} onChange={(val) => onChange(["form", "submitting_label"], val)} />
        </div>
        <FormInput label="Form Bottom Note" value={form.note} onChange={(val) => onChange(["form", "note"], val)} />

        {/* Subject and Contact Method Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
              Inquiry Subject Options ({subjectOptions.length})
            </label>
            {subjectOptions.map((opt: any, sIdx: number) => (
              <div key={sIdx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <input
                  type="text"
                  placeholder="Label"
                  value={opt.label || ""}
                  onChange={(e) => onArrayItemChange(["form", "subject_options"], sIdx, "label", e.target.value)}
                  style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["form", "subject_options"], sIdx)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: "4px", color: "#ef4444", padding: "0.4rem", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddArrayItem(["form", "subject_options"], { value: `subj_${Date.now()}`, label: "New Inquiry Topic" })}
              style={{
                background: "none",
                border: "1px dashed #94a3b8",
                padding: "0.35rem 0.7rem",
                borderRadius: "4px",
                fontSize: "0.78rem",
                cursor: "pointer",
                color: "#475569",
              }}
            >
              + Add Subject Option
            </button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
              Preferred Contact Methods ({contactMethodOptions.length})
            </label>
            {contactMethodOptions.map((opt: any, cIdx: number) => (
              <div key={cIdx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <input
                  type="text"
                  placeholder="Label"
                  value={opt.label || ""}
                  onChange={(e) => onArrayItemChange(["form", "contact_method_options"], cIdx, "label", e.target.value)}
                  style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["form", "contact_method_options"], cIdx)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: "4px", color: "#ef4444", padding: "0.4rem", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddArrayItem(["form", "contact_method_options"], { value: `method_${Date.now()}`, label: "New Contact Method" })}
              style={{
                background: "none",
                border: "1px dashed #94a3b8",
                padding: "0.35rem 0.7rem",
                borderRadius: "4px",
                fontSize: "0.78rem",
                cursor: "pointer",
                color: "#475569",
              }}
            >
              + Add Contact Method
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
                onClick={() => onRemoveArrayItem(["banner_images"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <ImageUploader
                label={`Photo #${index + 1}`}
                value={imgItem.image}
                onChange={(val) => onArrayItemChange(["banner_images"], index, "image", val)}
                uploadImage={uploadImage}
              />
              <FormInput
                label="Alt Description"
                value={imgItem.alt}
                onChange={(val) => onArrayItemChange(["banner_images"], index, "alt", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onAddArrayItem(["banner_images"], { image: "/images/nepal-mountains.jpg", alt: "Nepal Landscape" })}
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Gallery Photo
        </button>
      </EditorCard>
    </div>
  );
}

// =========================================================================
// 4. Shipping & Delivery Editor
// =========================================================================
function ShippingPageEditor({
  payload,
  onChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
  uploadImage,
}: any) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Hero */}
      <EditorCard title="Hero Banner & Title Lines" description="Header banner for Shipping & Delivery.">
        <ImageUploader
          label="Hero Background Image"
          value={hero.background_image}
          onChange={(val) => onChange(["hero", "background_image"], val)}
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
              onChange={(e) => onArrayItemChange(["hero", "title_lines"], lIdx, "", e.target.value)}
              style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
            />
            <button
              type="button"
              onClick={() => onRemoveArrayItem(["hero", "title_lines"], lIdx)}
              style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onAddArrayItem(["hero", "title_lines"], "New Title Line")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", marginBottom: "1rem" }}
        >
          <Plus size={14} /> Add Title Line
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Hero Button Label"
            value={hero.button_label}
            onChange={(val) => onChange(["hero", "button_label"], val)}
          />
          <FormInput
            label="Hero Button Path"
            value={hero.button_path}
            onChange={(val) => onChange(["hero", "button_path"], val)}
          />
        </div>
      </EditorCard>

      {/* About Delivery & Packaging */}
      <EditorCard title="How We Deliver & Packaging" description="Story behind eco-friendly packaging and plant handling.">
        <FormInput label="Section Title" value={about.title} onChange={(val) => onChange(["about", "title"], val)} />
        <FormInput
          label="Packaging Description"
          multiline
          rows={3}
          value={about.description}
          onChange={(val) => onChange(["about", "description"], val)}
        />
        <ImageUploader
          label="Packaging Showcase Image"
          value={about.image}
          onChange={(val) => onChange(["about", "image"], val)}
          uploadImage={uploadImage}
        />
        <FormInput
          label="Image Alt Text"
          value={about.image_alt}
          onChange={(val) => onChange(["about", "image_alt"], val)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Button Label"
            value={about.button_label}
            onChange={(val) => onChange(["about", "button_label"], val)}
          />
          <FormInput
            label="Button Path"
            value={about.button_path}
            onChange={(val) => onChange(["about", "button_path"], val)}
          />
        </div>
      </EditorCard>

      {/* Delivery Options */}
      <EditorCard title="Delivery Options & Coverage" description="Same-day delivery, valley-wide, or outside valley." badge={`${deliveryOptions.length} Options`}>
        <FormInput label="Section Title" value={delivery.title} onChange={(val) => onChange(["delivery", "title"], val)} />
        <ImageUploader
          label="Delivery Representative Image"
          value={delivery.image}
          onChange={(val) => onChange(["delivery", "image"], val)}
          uploadImage={uploadImage}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {deliveryOptions.map((opt: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["delivery", "options"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Option Title"
                value={opt.title}
                onChange={(val) => onArrayItemChange(["delivery", "options"], index, "title", val)}
              />
              <FormInput
                label="Option Description"
                multiline
                rows={2}
                value={opt.description}
                onChange={(val) => onArrayItemChange(["delivery", "options"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["delivery", "options"], {
              title: "Express Same-Day",
              description: "Delivery within 24 hours.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Delivery Option
        </button>
      </EditorCard>

      {/* Benefits */}
      <EditorCard title="Why Choose Us (Benefits)" description="Key safety and shipping assurances." badge={`${benefitItems.length} Benefits`}>
        <FormInput label="Section Title" value={benefits.title} onChange={(val) => onChange(["benefits", "title"], val)} />
        <ImageUploader
          label="Benefits Image"
          value={benefits.image}
          onChange={(val) => onChange(["benefits", "image"], val)}
          uploadImage={uploadImage}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {benefitItems.map((item: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["benefits", "items"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Benefit Title"
                value={item.title}
                onChange={(val) => onArrayItemChange(["benefits", "items"], index, "title", val)}
              />
              <FormInput
                label="Benefit Description"
                multiline
                rows={2}
                value={item.description}
                onChange={(val) => onArrayItemChange(["benefits", "items"], index, "description", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["benefits", "items"], {
              title: "Care Guarantee",
              description: "Guaranteed healthy transit.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Benefit
        </button>
      </EditorCard>

      {/* Customer Testimonials */}
      <EditorCard title="Customer Reviews & Testimonials" description="Social proof from happy customers." badge={`${testimonialItems.length} Reviews`}>
        <FormInput
          label="Testimonials Section Title"
          value={testimonials.title}
          onChange={(val) => onChange(["testimonials", "title"], val)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          {testimonialItems.map((item: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1.2rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["testimonials", "items"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                <FormInput
                  label="Customer Name"
                  value={item.name}
                  onChange={(val) => onArrayItemChange(["testimonials", "items"], index, "name", val)}
                />
                <FormInput
                  label="Star Rating (1-5)"
                  value={item.rating}
                  onChange={(val) => onArrayItemChange(["testimonials", "items"], index, "rating", Number(val) || 5)}
                />
              </div>
              <FormInput
                label="Role / Customer Label"
                value={item.role}
                onChange={(val) => onArrayItemChange(["testimonials", "items"], index, "role", val)}
              />
              <ImageUploader
                label="Avatar / Reviewer Photo"
                value={item.image}
                onChange={(val) => onArrayItemChange(["testimonials", "items"], index, "image", val)}
                uploadImage={uploadImage}
              />
              <FormInput
                label="Customer Quote"
                multiline
                rows={2}
                value={item.quote}
                onChange={(val) => onArrayItemChange(["testimonials", "items"], index, "quote", val)}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id={`featured-${index}`}
                  checked={Boolean(item.featured)}
                  onChange={(e) => onArrayItemChange(["testimonials", "items"], index, "featured", e.target.checked)}
                />
                <label htmlFor={`featured-${index}`} style={{ fontSize: "0.85rem", color: "#334155", cursor: "pointer" }}>
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
            onAddArrayItem(["testimonials", "items"], {
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
  );
}

// =========================================================================
// 5. Help Center Editor
// =========================================================================
function HelpCenterEditor({
  payload,
  onChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: any) {
  const faqItems = Array.isArray(payload.faq_items) ? payload.faq_items : [];
  const categories = Array.isArray(payload.categories) ? payload.categories : [];
  const topicCards = Array.isArray(payload.topic_cards) ? payload.topic_cards : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Support Intro & Contact Channels */}
      <EditorCard title="Support Desk & Contact Channels" description="Support intro, dedicated contact phone and email address.">
        <FormInput
          label="Support Intro Banner"
          multiline
          rows={2}
          value={payload.support_intro}
          onChange={(val) => onChange(["support_intro"], val)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormInput
            label="Support Phone Number"
            value={payload.contact_phone}
            onChange={(val) => onChange(["contact_phone"], val)}
          />
          <FormInput
            label="Support Email Address"
            value={payload.contact_email}
            onChange={(val) => onChange(["contact_email"], val)}
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
                onClick={() => onRemoveArrayItem(["categories"], index)}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Category Key (e.g. shipping, orders)"
                value={cat.key}
                onChange={(val) => onArrayItemChange(["categories"], index, "key", val)}
              />
              <FormInput
                label="Category Display Label"
                value={cat.label}
                onChange={(val) => onArrayItemChange(["categories"], index, "label", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["categories"], {
              key: `category_${Date.now()}`,
              label: "New Category",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Category
        </button>
      </EditorCard>

      {/* Topic Cards */}
      <EditorCard title="Help Topic Cards" description="Featured topic cards shown at the top of Help Center." badge={`${topicCards.length} Topics`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {topicCards.map((topic: any, index: number) => {
            const points = Array.isArray(topic.points) ? topic.points : [];
            return (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["topic_cards"], index)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Topic Title"
                  value={topic.title}
                  onChange={(val) => onArrayItemChange(["topic_cards"], index, "title", val)}
                />
                <FormInput
                  label="Icon (Package, RotateCcw, CreditCard, Truck)"
                  value={topic.icon}
                  onChange={(val) => onArrayItemChange(["topic_cards"], index, "icon", val)}
                />
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#475569", margin: "0.5rem 0 0.25rem" }}>
                  Bullet Points ({points.length})
                </label>
                {points.map((pt: string, ptIdx: number) => (
                  <div key={ptIdx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                    <input
                      type="text"
                      value={pt || ""}
                      onChange={(e) => onArrayItemChange(["topic_cards", index, "points"], ptIdx, "", e.target.value)}
                      style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveArrayItem(["topic_cards", index, "points"], ptIdx)}
                      style={{ background: "#fee2e2", border: "none", borderRadius: "4px", color: "#ef4444", padding: "0.4rem", cursor: "pointer" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onAddArrayItem(["topic_cards", index, "points"], "New topic point")}
                  style={{
                    background: "none",
                    border: "1px dashed #94a3b8",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "4px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  + Add Point
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["topic_cards"], {
              id: `topic_${Date.now()}`,
              icon: "Package",
              title: "New Topic",
              points: ["First point", "Second point"],
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Topic Card
        </button>
      </EditorCard>

      {/* FAQ Items */}
      <EditorCard title="Frequently Asked Questions (FAQs)" description="Questions and answers organized by category." badge={`${faqItems.length} FAQs`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqItems.map((faq: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["faq_items"], index)}
                style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1rem" }}>
                <FormInput
                  label="Question"
                  value={faq.question}
                  onChange={(val) => onArrayItemChange(["faq_items"], index, "question", val)}
                />
                <FormInput
                  label="Category Key"
                  value={faq.category}
                  onChange={(val) => onArrayItemChange(["faq_items"], index, "category", val)}
                />
              </div>
              <FormInput
                label="Detailed Answer"
                multiline
                rows={3}
                value={faq.answer}
                onChange={(val) => onArrayItemChange(["faq_items"], index, "answer", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["faq_items"], {
              id: Date.now(),
              category: "general",
              question: "New Frequently Asked Question?",
              answer: "Here is the helpful, detailed answer.",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add FAQ Question
        </button>
      </EditorCard>
    </div>
  );
}

// =========================================================================
// 6. Plant Finder Editor
// =========================================================================
function PlantFinderEditor({
  payload,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: any) {
  const roomOptions = Array.isArray(payload.room_options) ? payload.room_options : [];
  const lightOptions = Array.isArray(payload.light_options) ? payload.light_options : [];
  const experienceOptions = Array.isArray(payload.experience_options) ? payload.experience_options : [];
  const locationOptions = Array.isArray(payload.location_options) ? payload.location_options : [];
  const nonPlantCategories = Array.isArray(payload.non_plant_categories) ? payload.non_plant_categories : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Room Options */}
      <EditorCard title="Room Quiz Options" description="Rooms available in the plant matching quiz." badge={`${roomOptions.length} Rooms`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {roomOptions.map((opt: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["room_options"], index)}
                style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Value / Key"
                value={opt.value}
                onChange={(val) => onArrayItemChange(["room_options"], index, "value", val)}
              />
              <FormInput
                label="Display Label"
                value={opt.label}
                onChange={(val) => onArrayItemChange(["room_options"], index, "label", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["room_options"], {
              value: `room_${Date.now()}`,
              label: "New Room",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Room Option
        </button>
      </EditorCard>

      {/* Light Options */}
      <EditorCard title="Light Conditions" description="Lighting levels selectable by quiz users." badge={`${lightOptions.length} Conditions`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {lightOptions.map((opt: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["light_options"], index)}
                style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Value / Key"
                value={opt.value}
                onChange={(val) => onArrayItemChange(["light_options"], index, "value", val)}
              />
              <FormInput
                label="Display Label"
                value={opt.label}
                onChange={(val) => onArrayItemChange(["light_options"], index, "label", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["light_options"], {
              value: `light_${Date.now()}`,
              label: "New Light Condition",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Light Option
        </button>
      </EditorCard>

      {/* Experience Levels */}
      <EditorCard title="Care Experience Levels" description="Skill levels to match plant maintenance requirements." badge={`${experienceOptions.length} Levels`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {experienceOptions.map((opt: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["experience_options"], index)}
                style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Value / Key"
                value={opt.value}
                onChange={(val) => onArrayItemChange(["experience_options"], index, "value", val)}
              />
              <FormInput
                label="Display Label"
                value={opt.label}
                onChange={(val) => onArrayItemChange(["experience_options"], index, "label", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["experience_options"], {
              value: `exp_${Date.now()}`,
              label: "New Level",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Experience Level
        </button>
      </EditorCard>

      {/* Location / Humidity */}
      <EditorCard title="Humidity / Atmosphere Conditions" description="Atmospheric environment options." badge={`${locationOptions.length} Conditions`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {locationOptions.map((opt: any, index: number) => (
            <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["location_options"], index)}
                style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
              <FormInput
                label="Value / Key"
                value={opt.value}
                onChange={(val) => onArrayItemChange(["location_options"], index, "value", val)}
              />
              <FormInput
                label="Display Label"
                value={opt.label}
                onChange={(val) => onArrayItemChange(["location_options"], index, "label", val)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["location_options"], {
              value: `loc_${Date.now()}`,
              label: "New Humidity Condition",
            })
          }
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Humidity Option
        </button>
      </EditorCard>

      {/* Non-Plant Categories */}
      <EditorCard title="Exclude Non-Plant Categories" description="Product categories to exclude when recommending plants (e.g. Pots, Tools)." badge={`${nonPlantCategories.length} Categories`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {nonPlantCategories.map((catName: string, cIdx: number) => (
            <span
              key={cIdx}
              style={{
                background: "#f1f5f9",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                color: "#334155",
              }}
            >
              {catName}
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["non_plant_categories"], cIdx)}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}
              >
                <Trash2 size={14} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", maxWidth: "360px" }}>
          <input
            type="text"
            id="newCategoryInput"
            placeholder="Category to exclude (e.g. Fertilizer)"
            style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
          />
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              const input = document.getElementById("newCategoryInput") as HTMLInputElement;
              if (input && input.value.trim()) {
                onAddArrayItem(["non_plant_categories"], input.value.trim());
                input.value = "";
              }
            }}
          >
            Add
          </button>
        </div>
      </EditorCard>
    </div>
  );
}

// =========================================================================
// 7. Plant Health Checker Editor
// =========================================================================
function PlantHealthEditor({
  payload,
  onChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: any) {
  const symptomCategories = Array.isArray(payload.symptom_categories) ? payload.symptom_categories : [];
  const healthyHabits = Array.isArray(payload.healthy_plant_habits) ? payload.healthy_plant_habits : [];
  const plantTypeOptions = Array.isArray(payload.plant_type_options) ? payload.plant_type_options : [];
  const environmentOptions = Array.isArray(payload.environment_options) ? payload.environment_options : [];
  const soilOptions = Array.isArray(payload.soil_options) ? payload.soil_options : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Symptom Categories & Symptoms */}
      <EditorCard
        title="Symptom Categories & Symptoms Tree"
        description="Categories (leaves, water, light, pests) and their selectable symptoms."
        badge={`${symptomCategories.length} Categories`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {symptomCategories.map((cat: any, cIdx: number) => {
            const symptoms = Array.isArray(cat.symptoms) ? cat.symptoms : [];
            return (
              <div
                key={cIdx}
                style={{
                  background: "#f8fafc",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  position: "relative",
                }}
              >
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["symptom_categories"], cIdx)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                  title="Remove Category"
                >
                  <Trash2 size={18} />
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <FormInput
                    label="Category Identifier"
                    value={cat.id}
                    onChange={(val) => onArrayItemChange(["symptom_categories"], cIdx, "id", val)}
                  />
                  <FormInput
                    label="Category Display Name"
                    value={cat.name}
                    onChange={(val) => onArrayItemChange(["symptom_categories"], cIdx, "name", val)}
                  />
                  <FormInput
                    label="Icon (Leaf, Droplets, Sun, Bug)"
                    value={cat.icon}
                    onChange={(val) => onArrayItemChange(["symptom_categories"], cIdx, "icon", val)}
                  />
                </div>

                {/* Symptoms in this category */}
                <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", color: "#102e23" }}>
                    Symptoms in {cat.name || cat.id} ({symptoms.length})
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
                    {symptoms.map((sym: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        style={{
                          background: "#f8fafc",
                          padding: "0.85rem",
                          borderRadius: "8px",
                          position: "relative",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onRemoveArrayItem(["symptom_categories", cIdx, "symptoms"], sIdx)}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        <FormInput
                          label="Symptom Name"
                          value={sym.name}
                          onChange={(val) => onArrayItemChange(["symptom_categories", cIdx, "symptoms"], sIdx, "name", val)}
                        />
                        <FormInput
                          label="Short Description"
                          value={sym.description}
                          onChange={(val) => onArrayItemChange(["symptom_categories", cIdx, "symptoms"], sIdx, "description", val)}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() =>
                      onAddArrayItem(["symptom_categories", cIdx, "symptoms"], {
                        id: `symptom_${Date.now()}`,
                        name: "New Symptom",
                        description: "Symptom description.",
                      })
                    }
                    style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
                  >
                    <Plus size={14} /> Add Symptom to {cat.name || cat.id}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() =>
            onAddArrayItem(["symptom_categories"], {
              id: `cat_${Date.now()}`,
              name: "New Category",
              icon: "Leaf",
              symptoms: [],
            })
          }
          style={{ marginTop: "1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add New Symptom Category
        </button>
      </EditorCard>

      {/* Plant Type & Environment Snapshot Options */}
      <EditorCard title="Diagnostic Snapshot Options" description="Plant types, rooms, and soil conditions." badge="Diagnostic Setup">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {/* Plant Types */}
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.92rem", color: "#102e23" }}>
              Plant Types ({plantTypeOptions.length})
            </h4>
            {plantTypeOptions.map((opt: any, idx: number) => (
              <div key={idx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <input
                  type="text"
                  value={opt.label || opt.name || ""}
                  onChange={(e) => onArrayItemChange(["plant_type_options"], idx, "label", e.target.value)}
                  style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["plant_type_options"], idx)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: "4px", color: "#ef4444", padding: "0.4rem", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddArrayItem(["plant_type_options"], { id: `type_${Date.now()}`, label: "New Plant Type" })}
              style={{
                background: "none",
                border: "1px dashed #94a3b8",
                padding: "0.35rem 0.7rem",
                borderRadius: "4px",
                fontSize: "0.78rem",
                cursor: "pointer",
                color: "#475569",
              }}
            >
              + Add Type
            </button>
          </div>

          {/* Environment Options */}
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.92rem", color: "#102e23" }}>
              Environment / Room Options ({environmentOptions.length})
            </h4>
            {environmentOptions.map((opt: any, idx: number) => (
              <div key={idx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <input
                  type="text"
                  value={opt.label || opt.name || ""}
                  onChange={(e) => onArrayItemChange(["environment_options"], idx, "label", e.target.value)}
                  style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["environment_options"], idx)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: "4px", color: "#ef4444", padding: "0.4rem", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddArrayItem(["environment_options"], { id: `env_${Date.now()}`, label: "New Environment" })}
              style={{
                background: "none",
                border: "1px dashed #94a3b8",
                padding: "0.35rem 0.7rem",
                borderRadius: "4px",
                fontSize: "0.78rem",
                cursor: "pointer",
                color: "#475569",
              }}
            >
              + Add Environment
            </button>
          </div>

          {/* Soil Options */}
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.92rem", color: "#102e23" }}>
              Soil Conditions ({soilOptions.length})
            </h4>
            {soilOptions.map((opt: any, idx: number) => (
              <div key={idx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <input
                  type="text"
                  value={opt.label || opt.name || ""}
                  onChange={(e) => onArrayItemChange(["soil_options"], idx, "label", e.target.value)}
                  style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem(["soil_options"], idx)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: "4px", color: "#ef4444", padding: "0.4rem", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddArrayItem(["soil_options"], { id: `soil_${Date.now()}`, label: "New Soil Condition" })}
              style={{
                background: "none",
                border: "1px dashed #94a3b8",
                padding: "0.35rem 0.7rem",
                borderRadius: "4px",
                fontSize: "0.78rem",
                cursor: "pointer",
                color: "#475569",
              }}
            >
              + Add Soil State
            </button>
          </div>
        </div>
      </EditorCard>

      {/* Healthy Plant Habits */}
      <EditorCard title="Healthy Plant Habits & Advice" description="General care tips displayed in the health checker." badge={`${healthyHabits.length} Habits`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {healthyHabits.map((habit: any, index: number) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={typeof habit === "string" ? habit : habit.title || habit.description || ""}
                onChange={(e) => onArrayItemChange(["healthy_plant_habits"], index, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => onRemoveArrayItem(["healthy_plant_habits"], index)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onAddArrayItem(["healthy_plant_habits"], "Check moisture before watering to prevent root rot.")}
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> Add Healthy Habit
        </button>
      </EditorCard>

      {/* Default Diagnosis Guidance */}
      <EditorCard title="Default Diagnosis Fallback Guidance" description="Shown when symptoms do not match a specific condition.">
        <FormInput
          label="Default Diagnosis Title"
          value={payload.default_diagnosis?.title}
          onChange={(val) => onChange(["default_diagnosis", "title"], val)}
        />
        <FormInput
          label="Default Diagnosis Summary"
          multiline
          rows={3}
          value={payload.default_diagnosis?.description}
          onChange={(val) => onChange(["default_diagnosis", "description"], val)}
        />
      </EditorCard>
    </div>
  );
}

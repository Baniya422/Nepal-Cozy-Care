import { useEffect, useState, type ReactNode } from "react";
import {
  ExternalLink,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import { compressImage } from "../../../utils/imageCompressor";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export function resolvePageImage(path: string): string {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
  return `${API}/storage/${path}`;
}

export function EditorCard({
  title,
  description,
  badge,
  id,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  id?: string;
  children: ReactNode;
}) {
  const sectionId = id || `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section
      id={sectionId}
      className="admin-editor-card"
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        border: "1px solid #e2e8f0",
        padding: "1.6rem",
        scrollMarginTop: "140px",
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

export function FormInput({
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

export function ImageUploader({
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
            placeholder="Image URL or upload a file"
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          />
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.4rem 0.8rem",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: uploading ? "wait" : "pointer",
              color: "#334155",
            }}
          >
            <Upload size={14} />
            {uploading ? "Uploading & Compressing..." : "Upload & Optimize Image"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              disabled={uploading}
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

export type UsePageEditorOptions = {
  pageKey: string;
  pageName: string;
  pageUrl: string;
};

export function usePageContentEditor({ pageKey, pageName }: UsePageEditorOptions) {
  const [payload, setPayload] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setStatusMessage(null);
      try {
        const response = await fetch(`${API}/api/admin/page-content`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const pageList = data.data?.pages || [];
          const found = pageList.find((p: any) => p.key === pageKey);
          if (found && isMounted && found.payload) {
            setPayload(JSON.parse(JSON.stringify(found.payload)));
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatusMessage({ type: "error", text: "Failed to load content." });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void loadContent();
    return () => {
      isMounted = false;
    };
  }, [pageKey, token]);

  const handleFieldChange = (path: (string | number)[], value: any) => {
    setPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target: any = clone;
      for (let i = 0; i < path.length - 1; i++) {
        const seg = path[i];
        if (target[seg] === undefined || target[seg] === null) {
          const nextSeg = path[i + 1];
          target[seg] = typeof nextSeg === "number" ? [] : {};
        }
        target = target[seg];
      }
      target[path[path.length - 1]] = value;
      return clone;
    });
  };

  const handleArrayItemChange = (arrayPath: (string | number)[], index: number, field: string, value: any) => {
    setPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target: any = clone;
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

  const handleAddArrayItem = (arrayPath: (string | number)[], itemTemplate: any) => {
    setPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target: any = clone;
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

  const handleRemoveArrayItem = (arrayPath: (string | number)[], index: number) => {
    setPayload((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let target: any = clone;
      for (const seg of arrayPath) {
        if (!target[seg]) return clone;
        target = target[seg];
      }
      if (Array.isArray(target) && target[index] !== undefined) {
        target.splice(index, 1);
      }
      return clone;
    });
  };

  const uploadImage = async (file: File, onUploadSuccess: (url: string) => void) => {
    try {
      const compressed = await compressImage(file, { maxWidth: 1600, quality: 0.82 });
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("directory", "pages");
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

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const response = await fetch(`${API}/api/admin/page-content/${pageKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save page content.");

      try {
        localStorage.removeItem(`${pageKey}_template_v1`);
      } catch {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cozycare:content-updated", { detail: { key: pageKey } }));
      }

      setStatusMessage({
        type: "success",
        text: `✓ ${pageName} content saved successfully! Changes are immediately live on the website.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  return {
    payload,
    setPayload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    uploadImage,
    handleSave,
  };
}

export function PageEditorShell({
  title,
  subtitle,
  icon: Icon,
  pageUrl,
  saving,
  loading,
  statusMessage,
  onSave,
  sections,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  pageUrl: string;
  saving: boolean;
  loading: boolean;
  statusMessage: { type: "success" | "error"; text: string } | null;
  onSave: () => void;
  sections?: { id: string; label: string }[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [navSections, setNavSections] = useState<{ id: string; label: string }[]>(sections || []);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  useEffect(() => {
    if (sections && sections.length > 0) {
      setNavSections(sections);
      return;
    }
    const scan = () => {
      const cards = document.querySelectorAll<HTMLElement>(".admin-editor-card");
      if (cards.length === 0) return false;
      const discovered: { id: string; label: string }[] = [];
      cards.forEach((card, idx) => {
        const heading = card.querySelector("h3");
        const headingTitle = heading?.textContent?.trim() || `Section ${idx + 1}`;
        if (!card.id) {
          card.id = `sec-${idx}-${headingTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        }
        discovered.push({ id: card.id, label: headingTitle });
      });
      setNavSections(discovered);
      return true;
    };

    scan();
    const t1 = setTimeout(scan, 80);
    const t2 = setTimeout(scan, 250);
    const t3 = setTimeout(scan, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [sections, loading]);

  useEffect(() => {
    if (navSections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0.1,
      }
    );
    navSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navSections]);

  const scrollToSection = (secId: string) => {
    setActiveSectionId(secId);
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
      el.style.borderColor = "#10b981";
      el.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.3)";
      setTimeout(() => {
        el.style.borderColor = "#e2e8f0";
        el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
      }, 1600);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-content-manager" style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Breadcrumb / Top Bar */}
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/page-content")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "none",
              border: "none",
              color: "#1b4e54",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              padding: "0.25rem 0",
            }}
          >
            <ArrowLeft size={16} /> Back to Website Pages Hub
          </button>
        </div>

        {/* Header section */}
        <div
          className="admin-page-content-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
            marginBottom: "1.5rem",
            background: "#ffffff",
            padding: "1.5rem 1.75rem",
            borderRadius: "14px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#e8f3ef",
                color: "#1b4e54",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#102e23" }}>{title}</h1>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.92rem" }}>{subtitle}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#334155",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                padding: "0.55rem 1rem",
                borderRadius: "8px",
              }}
            >
              <ExternalLink size={15} /> Visit Live Page
            </a>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={onSave}
              disabled={saving || loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.92rem",
                fontWeight: 700,
                backgroundColor: "#1b4e54",
                padding: "0.55rem 1.3rem",
                borderRadius: "8px",
                color: "#ffffff",
                border: "none",
                cursor: saving || loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(27, 78, 84, 0.25)",
              }}
            >
              <Save size={17} /> {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Sticky Quick-Jump Section Navigation Bar */}
        {navSections.length > 0 && (
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
                {navSections.length}
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
              {navSections.map((sec, idx) => {
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
        )}

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

        {/* Main Body */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            <div className="admin-spinner" style={{ margin: "0 auto 1rem" }} />
            <p>Loading {title} content...</p>
          </div>
        ) : (
          <div>
            {children}

            {/* Bottom Save Reminder Bar */}
            <div
              style={{
                marginTop: "2rem",
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
                Done modifying <strong>{title}</strong>? Click save to push your changes immediately live.
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={onSave}
                disabled={saving || loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  backgroundColor: "#1b4e54",
                  color: "#ffffff",
                  borderRadius: "8px",
                  border: "none",
                  cursor: saving || loading ? "not-allowed" : "pointer",
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

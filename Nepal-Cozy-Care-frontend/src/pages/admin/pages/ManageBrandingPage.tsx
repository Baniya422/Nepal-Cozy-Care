import { useState } from "react";
import { Palette, Upload, Trash2, Leaf, RotateCcw } from "lucide-react";
import {
  EditorCard,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";
import { defaultBranding } from "../../../context/BrandingContext";
import { compressImage } from "../../../utils/imageCompressor";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ManageBrandingPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleSave,
  } = usePageContentEditor({
    pageKey: "site_branding",
    pageName: "Website Logo & Branding",
    pageUrl: "/",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const siteName = payload.site_name !== undefined ? payload.site_name : defaultBranding.site_name;
  const siteTagline = payload.site_tagline !== undefined ? payload.site_tagline : defaultBranding.site_tagline;
  const logoUrl = payload.logo_url || "";
  const adminDashboardTitle =
    payload.admin_dashboard_title !== undefined ? payload.admin_dashboard_title : defaultBranding.admin_dashboard_title;
  const footerDescription =
    payload.footer_description !== undefined ? payload.footer_description : defaultBranding.footer_description;

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 600, quality: 0.9 });
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("directory", "branding");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to upload logo image");

      const uploadedUrl = json.data?.url || json.data?.path || "";
      handleFieldChange(["logo_url"], uploadedUrl);
    } catch (err: any) {
      alert(err.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    handleFieldChange(["logo_url"], "");
  };

  const resetAllBranding = () => {
    if (confirm("Reset all website name and logo settings back to Cozy Care defaults?")) {
      handleFieldChange(["site_name"], defaultBranding.site_name);
      handleFieldChange(["site_tagline"], defaultBranding.site_tagline);
      handleFieldChange(["logo_url"], "");
      handleFieldChange(["admin_dashboard_title"], defaultBranding.admin_dashboard_title);
      handleFieldChange(["footer_description"], defaultBranding.footer_description);
    }
  };

  const onCustomSave = async () => {
    await handleSave();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozycare:branding-updated"));
    }
  };

  const SECTIONS = [
    { id: "sec-preview", label: "Live Header Preview" },
    { id: "sec-identity", label: "Site Name & Subtitle" },
    { id: "sec-logo", label: "Website Logo Image" },
    { id: "sec-admin-footer", label: "Admin & Footer Details" },
  ];

  return (
    <PageEditorShell
      title="Website Logo & Brand Identity"
      subtitle="Customize the public storefront name, tagline ('Nepal Plant Studio'), website logo image, and admin dashboard branding across the entire site."
      icon={Palette}
      pageUrl="/"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={onCustomSave}
      sections={SECTIONS}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Live Visual Header Preview */}
        <EditorCard
          id="sec-preview"
          title="Live Navbar Branding Preview"
          description="How your website logo, name, and tagline appear to visitors at the top of every page."
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "1.25rem 1.5rem",
              border: "1px solid #cbd5e1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {/* Header Brand Link Mockup */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #cbd5e1",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#164e43",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                  }}
                >
                  <Leaf size={18} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "#164e43",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {siteName || "Cozy Care"}
                </span>
                {siteTagline ? (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#4a7c59",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginTop: "0.15rem",
                    }}
                  >
                    {siteTagline}
                  </span>
                ) : null}
              </div>
            </div>

            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
              💡 Changes saved here reflect immediately on the header, mobile menu, footer, and admin sidebar.
            </div>
          </div>
        </EditorCard>

        {/* Site Name and Subtitle Card */}
        <EditorCard
          id="sec-identity"
          title="Website Name & Tagline"
          description="The main brand text displayed in the header."
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Website Name *
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => handleFieldChange(["site_name"], e.target.value)}
                placeholder="e.g. Cozy Care"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                Shown prominently in the top header and footer.
              </span>
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Website Subtitle / Tagline
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={(e) => handleFieldChange(["site_tagline"], e.target.value)}
                placeholder="e.g. Nepal Plant Studio"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                Small uppercase subline below the website name.
              </span>
            </div>
          </div>
        </EditorCard>

        {/* Website Logo Image Card */}
        <EditorCard
          id="sec-logo"
          title="Website Logo Image"
          description="Upload a custom logo image (PNG, SVG, WEBP, or JPG) or enter an external image URL."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              {/* Logo Preview Circle */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2px dashed #cbd5e1",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "4px",
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "#164e43",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                    }}
                  >
                    <Leaf size={28} />
                  </div>
                )}
              </div>

              {/* Upload & Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.55rem 1rem",
                      borderRadius: "8px",
                      background: "#164e43",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={15} />
                    {uploadingLogo ? "Uploading..." : "Upload Logo Image"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                  </label>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.55rem 0.85rem",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        border: "1px solid #fecaca",
                        color: "#ef4444",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} /> Remove Logo
                    </button>
                  )}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Recommended: Square or circular image, minimum 120x120px with transparent or solid background.
                </span>
              </div>
            </div>

            {/* Direct Image URL input */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Or Direct Logo Image URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => handleFieldChange(["logo_url"], e.target.value)}
                placeholder="e.g. https://example.com/logo.png or /storage/uploads/logo.webp"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>
        </EditorCard>

        {/* Admin Dashboard Title & Footer Details */}
        <EditorCard
          id="sec-admin-footer"
          title="Admin Sidebar Title & Footer Description"
          description="Adjust the title displayed in the Admin Dashboard sidebar and the paragraph in the footer."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Admin Dashboard Header Title
              </label>
              <input
                type="text"
                value={adminDashboardTitle}
                onChange={(e) => handleFieldChange(["admin_dashboard_title"], e.target.value)}
                placeholder="e.g. Cozy Care admin dashboard"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Footer Brand Description
              </label>
              <textarea
                value={footerDescription}
                onChange={(e) => handleFieldChange(["footer_description"], e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <button
                type="button"
                onClick={resetAllBranding}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.82rem",
                  color: "#64748b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginTop: "0.5rem",
                }}
              >
                <RotateCcw size={14} /> Reset all branding to default
              </button>
            </div>
          </div>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

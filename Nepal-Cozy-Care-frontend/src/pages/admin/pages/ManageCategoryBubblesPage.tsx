import { useState } from "react";
import { CircleDot, Plus, Trash2, Upload, RotateCcw } from "lucide-react";
import {
  EditorCard,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";
import {
  defaultCategoryBubbles,
  resolveCategoryBubbleImage,
  type CategoryBubbleItem,
} from "../../../components/plants/CategoryBubbles";
import { compressImage } from "../../../utils/imageCompressor";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const PRESET_ICONS = [
  { id: "plants", label: "Plants (Foliage)", file: "plants" },
  { id: "pots", label: "Pots & Planters", file: "pots" },
  { id: "soil", label: "Soil & Media", file: "soil" },
  { id: "fertiliser", label: "Fertilisers (Nutrients)", file: "fertiliser" },
  { id: "tools", label: "Garden Tools", file: "tools" },
  { id: "watering", label: "Watering Can", file: "watering" },
  { id: "care", label: "Plant Care (Spray)", file: "care" },
];

export default function ManageCategoryBubblesPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleSave,
  } = usePageContentEditor({
    pageKey: "category_bubbles",
    pageName: "Catalog Category Circles",
    pageUrl: "/plants",
  });

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const categories: CategoryBubbleItem[] =
    Array.isArray(payload.categories) && payload.categories.length > 0
      ? payload.categories
      : defaultCategoryBubbles;

  const headerTitle = payload.title || "Plants";
  const headerSubtitle =
    payload.subtitle || "Transform your living spaces with hand-nurtured houseplants and outdoor flora";

  const updateCategory = (index: number, field: keyof CategoryBubbleItem, value: any) => {
    const list = [...categories];
    list[index] = { ...list[index], [field]: value };
    handleFieldChange(["categories"], list);
  };

  const addCategory = () => {
    const newId = `cat_${Date.now()}`;
    const newItem: CategoryBubbleItem = {
      id: newId,
      label: "New Category",
      path: "/plants",
      image: "plants",
      is_active: true,
    };
    const list = [...categories, newItem];
    handleFieldChange(["categories"], list);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) {
      alert("You need to keep at least one category circle.");
      return;
    }
    const list = [...categories];
    list.splice(index, 1);
    handleFieldChange(["categories"], list);
  };

  const resetToDefaults = () => {
    if (confirm("Reset all category circles back to default list?")) {
      handleFieldChange(["categories"], defaultCategoryBubbles);
    }
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploadingIdx(index);
    try {
      const compressed = await compressImage(file, { maxWidth: 800, quality: 0.85 });
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("directory", "categories");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to upload image");

      const imagePath = json.data?.url || json.data?.path || "";
      updateCategory(index, "image", imagePath);
    } catch (err: any) {
      alert(err.message || "Image upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const SECTIONS = [
    { id: "sec-preview", label: "Live Visual Preview" },
    { id: "sec-header", label: "Catalog Header Banner" },
    { id: "sec-items", label: "Manage Category Circles" },
  ];

  return (
    <PageEditorShell
      title="Catalog Category Circles (Bubbles)"
      subtitle="Customize the circular category navigation buttons on the catalog pages (/plants, /pots). Add, remove, rename, and assign botanical artwork or custom icons."
      icon={CircleDot}
      pageUrl="/plants"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
      sections={SECTIONS}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Live Visual Preview Card */}
        <EditorCard
          id="sec-preview"
          title="Live Storefront Preview"
          description="Real-time preview of how the category circles and banner appear to customers."
          badge={`${categories.filter((c) => c.is_active !== false).length} Active Circles`}
        >
          <div
            style={{
              background: "#faf8f5",
              borderRadius: "12px",
              padding: "1.75rem 1.25rem",
              border: "1px solid #ebdccb",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1b4e54", margin: 0 }}>
                {headerTitle}
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#64748b", marginTop: "0.35rem" }}>
                {headerSubtitle}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1.25rem",
                overflowX: "auto",
                padding: "0.5rem 0.5rem 1rem",
                justifyContent: "flex-start",
                scrollbarWidth: "thin",
              }}
            >
              {categories
                .filter((c) => c.is_active !== false)
                .map((cat, idx) => (
                  <div
                    key={cat.id || idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                      minWidth: "78px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: idx === 0 ? "2px solid #166534" : "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        padding: "6px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}
                    >
                      <img
                        src={resolveCategoryBubbleImage(cat.image)}
                        alt={cat.label}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/categories/plants.webp";
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: idx === 0 ? "#166534" : "#334155",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.label}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </EditorCard>

        {/* Catalog Header Banner Text */}
        <EditorCard
          id="sec-header"
          title="Catalog Page Header & Subtitle"
          description="Title and tagline shown above the category circles on the /plants catalog."
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.35rem" }}>
                Catalog Title
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => handleFieldChange(["title"], e.target.value)}
                placeholder="e.g. Plants"
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
                Subtitle / Description
              </label>
              <input
                type="text"
                value={headerSubtitle}
                onChange={(e) => handleFieldChange(["subtitle"], e.target.value)}
                placeholder="e.g. Transform your living spaces with hand-nurtured houseplants and outdoor flora"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>
        </EditorCard>

        {/* Category Items List */}
        <EditorCard
          id="sec-items"
          title="Category Circles (Add / Remove / Reorder)"
          description="Each circle has a name, link, and botanical icon or custom uploaded image."
          badge={`${categories.length} Total Circles`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categories.map((cat, index) => (
              <div
                key={cat.id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1.4fr 1.6fr auto auto",
                  gap: "1rem",
                  alignItems: "center",
                  padding: "1rem",
                  background: cat.is_active !== false ? "#ffffff" : "#f8fafc",
                  borderRadius: "12px",
                  border: cat.is_active !== false ? "1px solid #cbd5e1" : "1px dashed #cbd5e1",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                }}
              >
                {/* Circle Thumbnail */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: "4px",
                  }}
                >
                  <img
                    src={resolveCategoryBubbleImage(cat.image)}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/categories/plants.webp";
                    }}
                  />
                </div>

                {/* Name / Label */}
                <div>
                  <label style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "0.25rem" }}>
                    Category Label
                  </label>
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => updateCategory(index, "label", e.target.value)}
                    placeholder="e.g. Indoor Plants"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* Link / URL & Icon Selector */}
                <div>
                  <label style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "0.25rem" }}>
                    Target Path / URL
                  </label>
                  <input
                    type="text"
                    value={cat.path}
                    onChange={(e) => updateCategory(index, "path", e.target.value)}
                    placeholder="e.g. /plants or /pots?category=soil"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      marginBottom: "0.4rem",
                    }}
                  />

                  {/* Icon Presets & Upload row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Presets:</span>
                    {PRESET_ICONS.map((p) => {
                      const isSelected = cat.image === p.file;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => updateCategory(index, "image", p.file)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.2rem 0.45rem",
                            borderRadius: "4px",
                            border: isSelected ? "1px solid #059669" : "1px solid #e2e8f0",
                            background: isSelected ? "#ecfdf5" : "#ffffff",
                            color: isSelected ? "#065f46" : "#475569",
                            cursor: "pointer",
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          {p.label.split(" ")[0]}
                        </button>
                      );
                    })}

                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        color: "#0f766e",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <Upload size={12} />
                      {uploadingIdx === index ? "Uploading..." : "Upload Icon"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={uploadingIdx === index}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(index, file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Active Checkbox */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: cat.is_active !== false ? "#166534" : "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cat.is_active !== false}
                      onChange={(e) => updateCategory(index, "is_active", e.target.checked)}
                      style={{ marginRight: "0.35rem", accentColor: "#059669" }}
                    />
                    {cat.is_active !== false ? "Visible" : "Hidden"}
                  </label>
                </div>

                {/* Remove Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    title="Remove this category bubble"
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "6px",
                      color: "#ef4444",
                      padding: "0.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={addCategory}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  padding: "0.55rem 1rem",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#065f46",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Add Category Circle
              </button>

              <button
                type="button"
                onClick={resetToDefaults}
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
                }}
              >
                <RotateCcw size={14} /> Reset to Default 9 Categories
              </button>
            </div>
          </div>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

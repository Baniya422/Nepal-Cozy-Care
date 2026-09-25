import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  BarChart3,
  FileText,
  Clock3,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
import "../../styles/adminCareTips.css";
import { handleImageError, resolveImageUrl } from "../../utils/imageUrl";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
interface CareTip {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: string;
  created_date: string;
  views_count: number;
  status: "published" | "draft";
  image: string | null;
}
interface CareTipFormData {
  title: string;
  excerpt: string;
  content: string;
  category: "watering" | "fertilizing" | "pest_control" | "indoor" | "outdoor" | "seasonal";
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "published" | "draft";
  image: string;
}
const emptyForm: CareTipFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "watering",
  difficulty: "beginner",
  status: "published",
  image: "",
};
const FALLBACK_IMAGE = "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp";
export default function ManageCareTips() {
  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<CareTip | null>(null);
  const [previewTip, setPreviewTip] = useState<CareTip | null>(null);
  const [formData, setFormData] = useState<CareTipFormData>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  useEffect(() => {
    void fetchCareTips();
  }, []);
  useEffect(() => () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);
  const getToken = () => localStorage.getItem("token");
  const getPreviewText = (excerpt: string, content: string, maxLength = 155) => {
    if (excerpt.trim()) {
      return excerpt;
    }
    const plainContent = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plainContent.length > maxLength ? `${plainContent.slice(0, maxLength)}...` : plainContent;
  };
  const getReadTime = (content: string, excerpt = "") => {
    const wordCount = `${excerpt} ${content.replace(/<[^>]+>/g, " ")}`
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 180));
  };
  const fetchCareTips = async () => {
    setLoading(true);
    setPageError("");
    try {
      const token = getToken();
      const tipsData = [];
      let page = 1;
      let lastPage = 1;
      do {
        const res = await fetch(`${API}/api/admin/care-tips?per_page=100&page=${page}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load care tips. Please try again.");
        const data = await res.json();
        const items = data.data?.tips ?? data.data?.data ?? data.data;
        if (!Array.isArray(items)) throw new Error("Invalid care tips response.");
        tipsData.push(...items);
        lastPage = Number(data.data?.pagination?.last_page) || 1;
        page++;
      } while (page <= lastPage);
      {
        const transformedTips: CareTip[] = tipsData.map((tip: any) => ({
          id: tip.id,
          title: tip.title,
          excerpt: tip.excerpt || "",
          content: tip.content || "",
          category: tip.category || "watering",
          difficulty: tip.difficulty || "beginner",
          created_date: tip.created_at,
          views_count: tip.views_count || 0,
          status: tip.is_published ? "published" : "draft",
          image: tip.image,
        }));
        setCareTips(transformedTips);
      }
    } catch (error) {
      console.error("Error fetching care tips:", error);
      setPageError("Failed to load care tips. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const closeEditor = (force = false) => {
    if (saving && !force) return;
    setShowModal(false);
    setEditingTip(null);
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setSubmitError(null);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSubmitError(null);
    if (!formData.title.trim() || !formData.content.trim()) {
      setSubmitError("A title and guide content are required.");
      return;
    }
    setSaving(true);
    const token = getToken();
    try {
      let imagePath = formData.image || null;
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append("file", selectedImage);
        formDataImage.append("directory", "care-tips");
        const uploadRes = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formDataImage,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imagePath = uploadData.data?.path || uploadData.path;
          if (!imagePath) throw new Error("Image upload returned no saved image. Please try again.");
        } else {
          const errData = await uploadRes.json().catch(() => ({}));
          const errMsg =
            errData.message ||
            (errData.errors ? Object.values(errData.errors).flat().join(" ") : null) ||
            `Image upload failed (${uploadRes.status}). Guide was not saved.`;
          throw new Error(errMsg);
        }
      }
      const url = editingTip ? `${API}/api/admin/care-tips/${editingTip.id}` : `${API}/api/admin/care-tips`;
      const method = editingTip ? "PUT" : "POST";
      const requestBody: Record<string, unknown> = {
        title: formData.title.trim(),
        excerpt: formData.excerpt,
        content: formData.content.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        is_published: formData.status === "published",
        image: imagePath || null,
      };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        closeEditor(true);
        await fetchCareTips();
      } else {
        const error = await res.json().catch(() => ({}));
        const errMsg =
          (error.errors ? Object.values(error.errors).flat().join(" ") : null) ||
          error.message ||
          `Failed to save care tip (${res.status})`;
        setSubmitError(errMsg);
      }
    } catch (error) {
      console.error("Error saving care tip:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to save care tip. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const changeTip = async (tip: CareTip, action: "delete" | "toggle") => {
    if (busyId !== null) return;
    if (action === "delete" && !confirm("Are you sure you want to delete this care tip?")) return;
    setBusyId(tip.id);
    setPageError("");
    try {
      const res = await fetch(`${API}/api/admin/care-tips/${tip.id}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        ...(action === "toggle" ? { body: JSON.stringify({ is_published: tip.status !== "published" }) } : {}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          (data.errors ? Object.values(data.errors).flat().join(" ") : null) ||
          data.message ||
          `Could not update the guide (${res.status}).`;
        throw new Error(errMsg);
      }
      await fetchCareTips();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not update the guide. Please try again.");
    } finally { setBusyId(null); }
  };
  const handleEdit = (tip: CareTip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      excerpt: tip.excerpt || "",
      content: tip.content || "",
      category: (tip.category as CareTipFormData["category"]) || "watering",
      difficulty: (tip.difficulty as CareTipFormData["difficulty"]) || "beginner",
      status: tip.status,
      image: tip.image || "",
    });
    setSelectedImage(null);
    setImagePreview(tip.image ? resolveImageUrl(tip.image, FALLBACK_IMAGE) : null);
    setSubmitError(null);
    setShowModal(true);
  };
  const handleAddNew = () => {
    setEditingTip(null);
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setSubmitError(null);
    setShowModal(true);
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
        setSubmitError("Choose an image smaller than 8 MB.");
        event.target.value = "";
        return;
      }
      setSubmitError(null);
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      watering: "Watering",
      fertilizing: "Fertilizing",
      pest_control: "Pest Control",
      indoor: "Indoor Plants",
      outdoor: "Outdoor Plants",
      seasonal: "Seasonal Care",
    };
    return labels[category] || category;
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "admin-status-active";
      case "intermediate":
        return "admin-status-pending";
      case "advanced":
        return "admin-status-inactive";
      default:
        return "";
    }
  };
  const filteredTips = careTips.filter((tip) => !statusFilter || tip.status === statusFilter).filter(
    (tip) =>
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const publishedCount = careTips.filter((tip) => tip.status === "published").length;
  const draftCount = careTips.length - publishedCount;
  const totalViews = careTips.reduce((sum, tip) => sum + tip.views_count, 0);
  const topTip =
    careTips.reduce<CareTip | null>(
      (bestTip, currentTip) =>
        !bestTip || currentTip.views_count > bestTip.views_count ? currentTip : bestTip,
      null
    ) || null;
  const excerptLength = formData.excerpt.trim().length;
  const liveReadTime = getReadTime(formData.content, formData.excerpt);
  const livePreviewText = getPreviewText(formData.excerpt, formData.content, 200);
  return (
    <AdminLayout>
      <div className="admin-page admin-care-tips-page">
        <section className="admin-care-tips-hero">
          <div className="admin-care-tips-hero-copy">
            <span className="admin-care-tips-kicker">Care Tip Studio</span>
            <h2>Design better plant guides for your users.</h2>
            <p>
              Create care tips that look polished on the public site, read clearly on mobile,
              and help your My Garden and seasonal reminder features feel more premium.
            </p>
          </div>
          <div className="admin-care-tips-hero-side">
            {topTip ? (
              <div className="admin-care-tips-top-tip">
                <span>Top performing guide</span>
                <strong>{topTip.title}</strong>
                <p>{topTip.views_count.toLocaleString()} total views</p>
              </div>
            ) : null}
            <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
              <Plus size={18} />
              Create New Tip
            </button>
          </div>
        </section>
        <section className="admin-care-tips-stats">
          <article className="admin-care-tips-stat-card">
            <div className="admin-care-tips-stat-icon emerald">
              <FileText size={20} />
            </div>
            <div>
              <span>Total Guides</span>
              <strong>{careTips.length}</strong>
            </div>
          </article>
          <article className="admin-care-tips-stat-card">
            <div className="admin-care-tips-stat-icon blue">
              <Sparkles size={20} />
            </div>
            <div>
              <span>Published</span>
              <strong>{publishedCount}</strong>
            </div>
          </article>
          <article className="admin-care-tips-stat-card">
            <div className="admin-care-tips-stat-icon amber">
              <Clock3 size={20} />
            </div>
            <div>
              <span>Drafts</span>
              <strong>{draftCount}</strong>
            </div>
          </article>
          <article className="admin-care-tips-stat-card">
            <div className="admin-care-tips-stat-icon slate">
              <BarChart3 size={20} />
            </div>
            <div>
              <span>Total Views</span>
              <strong>{totalViews.toLocaleString()}</strong>
            </div>
          </article>
        </section>
        <div className="admin-filters admin-care-tips-filters">
          <div className="admin-search admin-care-tips-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search title, excerpt, category, or difficulty..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <p className="admin-care-tips-filter-note">
            Content studio tip: write short summaries first, then expand the full guidance.
          </p>
        </div>
        {pageError && <div role="alert" className="admin-care-tip-error">{pageError}
          <button type="button" className="admin-btn" onClick={() => void fetchCareTips()}>Retry loading</button>
        </div>}
        <label>Status filter <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All guides</option><option value="published">Published</option><option value="draft">Drafts</option>
        </select></label>
        <div className="admin-table-container admin-care-tips-table-wrap">
          {loading ? (
            <div className="admin-loading">Loading care tips...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Guide</th>
                  <th>Difficulty</th>
                  <th>Created</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTips.map((tip) => (
                  <tr key={tip.id}>
                    <td>
                      <div className="admin-care-tip-cell">
                        <div className="admin-care-tip-thumb">
                          <img
                            src={resolveImageUrl(tip.image, FALLBACK_IMAGE)}
                            alt={tip.title}
                            onError={(event) => handleImageError(event, FALLBACK_IMAGE)}
                            loading="lazy"
                          />
                        </div>
                        <div className="admin-care-tip-copy">
                          <div className="admin-care-tip-copy-top">
                            <strong>{tip.title}</strong>
                            <span className="admin-care-tip-category-pill">
                              {getCategoryLabel(tip.category)}
                            </span>
                          </div>
                          <p>{getPreviewText(tip.excerpt, tip.content)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${getDifficultyColor(tip.difficulty)}`}>
                        {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(tip.created_date)}</td>
                    <td>{tip.views_count.toLocaleString()}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          tip.status === "published" ? "admin-status-active" : "admin-status-pending"
                        }`}
                      >
                        {tip.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn admin-action-view"
                          title="Preview"
                          onClick={() => setPreviewTip(tip)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-edit"
                          title="Edit"
                          onClick={() => handleEdit(tip)}
                        >
                          <Edit size={16} />
                        </button>
                        {(
                          <button
                            className="admin-care-tip-publish-btn"
                            title={tip.status === "published" ? "Unpublish" : "Publish"}
                            disabled={busyId !== null}
                            onClick={() => void changeTip(tip, "toggle")}
                          >
                            {tip.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                        )}
                        <button
                          className="admin-action-btn admin-action-delete"
                          title="Delete"
                          disabled={busyId !== null}
                          onClick={() => void changeTip(tip, "delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !pageError && filteredTips.length === 0 && (
            <div className="admin-empty-state">
              <p>No care tips found. Create your first care tip!</p>
            </div>
          )}
        </div>
        {previewTip && (
          <div className="admin-modal-overlay" onClick={() => setPreviewTip(null)}>
            <div
              className="admin-modal admin-care-tip-preview-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>Care Tip Preview</h3>
                <button className="admin-modal-close" onClick={() => setPreviewTip(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="admin-care-tip-preview">
                <div className="admin-care-tip-preview-hero">
                  <div className="admin-care-tip-preview-media">
                    <img
                      src={resolveImageUrl(previewTip.image, FALLBACK_IMAGE)}
                      alt={previewTip.title}
                      onError={(event) => handleImageError(event, FALLBACK_IMAGE)}
                    />
                  </div>
                  <div className="admin-care-tip-preview-copy">
                    <div className="admin-care-tip-preview-badges">
                      <span className="admin-care-tip-category-pill">
                        {getCategoryLabel(previewTip.category)}
                      </span>
                      <span
                        className={`admin-status-badge ${getDifficultyColor(previewTip.difficulty)}`}
                      >
                        {previewTip.difficulty}
                      </span>
                    </div>
                    <h4>{previewTip.title}</h4>
                    <p>{getPreviewText(previewTip.excerpt, previewTip.content, 220)}</p>
                    <div className="admin-care-tip-preview-meta">
                      <span>{previewTip.views_count.toLocaleString()} views</span>
                      <span>{getReadTime(previewTip.content, previewTip.excerpt)} min read</span>
                      <span>{previewTip.status}</span>
                    </div>
                  </div>
                </div>
                <div className="admin-care-tip-preview-section">
                  <h5>Brief Summary</h5>
                  <p>{previewTip.excerpt || "No separate summary added yet."}</p>
                </div>
                <div className="admin-care-tip-preview-section">
                  <h5>Full Content</h5>
                  <div className="admin-care-tip-preview-text">{previewTip.content}</div>
                </div>
              </div>
              <div className="admin-modal-footer">
                {previewTip.status === "published" ? (
                  <a
                    className="admin-btn admin-btn-secondary"
                    href={`/care-tips/${previewTip.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    Open Public Page
                  </a>
                ) : (
                  <span className="admin-care-tip-draft-note">
                    Draft preview only. Publish to open on the public site.
                  </span>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    setPreviewTip(null);
                    handleEdit(previewTip);
                  }}
                >
                  <Edit size={16} />
                  Edit Tip
                </button>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => closeEditor()}>
            <div
              className="admin-modal admin-modal-large admin-care-tip-editor-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{editingTip ? "Edit Care Tip" : "Create New Care Tip"}</h3>
                <button className="admin-modal-close" onClick={() => closeEditor()}>
                  <X size={20} />
                </button>
              </div>
              {submitError && <div role="alert" className="admin-care-tip-error">{submitError}</div>}
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-care-tip-editor-stats">
                  <div className="admin-care-tip-editor-chip">
                    <FileText size={16} />
                    {excerptLength}/500 summary chars
                  </div>
                  <div className="admin-care-tip-editor-chip">
                    <Clock3 size={16} />
                    {liveReadTime} min read
                  </div>
                  <div className="admin-care-tip-editor-chip">
                    <Sparkles size={16} />
                    {formData.status === "published"
                      ? "Will appear publicly after save"
                      : "Draft mode"}
                  </div>
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-title">Care Tip Title *</label>
                    <input
                      type="text"
                      maxLength={255}
                      id="care-tip-title"
                      value={formData.title}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, title: event.target.value }))
                      }
                      required
                      placeholder="e.g., How to Water Your Cactus"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-category">Category *</label>
                    <select
                      id="care-tip-category"
                      value={formData.category}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          category: event.target.value as CareTipFormData["category"],
                        }))
                      }
                      required
                    >
                      <option value="watering">Watering</option>
                      <option value="fertilizing">Fertilizing</option>
                      <option value="pest_control">Pest Control</option>
                      <option value="indoor">Indoor Plants</option>
                      <option value="outdoor">Outdoor Plants</option>
                      <option value="seasonal">Seasonal Care</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-difficulty">Difficulty Level *</label>
                    <select
                      id="care-tip-difficulty"
                      value={formData.difficulty}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          difficulty: event.target.value as CareTipFormData["difficulty"],
                        }))
                      }
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-status">Status</label>
                    <select
                      id="care-tip-status"
                      value={formData.status}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          status: event.target.value as "published" | "draft",
                        }))
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label htmlFor="care-tip-excerpt">Excerpt (Brief Summary)</label>
                  <textarea
                    id="care-tip-excerpt"
                      value={formData.excerpt}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, excerpt: event.target.value }))
                    }
                    rows={3}
                    placeholder="Summarize the care tip in 1-2 clear sentences."
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="care-tip-content">Content *</label>
                  <textarea
                    id="care-tip-content"
                      value={formData.content}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, content: event.target.value }))
                    }
                    rows={10}
                    required
                    placeholder="Write the full guide here. Use short paragraphs and line breaks for easier reading."
                  />
                </div>
                <div className="admin-form-group">
                  <label>Featured Image</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "90px", height: "70px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", flexShrink: 0 }}>
                        <img
                          src={imagePreview || formData.image || FALLBACK_IMAGE}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(event) => handleImageError(event, FALLBACK_IMAGE)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, image: e.target.value }));
                            setImagePreview(e.target.value);
                            setSelectedImage(null);
                          }}
                          placeholder="Paste image URL (https://... or /images/...)"
                          style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", marginBottom: "0.5rem" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <label
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <Upload size={14} />
                            <span>{selectedImage ? `Selected: ${selectedImage.name}` : "Upload Computer File"}</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                          </label>
                          {selectedImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(formData.image ? resolveImageUrl(formData.image, FALLBACK_IMAGE) : null);
                              }}
                              style={{ background: "none", border: "none", color: "#dc2626", fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            >
                              <X size={13} /> Remove file
                            </button>
                          )}
                          {!selectedImage && formData.image && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, image: "" }));
                                setImagePreview(null);
                              }}
                              style={{ background: "none", border: "none", color: "#dc2626", fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            >
                              <X size={13} /> Clear image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <small style={{ color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Quick Botanical Presets:</small>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {[
                          { label: "Lush Soil", path: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp" },
                          { label: "Monstera Leaf", path: "/images/blog-leaf-macro.jpg" },
                          { label: "Snake Plant", path: "/images/snake.jpg" },
                          { label: "Winter Garden", path: "/images/winter-garden.png" },
                          { label: "Indoor Care", path: "/images/about-plants.jpg" },
                        ].map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, image: preset.path }));
                              setImagePreview(preset.path);
                              setSelectedImage(null);
                            }}
                            style={{
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              border: formData.image === preset.path ? "1px solid #10b981" : "1px solid #e2e8f0",
                              background: formData.image === preset.path ? "#ecfdf5" : "#ffffff",
                              color: formData.image === preset.path ? "#065f46" : "#475569",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <section className="admin-care-tip-live-preview">
                  <div className="admin-care-tip-live-preview-head">
                    <Sparkles size={16} />
                    Reader Preview
                  </div>
                  <div className="admin-care-tip-live-card">
                    <div className="admin-care-tip-live-media">
                      <img
                        src={imagePreview || FALLBACK_IMAGE}
                        alt="Care tip preview"
                        onError={(event) => handleImageError(event, FALLBACK_IMAGE)}
                      />
                    </div>
                    <div className="admin-care-tip-live-copy">
                      <span className="admin-care-tip-category-pill">
                        {getCategoryLabel(formData.category)}
                      </span>
                      <strong>{formData.title || "Your care tip title will appear here"}</strong>
                      <p>
                        {livePreviewText ||
                          "Add a brief summary or start writing the main guide to preview the reader-facing card."}
                      </p>
                    </div>
                  </div>
                </section>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => closeEditor()}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                    {saving ? "Saving..." : editingTip ? "Update Care Tip" : "Create Care Tip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

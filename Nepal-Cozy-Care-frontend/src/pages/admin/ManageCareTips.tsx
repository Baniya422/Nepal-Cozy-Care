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
}

const emptyForm: CareTipFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "watering",
  difficulty: "beginner",
  status: "draft",
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCareTips();
  }, []);

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

    try {
      const token = getToken();
      const res = await fetch(`${API}/api/admin/care-tips`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const tipsData = data.data?.tips || data.data?.data || data.data || [];
        const transformedTips = tipsData.map((tip: any) => ({
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
      setSubmitError("Failed to load care tips");
    } finally {
      setLoading(false);
    }
  };

  const closeEditor = () => {
    setShowModal(false);
    setEditingTip(null);
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    const token = getToken();

    try {
      let imagePath = null;

      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append("file", selectedImage);
        formDataImage.append("directory", "care-tips");

        const uploadRes = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataImage,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imagePath = uploadData.data?.path || uploadData.path;
        } else {
          console.error("Image upload failed");
        }
      }

      const url = editingTip ? `${API}/api/care-tips/${editingTip.id}` : `${API}/api/care-tips`;
      const method = editingTip ? "PUT" : "POST";

      const requestBody: Record<string, unknown> = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        difficulty: formData.difficulty,
        is_published: formData.status === "published",
      };

      if (imagePath) {
        requestBody.image = imagePath;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        closeEditor();
        await fetchCareTips();
      } else {
        const error = await res.json();
        setSubmitError(error.message || "Failed to save care tip");
      }
    } catch (error) {
      console.error("Error saving care tip:", error);
      setSubmitError("Failed to save care tip. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this care tip?")) return;

    const token = getToken();

    try {
      const res = await fetch(`${API}/api/care-tips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchCareTips();
      } else {
        alert("Failed to delete care tip");
      }
    } catch (error) {
      console.error("Error deleting care tip:", error);
    }
  };

  const handlePublish = async (id: number) => {
    const token = getToken();

    try {
      const res = await fetch(`${API}/api/care-tips/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: true }),
      });

      if (res.ok) {
        await fetchCareTips();
      }
    } catch (error) {
      console.error("Error publishing care tip:", error);
    }
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
    });
    setSelectedImage(null);
    setImagePreview(tip.image ? `${API}/storage/${tip.image}` : null);
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

  const filteredTips = careTips.filter(
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
                            src={tip.image ? `${API}/storage/${tip.image}` : FALLBACK_IMAGE}
                            alt={tip.title}
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
                        {tip.status === "draft" && (
                          <button
                            className="admin-care-tip-publish-btn"
                            title="Publish"
                            onClick={() => void handlePublish(tip.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="admin-action-btn admin-action-delete"
                          title="Delete"
                          onClick={() => void handleDelete(tip.id)}
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

          {!loading && filteredTips.length === 0 && (
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
                      src={previewTip.image ? `${API}/storage/${previewTip.image}` : FALLBACK_IMAGE}
                      alt={previewTip.title}
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
          <div className="admin-modal-overlay" onClick={closeEditor}>
            <div
              className="admin-modal admin-modal-large admin-care-tip-editor-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{editingTip ? "Edit Care Tip" : "Create New Care Tip"}</h3>
                <button className="admin-modal-close" onClick={closeEditor}>
                  <X size={20} />
                </button>
              </div>

              {submitError && <div className="admin-care-tip-error">{submitError}</div>}

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
                    <label>Care Tip Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, title: event.target.value }))
                      }
                      required
                      placeholder="e.g., How to Water Your Cactus"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
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
                    <label>Difficulty Level *</label>
                    <select
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
                    <label>Status</label>
                    <select
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
                  <label>Excerpt (Brief Summary)</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, excerpt: event.target.value }))
                    }
                    rows={3}
                    placeholder="Summarize the care tip in 1-2 clear sentences."
                  />
                </div>

                <div className="admin-form-group">
                  <label>Content *</label>
                  <textarea
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
                  <div className="admin-image-upload">
                    {imagePreview && (
                      <div className="admin-image-preview admin-care-tip-image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <label className="admin-file-input">
                      <Upload size={18} />
                      <span>{selectedImage ? "Change Image" : "Upload Image"}</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <section className="admin-care-tip-live-preview">
                  <div className="admin-care-tip-live-preview-head">
                    <Sparkles size={16} />
                    Reader Preview
                  </div>
                  <div className="admin-care-tip-live-card">
                    <div className="admin-care-tip-live-media">
                      <img src={imagePreview || FALLBACK_IMAGE} alt="Care tip preview" />
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
                    onClick={closeEditor}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingTip ? "Update Care Tip" : "Create Care Tip"}
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

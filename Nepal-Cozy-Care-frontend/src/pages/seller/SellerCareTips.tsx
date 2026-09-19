import React, { useEffect, useState } from "react";
import {
  Lightbulb,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Droplets,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import "../../components/seller/seller.css";
import {
  DEFAULT_CARE_TIP_IMAGE,
  handleImageError,
  resolveImageUrl,
} from "../../utils/imageUrl";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface CareTipItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: "watering" | "fertilizing" | "pest_control" | "indoor" | "outdoor" | "seasonal";
  difficulty: "beginner" | "intermediate" | "advanced";
  image?: string;
  views_count: number;
  is_published: boolean;
  created_at: string;
}

export default function SellerCareTips() {
  const [careTips, setCareTips] = useState<CareTipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<CareTipItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "watering",
    difficulty: "beginner",
    is_published: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCareTips();
  }, []);

  const fetchCareTips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/seller/care-tips?per_page=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCareTips(json.data.tips || []);
      }
    } catch (err) {
      console.error("Failed to load seller care tips", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTip(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "watering",
      difficulty: "beginner",
      is_published: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (tip: CareTipItem) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      excerpt: tip.excerpt || "",
      content: tip.content,
      category: tip.category || "watering",
      difficulty: tip.difficulty || "beginner",
      is_published: tip.is_published,
    });
    setImageFile(null);
    setImagePreview(
      tip.image ? resolveImageUrl(tip.image, DEFAULT_CARE_TIP_IMAGE) : null
    );
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      if (formData.excerpt) data.append("excerpt", formData.excerpt);
      data.append("content", formData.content);
      data.append("category", formData.category);
      data.append("difficulty", formData.difficulty);
      data.append("is_published", formData.is_published ? "1" : "0");

      if (imageFile) {
        data.append("image", imageFile);
      }

      const url = editingTip
        ? `${API}/api/seller/care-tips/${editingTip.id}`
        : `${API}/api/seller/care-tips`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save care tip.");
      }

      setFeedback({
        type: "success",
        text: editingTip ? "Care tip updated!" : "Care tip published successfully!",
      });
      setShowModal(false);
      fetchCareTips();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to submit care tip." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this care tip?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/seller/care-tips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCareTips(careTips.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete care tip", err);
    }
  };

  const filteredTips = careTips.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const publishedCount = careTips.filter((t) => t.is_published).length;
  const totalViews = careTips.reduce((sum, t) => sum + (t.views_count || 0), 0);

  return (
    <SellerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header Bar */}
        <div className="seller-form-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Plant Care Guides & Tips
              </h2>
              <span className="seller-badge seller-badge-approved">
                <Lightbulb size={12} />
                <span>Nursery Advice</span>
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
              Publish watering routines, soil tips, fertilizing calendars, and troubleshooting guides for your buyers.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="seller-btn seller-btn-primary"
          >
            <Plus size={16} />
            <span>Add Care Tip</span>
          </button>
        </div>

        {feedback && (
          <div
            style={{
              padding: "0.9rem 1.25rem",
              borderRadius: "10px",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: feedback.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 4 Mini Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Tips</span>
            <div className="seller-stat-value">{careTips.length}</div>
            <div className="seller-stat-caption">Created by your shop</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Active Guides</span>
            <div className="seller-stat-value" style={{ color: "#059669" }}>{publishedCount}</div>
            <div className="seller-stat-caption" style={{ color: "#059669" }}>Live on site</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Views</span>
            <div className="seller-stat-value" style={{ color: "#0284c7" }}>{totalViews}</div>
            <div className="seller-stat-caption" style={{ color: "#0284c7" }}>Customer consultations</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Categories Covered</span>
            <div className="seller-stat-value" style={{ color: "#7c3aed" }}>
              {new Set(careTips.map((t) => t.category)).size}
            </div>
            <div className="seller-stat-caption">Unique plant topics</div>
          </div>
        </div>

        {/* Category Toolbar */}
        <div className="seller-toolbar">
          <div className="seller-tab-group">
            {[
              { key: "all", label: "All Tips" },
              { key: "watering", label: "Watering" },
              { key: "fertilizing", label: "Fertilizing" },
              { key: "pest_control", label: "Pest Control" },
              { key: "indoor", label: "Indoor Care" },
              { key: "outdoor", label: "Outdoor Care" },
              { key: "seasonal", label: "Seasonal" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategoryFilter(tab.key)}
                className={`seller-tab-btn ${categoryFilter === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="seller-search" style={{ width: "260px" }}>
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search care tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Care Tips Table */}
        <div className="seller-card">
          {loading ? (
            <div className="seller-empty-state">Loading your plant care tips...</div>
          ) : filteredTips.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon">
                <Lightbulb size={26} />
              </div>
              <h4>No care tips found</h4>
              <p>Add helpful watering advice, fertilizing tips, or pest solutions for your customers.</p>
            </div>
          ) : (
            <div className="seller-table-container">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Care Tip</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTips.map((tip) => (
                    <tr key={tip.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "10px",
                              background: "#ecfdf5",
                              color: "#047857",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "1px solid #d1fae5",
                            }}
                          >
                            {tip.image ? (
                              <img
                                src={resolveImageUrl(tip.image, DEFAULT_CARE_TIP_IMAGE)}
                                alt={tip.title}
                                onError={(event) => handleImageError(event, DEFAULT_CARE_TIP_IMAGE)}
                                loading="lazy"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Droplets size={20} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>
                              {tip.title}
                            </div>
                            {tip.excerpt && (
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                {tip.excerpt.slice(0, 50)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.8rem", textTransform: "capitalize" }}>
                          {tip.category?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            background:
                              tip.difficulty === "beginner"
                                ? "#ecfdf5"
                                : tip.difficulty === "intermediate"
                                ? "#fefce8"
                                : "#fef2f2",
                            color:
                              tip.difficulty === "beginner"
                                ? "#065f46"
                                : tip.difficulty === "intermediate"
                                ? "#854d0e"
                                : "#991b1b",
                          }}
                        >
                          {tip.difficulty}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#0f172a", fontWeight: 600 }}>
                          <Eye size={13} style={{ color: "#047857" }} />
                          <span>{tip.views_count || 0}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`seller-badge seller-badge-${tip.is_published ? "approved" : "pending"}`}>
                          {tip.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Calendar size={12} />
                          {new Date(tip.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(tip)}
                            className="seller-btn seller-btn-secondary seller-btn-sm"
                            title="Edit Tip"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tip.id)}
                            className="seller-btn seller-btn-danger seller-btn-sm"
                            title="Delete Tip"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Care Tip Modal */}
        {showModal && (
          <div className="seller-modal-overlay">
            <div className="seller-modal seller-modal-large">
              <div className="seller-modal-header">
                <h3>{editingTip ? `Edit Care Tip: ${editingTip.title}` : "Create New Plant Care Tip"}</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="seller-modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="seller-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="seller-form-group">
                    <label htmlFor="ctTitle">Care Tip Title *</label>
                    <input
                      id="ctTitle"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. The Golden Rule of Watering Jade Plants in Winter"
                    />
                  </div>

                  <div className="seller-form-grid-3">
                    <div className="seller-form-group">
                      <label htmlFor="ctCategory">Care Category *</label>
                      <select
                        id="ctCategory"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      >
                        <option value="watering">Watering</option>
                        <option value="fertilizing">Fertilizing & Nutrients</option>
                        <option value="pest_control">Pest Control & Fungus</option>
                        <option value="indoor">Indoor Greenery Care</option>
                        <option value="outdoor">Outdoor Garden & Sunlight</option>
                        <option value="seasonal">Seasonal Plant Prep</option>
                      </select>
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="ctDiff">Difficulty Level *</label>
                      <select
                        id="ctDiff"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      >
                        <option value="beginner">Beginner Friendly</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced Specialist</option>
                      </select>
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="ctPub">Publication</label>
                      <select
                        id="ctPub"
                        value={formData.is_published ? "1" : "0"}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.value === "1" })}
                      >
                        <option value="1">Publish Live</option>
                        <option value="0">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="seller-form-group">
                    <label htmlFor="ctExcerpt">Short Preview / Excerpt</label>
                    <input
                      id="ctExcerpt"
                      type="text"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief summary of this care tip..."
                    />
                  </div>

                  {/* Photo upload */}
                  <div className="seller-form-group">
                    <label>Tip Visual / Illustration (Optional)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {imagePreview && (
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Tip Preview"
                            onError={(event) => handleImageError(event, DEFAULT_CARE_TIP_IMAGE)}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <label className="seller-btn seller-btn-secondary" style={{ cursor: "pointer" }}>
                        <Upload size={14} />
                        <span>{imagePreview ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="seller-form-group">
                    <label htmlFor="ctContent">Detailed Care Guide & Instructions *</label>
                    <textarea
                      id="ctContent"
                      rows={7}
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Provide step-by-step instructions, symptoms of overwatering or pests, and exact advice for healthy plant growth..."
                    />
                  </div>
                </div>

                <div className="seller-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="seller-btn seller-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="seller-btn seller-btn-primary"
                  >
                    {submitting ? "Saving..." : editingTip ? "Update Care Tip" : "Publish Care Tip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}

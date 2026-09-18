import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import "../../components/seller/seller.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: string;
  category?: string;
  views: number;
  is_published: boolean;
  created_at: string;
}

export default function SellerBlogs() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Plant Care",
    is_published: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/seller/blogs?per_page=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setBlogs(json.data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to load seller blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "Plant Care",
      is_published: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (blog: BlogItem) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content,
      category: blog.category || "Plant Care",
      is_published: blog.is_published,
    });
    setImageFile(null);
    setImagePreview(
      blog.image
        ? blog.image.startsWith("http")
          ? blog.image
          : `${API}/storage/${blog.image}`
        : null
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
      data.append("is_published", formData.is_published ? "1" : "0");

      if (imageFile) {
        data.append("image", imageFile);
      }

      const url = editingBlog
        ? `${API}/api/seller/blogs/${editingBlog.id}`
        : `${API}/api/seller/blogs`;

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
        throw new Error(json.message || "Failed to save blog article.");
      }

      setFeedback({
        type: "success",
        text: editingBlog ? "Blog article updated!" : "Blog article published successfully!",
      });
      setShowModal(false);
      fetchBlogs();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to submit blog." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this blog article?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/seller/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete blog", err);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || b.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const publishedCount = blogs.filter((b) => b.is_published).length;
  const draftCount = blogs.filter((b) => !b.is_published).length;
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  return (
    <SellerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header Bar */}
        <div className="seller-form-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Nursery Blogs & Articles
              </h2>
              <span className="seller-badge seller-badge-approved">
                <Sparkles size={12} />
                <span>Knowledge Hub</span>
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
              Share plant care advice, gardening insights, and propagation stories with plant lovers across Nepal.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="seller-btn seller-btn-primary"
          >
            <Plus size={16} />
            <span>Write New Article</span>
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

        {/* 4 KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Articles</span>
            <div className="seller-stat-value">{blogs.length}</div>
            <div className="seller-stat-caption">Created by your shop</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Live Published</span>
            <div className="seller-stat-value" style={{ color: "#059669" }}>{publishedCount}</div>
            <div className="seller-stat-caption" style={{ color: "#059669" }}>Publicly readable</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Draft Articles</span>
            <div className="seller-stat-value" style={{ color: "#ca8a04" }}>{draftCount}</div>
            <div className="seller-stat-caption">Unpublished</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Article Reads</span>
            <div className="seller-stat-value" style={{ color: "#0284c7" }}>{totalViews}</div>
            <div className="seller-stat-caption" style={{ color: "#0284c7" }}>Reader views</div>
          </div>
        </div>

        {/* Toolbar with Search */}
        <div className="seller-toolbar">
          <div className="seller-tab-group">
            {[
              { key: "all", label: "All Topics" },
              { key: "plant care", label: "Plant Care" },
              { key: "propagation", label: "Propagation" },
              { key: "indoor", label: "Indoor Greenery" },
              { key: "soil & fertilizers", label: "Soil & Fertilizers" },
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
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Blog Table / List */}
        <div className="seller-card">
          {loading ? (
            <div className="seller-empty-state">Loading your nursery articles...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon">
                <BookOpen size={26} />
              </div>
              <h4>No nursery blogs found</h4>
              <p>Write your first botanical care guide or plant story to educate your customers.</p>
            </div>
          ) : (
            <div className="seller-table-container">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Reads</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "10px",
                              background: "#f1f5f9",
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {b.image ? (
                              <img
                                src={
                                  b.image.startsWith("http")
                                    ? b.image
                                    : `${API}/storage/${b.image}`
                                }
                                alt={b.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#94a3b8",
                                  fontWeight: 700,
                                }}
                              >
                                <BookOpen size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>
                              {b.title}
                            </div>
                            {b.excerpt && (
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                {b.excerpt.slice(0, 60)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.8rem" }}>
                          {b.category || "General"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {b.author || "Your Shop"}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#0f172a", fontWeight: 600 }}>
                          <Eye size={13} style={{ color: "#047857" }} />
                          <span>{b.views || 0}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`seller-badge seller-badge-${b.is_published ? "approved" : "pending"}`}>
                          {b.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Calendar size={12} />
                          {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            className="seller-btn seller-btn-secondary seller-btn-sm"
                            title="Edit Article"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="seller-btn seller-btn-danger seller-btn-sm"
                            title="Delete Article"
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

        {/* Add/Edit Blog Modal */}
        {showModal && (
          <div className="seller-modal-overlay">
            <div className="seller-modal seller-modal-large">
              <div className="seller-modal-header">
                <h3>{editingBlog ? `Edit Blog: ${editingBlog.title}` : "Write New Nursery Blog Article"}</h3>
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
                    <label htmlFor="bTitle">Article Title *</label>
                    <input
                      id="bTitle"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. How to Care for Tropical Ferns in Kathmandu Valley"
                    />
                  </div>

                  <div className="seller-form-grid">
                    <div className="seller-form-group">
                      <label htmlFor="bCat">Topic Category *</label>
                      <input
                        id="bCat"
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Plant Care, Propagation, Soil Mix"
                      />
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="bPub">Publication Status</label>
                      <select
                        id="bPub"
                        value={formData.is_published ? "1" : "0"}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.value === "1" })}
                      >
                        <option value="1">Publish Immediately (Public)</option>
                        <option value="0">Save as Draft (Private)</option>
                      </select>
                    </div>
                  </div>

                  <div className="seller-form-group">
                    <label htmlFor="bExcerpt">Short Summary / Excerpt</label>
                    <input
                      id="bExcerpt"
                      type="text"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="A brief 1-2 sentence hook for readers..."
                    />
                  </div>

                  {/* Header Image */}
                  <div className="seller-form-group">
                    <label>Cover Image</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {imagePreview && (
                        <div
                          style={{
                            width: "70px",
                            height: "50px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Cover Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <label className="seller-btn seller-btn-secondary" style={{ cursor: "pointer" }}>
                        <Upload size={14} />
                        <span>{imagePreview ? "Change Cover Photo" : "Upload Cover Photo"}</span>
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
                    <label htmlFor="bContent">Article Content (Markdown / Story) *</label>
                    <textarea
                      id="bContent"
                      rows={8}
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your informative guide, step-by-step instructions, and plant advice..."
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
                    {submitting ? "Saving..." : editingBlog ? "Update Article" : "Publish Article"}
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

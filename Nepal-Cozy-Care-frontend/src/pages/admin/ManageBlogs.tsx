import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Upload,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Globe,
  FileText,
  Check,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { CURATED_BLOGS } from "../../features/blogs/curatedBlogs";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Blog {
  id: number;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  publish_date: string;
  views: number;
  status: "published" | "draft";
  image: string | null;
  isTopTrend: boolean;
  isTopStory: boolean;
}

interface BlogFormData {
  title: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  status: "published" | "draft";
  isTopTrend: boolean;
  isTopStory: boolean;
  image: string;
}

const CATEGORY_OPTIONS = [
  "Indoor Plants",
  "Plant Care & Hacks",
  "Plant Doctor",
  "Soil & Propagation",
  "Urban Living & Decor",
  "Seasonal Advice",
  "General",
];

const PRESET_IMAGES = [
  { label: "Lush Conservatory", path: "/images/blog-hero-lush.jpg" },
  { label: "Monstera Macro Leaf", path: "/images/blog-leaf-macro.jpg" },
  { label: "Indoor Green House", path: "/images/about-plants.jpg" },
  { label: "Snake Plant", path: "/images/snake.jpg" },
  { label: "Rubber Plant", path: "/images/rubber.jpg" },
  { label: "Winter Garden", path: "/images/winter-garden.png" },
];

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "trends">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // View mode: 'list' or 'editor'
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    author: "Sarah Johnson",
    category: "Indoor Plants",
    excerpt: "",
    content: "",
    status: "published",
    isTopTrend: false,
    isTopStory: false,
    image: "/images/blog-hero-lush.jpg",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("/images/blog-hero-lush.jpg");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    void fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/blogs`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const blogsData = data.data?.blogs || data.data?.data || data.data || [];
        const transformedBlogs: Blog[] = blogsData.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          author: blog.author || "Cozy Care Botanist",
          category: blog.category || "General",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          publish_date: blog.published_at || blog.created_at || new Date().toISOString(),
          views: blog.views || 0,
          status: blog.is_published ? "published" : "draft",
          image: blog.image,
          isTopTrend: Boolean(blog.is_top_trend),
          isTopStory: Boolean(blog.is_top_story),
        }));
        setBlogs(transformedBlogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Seed sample guides into database
  const handleSeedGuides = async () => {
    if (seeding) return;
    setSeeding(true);
    setStatusMessage(null);
    let successCount = 0;

    for (const guide of CURATED_BLOGS) {
      try {
        const res = await fetch(`${API}/api/blogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: guide.title,
            excerpt: guide.excerpt,
            content: guide.content,
            category: guide.category,
            author: guide.author,
            image: guide.image,
            is_published: true,
            is_top_trend: Boolean(guide.is_top_trend),
            is_top_story: Boolean(guide.is_featured),
          }),
        });
        if (res.ok) successCount++;
      } catch (e) {
        console.error("Seed error for guide:", guide.title, e);
      }
    }

    setSeeding(false);
    setStatusMessage({
      type: "success",
      text: `✓ Successfully populated ${successCount} curated plant care guides!`,
    });
    void fetchBlogs();
  };

  // Switch to Editor for creating new blog
  const handleCreateNew = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      author: "Sarah Johnson",
      category: "Indoor Plants",
      excerpt: "",
      content: "",
      status: "published",
      isTopTrend: false,
      isTopStory: false,
      image: "/images/blog-hero-lush.jpg",
    });
    setSelectedImageFile(null);
    setImagePreview("/images/blog-hero-lush.jpg");
    setViewMode("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Switch to Editor for modifying existing blog
  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      author: blog.author,
      category: blog.category,
      excerpt: blog.excerpt,
      content: blog.content,
      status: blog.status,
      isTopTrend: blog.isTopTrend,
      isTopStory: blog.isTopStory,
      image: blog.image || "/images/blog-hero-lush.jpg",
    });
    setSelectedImageFile(null);
    setImagePreview(
      blog.image
        ? blog.image.startsWith("http") || blog.image.startsWith("/")
          ? blog.image
          : `${API}/storage/${blog.image}`
        : "/images/blog-hero-lush.jpg"
    );
    setViewMode("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Save Blog (Create or Update)
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setStatusMessage({ type: "error", text: "Please enter both title and article content." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      let finalImagePath = formData.image;

      // Handle image file upload if user picked a new file
      if (selectedImageFile) {
        const fileData = new FormData();
        fileData.append("file", selectedImageFile);
        fileData.append("directory", "blogs");

        const uploadRes = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fileData,
        });

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          finalImagePath = uploadJson.data?.path || uploadJson.path || finalImagePath;
        }
      }

      const url = editingBlog ? `${API}/api/blogs/${editingBlog.id}` : `${API}/api/blogs`;
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          author: formData.author,
          image: finalImagePath,
          is_published: formData.status === "published",
          is_top_trend: formData.isTopTrend,
          is_top_story: formData.isTopStory,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to save blog post.");
      }

      setStatusMessage({
        type: "success",
        text: `✓ Blog "${formData.title}" ${editingBlog ? "updated" : "created"} successfully!`,
      });
      setViewMode("list");
      void fetchBlogs();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Error saving blog post." });
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Publish / Draft
  const handleTogglePublish = async (blog: Blog) => {
    const newPublished = blog.status !== "published";
    try {
      const res = await fetch(`${API}/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: newPublished }),
      });
      if (res.ok) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: newPublished ? "published" : "draft" } : b))
        );
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog?")) return;
    try {
      const res = await fetch(`${API}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setStatusMessage({ type: "success", text: "Article deleted successfully." });
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Insert formatting snippet into content textarea
  const handleInsertSnippet = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${snippet}` : snippet,
    }));
  };

  // Statistics
  const totalArticles = blogs.length;
  const totalPublished = blogs.filter((b) => b.status === "published").length;
  const totalDrafts = blogs.filter((b) => b.status === "draft").length;
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  // Filtered list
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchSearch =
        !searchQuery.trim() ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && blog.status === "published") ||
        (statusFilter === "draft" && blog.status === "draft") ||
        (statusFilter === "trends" && blog.isTopTrend);

      const matchCategory =
        categoryFilter === "all" || blog.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchSearch && matchStatus && matchCategory;
    });
  }, [blogs, searchQuery, statusFilter, categoryFilter]);

  return (
    <AdminLayout>
      <div style={{ padding: "1.75rem", maxWidth: "1440px", margin: "0 auto" }}>
        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            style={{
              padding: "0.9rem 1.25rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              fontSize: "0.92rem",
              fontWeight: 600,
              background: statusMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: statusMessage.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${statusMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.75rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#102e23", margin: 0 }}>
              {viewMode === "editor" ? (editingBlog ? "Edit Care Blog" : "Create New Care Blog") : "Care Blog Management"}
            </h1>
            <p style={{ color: "#64748b", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              Publish, design, and manage high-engagement plant care stories for your audience.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {viewMode === "editor" ? (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setViewMode("list")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <ArrowLeft size={16} /> Back to Blog List
              </button>
            ) : (
              <>
                <a
                  href="/blogs"
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn admin-btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}
                >
                  <Globe size={16} /> View Public Blog <ExternalLink size={14} />
                </a>

                <a
                  href="/admin/page-content?tab=blogs_page"
                  className="admin-btn admin-btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    textDecoration: "none",
                    borderColor: "#a7f3d0",
                    color: "#065f46",
                    background: "#ecfdf5",
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={16} /> Customize Page Hero (CMS)
                </a>

                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleCreateNew}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    backgroundColor: "#10b981",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={18} /> Create New Blog
                </button>
              </>
            )}
          </div>
        </div>

        {/* =====================================================================
            VIEW MODE A: FULL VISUAL BLOG EDITOR
            ===================================================================== */}
        {viewMode === "editor" ? (
          <form onSubmit={handleSaveBlog}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
                gap: "1.75rem",
                alignItems: "flex-start",
              }}
            >
              {/* Left Column: Article Content & Structure */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Title & Excerpt Card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#102e23", marginBottom: "0.4rem" }}>
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., The Ultimate Monstera Care Blueprint for Kathmandu Homes"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.85rem 1rem",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#102e23",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#102e23", marginBottom: "0.4rem" }}>
                      Lead Excerpt / Summary (Up to 500 characters)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief introductory hook that appears on the card preview and search results..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      maxLength={500}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.92rem",
                        lineHeight: 1.5,
                      }}
                    />
                    <div style={{ textAlign: "right", fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                      {formData.excerpt.length}/500 chars
                    </div>
                  </div>
                </div>

                {/* Rich Content Editor */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#102e23", margin: 0 }}>
                      Article Body Content *
                    </label>

                    {/* Quick Formatting Snippets */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleInsertSnippet("### Section Subheading\nYour paragraph text goes here.")}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "0.3rem 0.6rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        + H3 Heading
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertSnippet('> "Inspiring quote about plant care and nature."')}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "0.3rem 0.6rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        + Pullquote
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertSnippet("1. First actionable step\n2. Second actionable step\n3. Third actionable step")}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "0.3rem 0.6rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        + Numbered List
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={18}
                    required
                    placeholder="Write your article in detailed paragraphs. You can use markdown headings (### Heading) and blockquotes (> Quote)..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.96rem",
                      lineHeight: 1.7,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Publishing & Metadata Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Publish & Status Card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#102e23" }}>
                    Publishing Status
                  </h3>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
                      Publication State
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "published" | "draft" })}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontWeight: 600,
                        background: formData.status === "published" ? "#ecfdf5" : "#fef3c7",
                        color: formData.status === "published" ? "#065f46" : "#92400e",
                      }}
                    >
                      <option value="published">✓ Published (Publicly Visible)</option>
                      <option value="draft">✎ Draft (Private)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem", color: "#334155", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.isTopTrend}
                        onChange={(e) => setFormData({ ...formData, isTopTrend: e.target.checked })}
                      />
                      <span>Mark as <strong>Top Trend</strong> (flame badge & ticker)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem", color: "#334155", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.isTopStory}
                        onChange={(e) => setFormData({ ...formData, isTopStory: e.target.checked })}
                      />
                      <span>Mark as <strong>Featured Cover Story</strong></span>
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="admin-btn admin-btn-primary"
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.45rem",
                        padding: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: "#1b4e54",
                      }}
                    >
                      <Save size={18} /> {saving ? "Saving..." : editingBlog ? "Update Blog" : "Publish Article"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "0.75rem 1rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Category & Author Card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#102e23" }}>
                    Category & Author
                  </h3>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                      }}
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
                      Author Byline
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Sarah Johnson, Emily Rodriguez"
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

                {/* Cover Image & Presets */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#102e23" }}>
                    Cover Image
                  </h3>

                  {/* Thumbnail Preview */}
                  {imagePreview && (
                    <div style={{ marginBottom: "1rem", borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1", height: "160px" }}>
                      <img src={imagePreview} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  {/* File Upload Button */}
                  <label
                    className="admin-btn admin-btn-secondary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.45rem",
                      cursor: "pointer",
                      padding: "0.6rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    <Upload size={16} /> Upload From Computer
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {/* Botanical Presets */}
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem" }}>
                    Or Pick a High-Res Preset
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.path}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: preset.path });
                          setImagePreview(preset.path);
                          setSelectedImageFile(null);
                        }}
                        style={{
                          background: formData.image === preset.path ? "#e8f3ef" : "#f8fafc",
                          border: `1px solid ${formData.image === preset.path ? "#1b4e54" : "#e2e8f0"}`,
                          borderRadius: "8px",
                          padding: "0.45rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          color: formData.image === preset.path ? "#1b4e54" : "#475569",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        {formData.image === preset.path && <Check size={12} />} {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* =====================================================================
             VIEW MODE B: BLOG LIST & METRIC DASHBOARD
             ===================================================================== */
          <div>
            {/* Top Metric Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.25rem",
                marginBottom: "1.75rem",
              }}
            >
              <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: "0.84rem", color: "#64748b", fontWeight: 600 }}>Total Articles</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#102e23", marginTop: "0.25rem" }}>{totalArticles}</div>
              </div>

              <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: "0.84rem", color: "#065f46", fontWeight: 600 }}>Live Published</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981", marginTop: "0.25rem" }}>{totalPublished}</div>
              </div>

              <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: "0.84rem", color: "#92400e", fontWeight: 600 }}>Drafts in Progress</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.25rem" }}>{totalDrafts}</div>
              </div>

              <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: "0.84rem", color: "#1b4e54", fontWeight: 600 }}>Total Reader Views</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1b4e54", marginTop: "0.25rem" }}>{totalViews.toLocaleString()}</div>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div
              style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search by title, category, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.85rem 0.55rem 2.25rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.88rem",
                    }}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "0.55rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <option value="all">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: "flex", gap: "0.35rem", background: "#f1f5f9", padding: "0.25rem", borderRadius: "8px" }}>
                {(["all", "published", "draft", "trends"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      border: "none",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: statusFilter === s ? "#ffffff" : "transparent",
                      color: statusFilter === s ? "#102e23" : "#64748b",
                      boxShadow: statusFilter === s ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                      textTransform: "capitalize",
                    }}
                  >
                    {s === "trends" ? "🔥 Trends" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Blogs Table Card */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                overflow: "hidden",
              }}
            >
              {loading ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 600 }}>Loading care blogs...</div>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div style={{ padding: "4.5rem 2rem", textAlign: "center" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "#e8f3ef",
                      color: "#1b4e54",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <FileText size={28} />
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem", color: "#102e23", fontSize: "1.2rem" }}>
                    No care blog articles found
                  </h3>
                  <p style={{ color: "#64748b", maxWidth: "480px", margin: "0 auto 1.75rem", fontSize: "0.92rem", lineHeight: 1.5 }}>
                    Your care blog collection is currently empty. You can write a new article from scratch or instantly populate our 6 curated Kathmandu botanical guides!
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleSeedGuides}
                      disabled={seeding}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        padding: "0.65rem 1.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    >
                      <Sparkles size={16} color="#1b4e54" />
                      {seeding ? "Importing Guides..." : "🌿 Import 6 Curated Care Guides"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      onClick={handleCreateNew}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        padding: "0.65rem 1.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        backgroundColor: "#10b981",
                      }}
                    >
                      <Plus size={16} /> Create Custom Blog
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table admin-table-striped" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: "70px" }}>Cover</th>
                        <th>Title & Lead</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Views</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBlogs.map((blog) => (
                        <tr key={blog.id}>
                          <td>
                            <div
                              style={{
                                width: "54px",
                                height: "54px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <img
                                src={
                                  blog.image
                                    ? blog.image.startsWith("http") || blog.image.startsWith("/")
                                      ? blog.image
                                      : `${API}/storage/${blog.image}`
                                    : "/images/blog-hero-lush.jpg"
                                }
                                alt={blog.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#102e23", fontSize: "0.94rem", marginBottom: "0.2rem" }}>
                              {blog.title}
                              {blog.isTopTrend && (
                                <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", background: "#fee2e2", color: "#b91c1c", padding: "0.15rem 0.45rem", borderRadius: "999px", fontWeight: 700 }}>
                                  🔥 Trend
                                </span>
                              )}
                              {blog.isTopStory && (
                                <span style={{ marginLeft: "0.4rem", fontSize: "0.72rem", background: "#e0e7ff", color: "#4338ca", padding: "0.15rem 0.45rem", borderRadius: "999px", fontWeight: 700 }}>
                                  ★ Featured
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "380px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {blog.excerpt || "No excerpt provided."}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                background: "#e8f3ef",
                                color: "#1b4e54",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "6px",
                              }}
                            >
                              {blog.category}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 600 }}>{blog.author}</td>
                          <td style={{ fontSize: "0.85rem", color: "#64748b" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <Eye size={13} /> {blog.views.toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(blog)}
                              title="Click to toggle publish status"
                              style={{
                                border: "none",
                                cursor: "pointer",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "999px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: blog.status === "published" ? "#dcfce7" : "#fef3c7",
                                color: blog.status === "published" ? "#15803d" : "#b45309",
                              }}
                            >
                              {blog.status === "published" ? "✓ Published" : "✎ Draft"}
                            </button>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                              <a
                                href={`/blogs/${blog.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-action-btn admin-action-view"
                                title="View Live Article"
                              >
                                <Eye size={15} />
                              </a>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-edit"
                                title="Edit Article"
                                onClick={() => handleEditBlog(blog)}
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-delete"
                                title="Delete Article"
                                onClick={() => handleDeleteBlog(blog.id)}
                              >
                                <Trash2 size={15} />
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

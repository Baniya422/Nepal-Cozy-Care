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
import BlogDetailsFields, { detailsFromBlog, emptyBlogDetails, lines, type BlogDetailsForm } from "./BlogDetailsFields";
import { fetchAllBlogs, uploadBlogImage } from "../../features/blogs/blogData";
import AdminLayout from "../../components/admin/AdminLayout";
import { CURATED_BLOGS } from "../../features/blogs/curatedBlogs";
import "../../components/admin/admin.css";
import {
  DEFAULT_BLOG_IMAGE,
  handleImageError,
  resolveImageUrl,
} from "../../utils/imageUrl";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Blog {
  details: BlogDetailsForm;
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
    author: "Cozy Care Botanist",
    category: "Indoor Plants",
    excerpt: "",
    content: "",
    status: "published",
    isTopTrend: false,
    isTopStory: false,
    image: "/images/blog-hero-lush.jpg",
  });

  const [details, setDetails] = useState<BlogDetailsForm>(emptyBlogDetails);
  const [authorFile, setAuthorFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("/images/blog-hero-lush.jpg");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const token = localStorage.getItem("token");

  const clearPublicBlogCache = () => {
    try {
      localStorage.removeItem("cozy_cached_blogs");
    } catch {}
  };

  useEffect(() => {
    void fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const blogsData = await fetchAllBlogs(`${API}/api/admin/blogs`, token);
      {
        const transformedBlogs: Blog[] = blogsData.map((blog: any) => ({
          details: detailsFromBlog(blog),
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
      setStatusMessage({ type: "error", text: "Could not load all articles. Please refresh and try again." });
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
            author_role: guide.author_role, author_image: guide.author_image,
            author_bio: guide.author_bio || "", read_time: guide.read_time,
            tags: guide.tags, tips: guide.tips || [], takeaways: guide.takeaways || [],
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
    clearPublicBlogCache();
    setStatusMessage({
      type: "success",
      text: `✓ Successfully populated ${successCount} curated plant care guides!`,
    });
    void fetchBlogs();
  };

  // Switch to Editor for creating new blog
  const handleCreateNew = () => {
    setEditingBlog(null);
    setDetails(emptyBlogDetails);
    setAuthorFile(null);
    setFormData({
      title: "",
      author: "Cozy Care Botanist",
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
    setDetails(blog.details);
    setAuthorFile(null);
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
    setImagePreview(resolveImageUrl(blog.image, DEFAULT_BLOG_IMAGE));
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

      if (selectedImageFile) finalImagePath = await uploadBlogImage(API, token, selectedImageFile);
      const authorImagePath = authorFile ? await uploadBlogImage(API, token, authorFile) : details.author_image;

      const url = editingBlog ? `${API}/api/admin/blogs/${editingBlog.id}` : `${API}/api/admin/blogs`;
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...details,
          author_image: authorImagePath,
          tags: lines(details.tags), tips: lines(details.tips), takeaways: lines(details.takeaways),
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
      clearPublicBlogCache();
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
      const res = await fetch(`${API}/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: newPublished }),
      });
      if (res.ok) {
        clearPublicBlogCache();
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: newPublished ? "published" : "draft" } : b))
        );
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  // Quick Toggle Featured Story
  const handleToggleTopStory = async (blog: Blog) => {
    const newStory = !blog.isTopStory;
    setBlogs((prev) =>
      prev.map((b) => (b.id === blog.id ? { ...b, isTopStory: newStory } : b))
    );
    try {
      const res = await fetch(`${API}/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_top_story: newStory }),
      });
      if (res.ok) {
        clearPublicBlogCache();
      } else {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, isTopStory: !newStory } : b))
        );
      }
    } catch (err) {
      console.error("Toggle top story error:", err);
      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, isTopStory: !newStory } : b))
      );
    }
  };

  // Quick Toggle Trending
  const handleToggleTopTrend = async (blog: Blog) => {
    const newTrend = !blog.isTopTrend;
    setBlogs((prev) =>
      prev.map((b) => (b.id === blog.id ? { ...b, isTopTrend: newTrend } : b))
    );
    try {
      const res = await fetch(`${API}/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_top_trend: newTrend }),
      });
      if (res.ok) {
        clearPublicBlogCache();
      } else {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, isTopTrend: !newTrend } : b))
        );
      }
    } catch (err) {
      console.error("Toggle top trend error:", err);
      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, isTopTrend: !newTrend } : b))
      );
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog?")) return;
    try {
      const res = await fetch(`${API}/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        clearPublicBlogCache();
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
      <div style={{ padding: "clamp(1.25rem,3vw,2rem)", maxWidth: "1440px", margin: "0 auto", fontFamily: "'Outfit',system-ui,sans-serif" }}>
        {/* Status Toast */}
        {statusMessage && (
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "100px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              fontWeight: 600,
              background: statusMessage.type === "success" ? "rgba(45,80,22,0.1)" : "rgba(196,98,45,0.1)",
              color: statusMessage.type === "success" ? "#2d5016" : "#c4622d",
              border: `1px solid ${statusMessage.type === "success" ? "rgba(45,80,22,0.25)" : "rgba(196,98,45,0.25)"}`,
            }}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
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
            marginBottom: "2rem",
          }}
        >
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".16em", color: "#c4622d", textTransform: "uppercase", marginBottom: 6 }}>
              {viewMode === "editor" ? (editingBlog ? "Editing" : "Create") : "Blog Management"}
            </div>
            <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "clamp(1.6rem,2.8vw,2.2rem)", fontWeight: 400, color: "#1c1a16", margin: 0, letterSpacing: "-.02em" }}>
              {viewMode === "editor" ? (editingBlog ? editingBlog.title.slice(0, 40) + "…" : "New Article") : "Editorial Journal"}
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {viewMode === "editor" ? (
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "9px 20px", borderRadius: "100px",
                  border: "1px solid rgba(28,26,22,0.15)", background: "transparent",
                  color: "#7a7060", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13,
                }}
              >
                <ArrowLeft size={14} /> Back to List
              </button>
            ) : (
              <>
                <a
                  href="/blogs"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "9px 18px", borderRadius: "100px",
                    border: "1px solid rgba(28,26,22,0.15)", background: "transparent",
                    color: "#7a7060", textDecoration: "none", fontFamily: "'Outfit',sans-serif", fontSize: 13,
                  }}
                >
                  <Globe size={14} /> View Blog <ExternalLink size={12} />
                </a>

                <a
                  href="/admin/page-content?tab=blogs_page"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "9px 18px", borderRadius: "100px",
                    border: "1px solid rgba(45,80,22,0.3)", background: "rgba(45,80,22,0.08)",
                    color: "#2d5016", textDecoration: "none", fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} /> Customize Hero
                </a>

                <button
                  type="button"
                  onClick={handleCreateNew}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "10px 22px", borderRadius: "100px",
                    border: "none", background: "#2d5016",
                    color: "#f7f4ef", cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600,
                    boxShadow: "0 4px 16px rgba(45,80,22,0.25)",
                    transition: "transform .2s, box-shadow .2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                >
                  <Plus size={16} /> New Article
                </button>
              </>
            )}
          </div>
        </div>

        {/* =====================================================================
            VIEW MODE A: FIGMA-STYLE BLOG EDITOR
            ===================================================================== */}
        {viewMode === "editor" ? (
          <form onSubmit={handleSaveBlog}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.8fr) minmax(300px, 1fr)",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              {/* ── LEFT: Content & Structure ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Title & Excerpt */}
                <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid rgba(28,26,22,0.1)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".16em", color: "#c4622d", textTransform: "uppercase", marginBottom: 16 }}>Article</div>

                  <input
                    type="text"
                    required
                    placeholder="Article title…"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: "100%", padding: "0 0 16px", border: "none",
                      borderBottom: "1px solid rgba(28,26,22,0.12)",
                      fontFamily: "'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 400,
                      color: "#1c1a16", outline: "none", marginBottom: 16,
                      background: "transparent",
                    }}
                  />

                  <textarea
                    rows={2}
                    placeholder="Short excerpt shown in blog listing…"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    maxLength={500}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid rgba(28,26,22,0.12)", resize: "none",
                      fontFamily: "'Outfit',sans-serif", fontSize: 13, lineHeight: 1.7,
                      color: "#7a7060", outline: "none", background: "#f7f4ef",
                    }}
                  />
                  <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", marginTop: 6 }}>
                    {formData.excerpt.length}/500
                  </div>
                </div>

                {/* Content Editor */}
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(28,26,22,0.1)" }}>
                  {/* Toolbar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid rgba(28,26,22,0.08)", background: "#f7f4ef", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".16em", color: "#7a7060", textTransform: "uppercase" }}>Content</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { label: "+ H2 Heading", snippet: "## Section Heading\n\nYour paragraph text here." },
                        { label: "+ Pullquote", snippet: '> "Your inspiring quote here."' },
                        { label: "+ Numbered List", snippet: "1. First step\n2. Second step\n3. Third step" },
                        { label: "+ Tip", snippet: "🌱 **Grower's tip:** Your care advice here." },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => handleInsertSnippet(s.snippet)}
                          style={{
                            padding: "5px 10px", borderRadius: 100,
                            border: "1px solid rgba(28,26,22,0.15)", background: "#fff",
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                            letterSpacing: ".08em", color: "#1c1a16", cursor: "pointer",
                            transition: "background .15s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,80,22,0.08)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={20}
                    required
                    placeholder={`Write your article here using plain text or markdown:\n\n## Section heading\nParagraph text goes here…\n\n> "A memorable quote or pullquote."\n\n1. Actionable step one\n2. Actionable step two`}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{
                      width: "100%", padding: "20px 24px",
                      border: "none", resize: "vertical",
                      fontFamily: "'Outfit',sans-serif", fontSize: 15, lineHeight: 1.8,
                      color: "#1c1a16", outline: "none", background: "#fff",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 24px", borderTop: "1px solid rgba(28,26,22,0.08)", background: "#f7f4ef" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060" }}>
                      {formData.content.trim().split(/\s+/).filter(Boolean).length} words
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060" }}>
                      ~{Math.ceil(formData.content.trim().split(/\s+/).filter(Boolean).length / 200)} min read
                    </div>
                  </div>
                </div>
                <BlogDetailsFields value={details} onChange={setDetails} author={formData.author} file={authorFile} onFileChange={setAuthorFile} />
              </div>

              {/* ── RIGHT: Sidebar ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Publish settings */}
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(28,26,22,0.1)" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(28,26,22,0.08)", fontFamily: "'Fraunces',Georgia,serif", fontSize: 15, fontWeight: 400, color: "#1c1a16" }}>Publish Settings</div>
                  <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Status toggle */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c1a16" }}>Status</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", marginTop: 2 }}>
                          {formData.status === "published" ? "Publicly visible" : "Hidden from public"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, status: f.status === "published" ? "draft" : "published" }))}
                        style={{
                          padding: "5px 14px", borderRadius: 100, cursor: "pointer",
                          fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".1em",
                          textTransform: "uppercase", fontWeight: 600, transition: "all .2s",
                          background: formData.status === "published" ? "rgba(45,80,22,0.1)" : "transparent",
                          color: formData.status === "published" ? "#2d5016" : "#7a7060",
                          border: `1px solid ${formData.status === "published" ? "#2d5016" : "rgba(28,26,22,0.15)"}`,
                        }}
                      >
                        {formData.status === "published" ? "● Live" : "○ Draft"}
                      </button>
                    </div>

                    {/* Featured toggle */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c1a16" }}>Top Trend</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", marginTop: 2 }}>🔥 Flame badge & ticker</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, isTopTrend: !f.isTopTrend }))}
                        style={{
                          width: 42, height: 24, borderRadius: 100, border: "none",
                          cursor: "pointer", position: "relative", transition: "background .25s",
                          background: formData.isTopTrend ? "#2d5016" : "#ede8e0",
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", background: "#fff",
                          position: "absolute", top: 3,
                          left: formData.isTopTrend ? 21 : 3, transition: "left .25s",
                        }} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c1a16" }}>Featured Story</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", marginTop: 2 }}>★ Show in hero section</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, isTopStory: !f.isTopStory }))}
                        style={{
                          width: 42, height: 24, borderRadius: 100, border: "none",
                          cursor: "pointer", position: "relative", transition: "background .25s",
                          background: formData.isTopStory ? "#c4622d" : "#ede8e0",
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", background: "#fff",
                          position: "absolute", top: 3,
                          left: formData.isTopStory ? 21 : 3, transition: "left .25s",
                        }} />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          flex: 1, display: "inline-flex", alignItems: "center",
                          justifyContent: "center", gap: 8,
                          padding: "11px", borderRadius: 100, border: "none",
                          background: "#2d5016", color: "#f7f4ef",
                          fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600,
                          cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .7 : 1,
                          boxShadow: "0 4px 16px rgba(45,80,22,0.25)",
                        }}
                      >
                        <Save size={15} /> {saving ? "Saving…" : editingBlog ? "Update" : "🌿 Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        style={{
                          padding: "11px 18px", borderRadius: 100,
                          border: "1px solid rgba(28,26,22,0.15)", background: "transparent",
                          color: "#7a7060", cursor: "pointer",
                          fontFamily: "'Outfit',sans-serif", fontSize: 13,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category & Author */}
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(28,26,22,0.1)" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(28,26,22,0.08)", fontFamily: "'Fraunces',Georgia,serif", fontSize: 15, fontWeight: 400, color: "#1c1a16" }}>Metadata</div>
                  <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".12em", color: "#7a7060", textTransform: "uppercase", marginBottom: 8 }}>Category</div>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{
                          width: "100%", padding: "9px 14px", borderRadius: 10,
                          border: "1px solid rgba(28,26,22,0.12)",
                          background: "#f7f4ef", color: "#1c1a16",
                          fontFamily: "'Outfit',sans-serif", fontSize: 13, outline: "none",
                        }}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".12em", color: "#7a7060", textTransform: "uppercase", marginBottom: 8 }}>Author</div>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="e.g. Priya Shrestha"
                        style={{
                          width: "100%", padding: "9px 14px", borderRadius: 10,
                          border: "1px solid rgba(28,26,22,0.12)",
                          background: "#f7f4ef", color: "#1c1a16",
                          fontFamily: "'Outfit',sans-serif", fontSize: 13, outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid rgba(28,26,22,0.1)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(28,26,22,0.08)", fontFamily: "'Fraunces',Georgia,serif", fontSize: 15, fontWeight: 400, color: "#1c1a16" }}>Cover Image</div>
                  <div style={{ padding: 18 }}>

                  {/* Thumbnail Preview */}
                  {imagePreview && (
                    <div style={{ marginBottom: "1rem", borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1", height: "160px" }}>
                      <img
                        key={imagePreview}
                        src={imagePreview}
                        alt="Cover Preview"
                        onError={(event) => handleImageError(event, DEFAULT_BLOG_IMAGE)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}

                  {/* Direct Image URL input */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.3rem" }}>
                      Image URL or File Path
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(resolveImageUrl(e.target.value, DEFAULT_BLOG_IMAGE));
                        setSelectedImageFile(null);
                      }}
                      placeholder="Paste image URL (https://... or /images/...)"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.88rem",
                      }}
                    />
                  </div>

                  {/* File Upload Button */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px dashed rgba(28,26,22,0.2)",
                      background: "#f7f4ef",
                      cursor: "pointer",
                      fontFamily: "'Outfit',sans-serif",
                      fontSize: 13,
                      color: "#7a7060",
                      marginBottom: 14,
                    }}
                  >
                    <Upload size={14} /> {selectedImageFile ? `✓ ${selectedImageFile.name}` : "Upload from computer"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setSelectedImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                      }}
                    />
                  </label>

                  {/* Presets */}
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".12em", color: "#7a7060", textTransform: "uppercase", marginBottom: 8 }}>Pick a preset</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
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
                          background: formData.image === preset.path ? "rgba(45,80,22,0.1)" : "#f7f4ef",
                          border: `1px solid ${formData.image === preset.path ? "#2d5016" : "rgba(28,26,22,0.12)"}`,
                          borderRadius: 8, padding: "7px 10px",
                          fontFamily: "'Outfit',sans-serif", fontSize: 12,
                          fontWeight: formData.image === preset.path ? 600 : 400,
                          cursor: "pointer",
                          color: formData.image === preset.path ? "#2d5016" : "#7a7060",
                          textAlign: "left",
                          display: "flex", alignItems: "center", gap: 6,
                          transition: "all .15s",
                        }}
                      >
                        {formData.image === preset.path && <Check size={11} />} {preset.label}
                      </button>
                    ))}
                  </div>
                  </div>{/* end padding:18 */}
                </div>{/* end card */}
              </div>{/* end sidebar */}
            </div>{/* end grid */}
          </form>

        ) : (
          /* =====================================================================
             VIEW MODE B: EDITORIAL BLOG LIST
             ===================================================================== */
          <div>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "📝", label: "Total Articles", value: totalArticles,            color: "#2d5016", sub: "in journal" },
                { icon: "✅", label: "Published",      value: totalPublished,           color: "#1a6b8a", sub: "live" },
                { icon: "📋", label: "Drafts",         value: totalDrafts,              color: "#8a6b1a", sub: "in progress" },
                { icon: "👁",  label: "Total Views",    value: totalViews.toLocaleString(), color: "#c4622d", sub: "all time" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    background: "#fff", borderRadius: 14, padding: "20px 22px 18px",
                    border: "1px solid rgba(28,26,22,0.1)",
                    animation: `fadeUp .6s cubic-bezier(.23,1,.32,1) ${i * 0.06}s both`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: s.color, background: `${s.color}12`, padding: "3px 8px", borderRadius: 100 }}>{s.sub}</span>
                  </div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 30, fontWeight: 400, color: "#1c1a16", letterSpacing: "-.02em", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#7a7060", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter Controls Bar */}
            <div style={{
              background: "#fff", borderRadius: 14, padding: "12px 16px",
              border: "1px solid rgba(28,26,22,0.1)", marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "12px",
            }}>
              {/* Search + Category */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={14} color="#7a7060" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search title, category, author…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%", padding: "9px 14px 9px 34px", borderRadius: 100,
                      border: "1px solid rgba(28,26,22,0.12)", background: "#f7f4ef",
                      fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#1c1a16", outline: "none",
                    }}
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 100,
                    border: "1px solid rgba(28,26,22,0.12)", background: "#f7f4ef",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                    letterSpacing: ".08em", color: "#1c1a16", outline: "none",
                  }}
                >
                  <option value="all">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Status tabs */}
              <div style={{ display: "flex", gap: 2, background: "#f7f4ef", padding: "3px", borderRadius: 10 }}>
                {(["all", "published", "draft", "trends"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      border: "none", padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                      fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                      letterSpacing: ".1em", textTransform: "uppercase",
                      background: statusFilter === s ? "#fff" : "transparent",
                      color: statusFilter === s ? "#1c1a16" : "#7a7060",
                      boxShadow: statusFilter === s ? "0 1px 4px rgba(28,26,22,0.08)" : "none",
                      transition: "all .2s",
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
                                src={resolveImageUrl(blog.image, DEFAULT_BLOG_IMAGE)}
                                alt={blog.title}
                                onError={(event) => handleImageError(event, DEFAULT_BLOG_IMAGE)}
                                loading="lazy"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#102e23", fontSize: "0.94rem", marginBottom: "0.2rem", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.35rem" }}>
                              <span>{blog.title}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleTopTrend(blog)}
                                title={blog.isTopTrend ? "Currently Trending — click to toggle off" : "Click to mark as Trending"}
                                style={{
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "0.72rem",
                                  background: blog.isTopTrend ? "#fee2e2" : "#f1f5f9",
                                  color: blog.isTopTrend ? "#b91c1c" : "#94a3b8",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "999px",
                                  fontWeight: 700,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {blog.isTopTrend ? "🔥 Trend" : "+ Trend"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleTopStory(blog)}
                                title={blog.isTopStory ? "Featured in Hero — click to toggle off" : "Click to set as Featured in Hero"}
                                style={{
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "0.72rem",
                                  background: blog.isTopStory ? "#e0e7ff" : "#f1f5f9",
                                  color: blog.isTopStory ? "#4338ca" : "#94a3b8",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "999px",
                                  fontWeight: 700,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {blog.isTopStory ? "★ Featured" : "+ Feature"}
                              </button>
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

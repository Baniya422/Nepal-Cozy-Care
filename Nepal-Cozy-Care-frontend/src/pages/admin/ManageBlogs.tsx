import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
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
}

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    author: "",
    category: "Care Guide",
    excerpt: "",
    content: "",
    status: "draft",
    isTopTrend: false,
    isTopStory: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const blogsData = data.data?.blogs || data.data?.data || data.data || [];
        // Transform to match our interface
        const transformedBlogs = blogsData.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          author: blog.author || "Admin",
          category: blog.category || "General",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          publish_date: blog.published_at || blog.created_at,
          views: blog.views || Math.floor(Math.random() * 5000),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let imagePath = null;

      // Upload image if new image is selected
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append("file", selectedImage);
        formDataImage.append("directory", "blogs");

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
          const errorData = await uploadRes.json();
          alert(`Image upload failed: ${errorData.message || "Unknown error"}`);
          return; // Stop if image upload fails
        }
      }

      // For editing, keep the existing image if no new one uploaded
      if (editingBlog && !imagePath && editingBlog.image) {
        imagePath = editingBlog.image;
      }

      const url = editingBlog
        ? `${API}/api/blogs/${editingBlog.id}`
        : `${API}/api/blogs`;
      const method = editingBlog ? "PUT" : "POST";

      const requestBody: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        author: formData.author,
        is_published: formData.status === "published",
        is_top_trend: formData.isTopTrend,
        is_top_story: formData.isTopStory,
      };

      // Add image if we have one
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
        alert(editingBlog ? "Blog updated successfully!" : "Blog created successfully!");
        setShowModal(false);
        resetForm();
        fetchBlogs();
      } else {
        const error = await res.json();
        console.error("Save error:", error);
        alert(error.message || "Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog. Please check the console for details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchBlogs();
      } else {
        alert("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handlePublish = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/blogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: true }),
      });

      if (res.ok) {
        fetchBlogs();
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
    }
  };

  const handleEdit = (blog: Blog) => {
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
    });
    setImagePreview(blog.image ? `${API}/storage/${blog.image}` : null);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingBlog(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "Care Guide",
      excerpt: "",
      content: "",
      status: "draft",
      isTopTrend: false,
      isTopStory: false,
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Manage Care Blogs</h2>
            <p>Create, edit, or publish blog posts about plant care</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
            <Plus size={18} />
            Create New Blog
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading blogs...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Publish Date</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <strong>{blog.title}</strong>
                    </td>
                    <td>{blog.author}</td>
                    <td>{blog.category}</td>
                    <td>{formatDate(blog.publish_date)}</td>
                    <td>{blog.views.toLocaleString()}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          blog.status === "published"
                            ? "admin-status-active"
                            : "admin-status-pending"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn admin-action-view" title="View">
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-edit"
                          title="Edit"
                          onClick={() => handleEdit(blog)}
                        >
                          <Edit size={16} />
                        </button>
                        {blog.status === "draft" && (
                          <button
                            className="admin-action-btn"
                            style={{ background: "#dbeafe", color: "#2563eb" }}
                            title="Publish"
                            onClick={() => handlePublish(blog.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="admin-action-btn admin-action-delete"
                          title="Delete"
                          onClick={() => handleDelete(blog.id)}
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

          {!loading && filteredBlogs.length === 0 && (
            <div className="admin-empty-state">
              <p>No blogs found. Create your first blog post!</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingBlog ? "Edit Blog" : "Create New Blog"}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Blog Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Author *</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Care Guide">Care Guide</option>
                      <option value="Tips">Tips</option>
                      <option value="Troubleshooting">Troubleshooting</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as "published" | "draft" })
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isTopTrend}
                        onChange={(e) => setFormData({ ...formData, isTopTrend: e.target.checked })}
                      />
                      <span style={{ marginLeft: '8px' }}>Mark as Top Trend 📶</span>
                    </label>
                  </div>
                  <div className="admin-form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isTopStory}
                        onChange={(e) => setFormData({ ...formData, isTopStory: e.target.checked })}
                      />
                      <span style={{ marginLeft: '8px' }}>Mark as Top Story ⭐</span>
                    </label>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Excerpt (Short Description)</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    placeholder="Brief summary of the blog (shown in preview)..."
                  />
                </div>
                <div className="admin-form-group">
                  <label>Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                    placeholder="Write your blog content here..."
                  />
                </div>
                <div className="admin-form-group">
                  <label>Blog Image</label>
                  <div className="admin-image-upload">
                    {imagePreview && (
                      <div className="admin-image-preview">
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
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingBlog ? "Update Blog" : "Create Blog"}
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

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface CareTip {
  id: number;
  title: string;
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

export default function ManageCareTips() {
  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<CareTip | null>(null);
  const [formData, setFormData] = useState<CareTipFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "watering",
    difficulty: "beginner",
    status: "draft",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchCareTips();
  }, []);

  const fetchCareTips = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/care-tips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const tipsData = data.data?.tips || data.data?.data || data.data || [];
        // Transform to match our interface
        const transformedTips = tipsData.map((tip: any) => ({
          id: tip.id,
          title: tip.title,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const token = localStorage.getItem("token");

    try {
      let imagePath = null;

      // Upload image if new image is selected
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
          // Don't fail if image upload fails, but log it
          console.error("Image upload failed");
        }
      }

      const url = editingTip
        ? `${API}/api/care-tips/${editingTip.id}`
        : `${API}/api/care-tips`;
      const method = editingTip ? "PUT" : "POST";

      const requestBody: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        difficulty: formData.difficulty,
        is_published: formData.status === "published",
      };

      // Only add image if we have one
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
        setShowModal(false);
        resetForm();
        fetchCareTips();
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

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/care-tips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchCareTips();
      } else {
        alert("Failed to delete care tip");
      }
    } catch (error) {
      console.error("Error deleting care tip:", error);
    }
  };

  const handlePublish = async (id: number) => {
    const token = localStorage.getItem("token");
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
        fetchCareTips();
      }
    } catch (error) {
      console.error("Error publishing care tip:", error);
    }
  };

  const handleEdit = (tip: CareTip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      excerpt: "",
      content: "",
      category: (tip.category as any) || "watering",
      difficulty: (tip.difficulty as any) || "beginner",
      status: tip.status,
    });
    setImagePreview(tip.image ? `${API}/storage/${tip.image}` : null);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingTip(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "watering",
      difficulty: "beginner",
      status: "draft",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSubmitError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      tip.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2>Manage Care Tips</h2>
            <p>Create, edit, or publish care tips for plant enthusiasts</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
            <Plus size={18} />
            Create New Tip
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search care tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading care tips...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Created Date</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTips.map((tip) => (
                  <tr key={tip.id}>
                    <td>
                      <strong>{tip.title}</strong>
                    </td>
                    <td>{getCategoryLabel(tip.category)}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${getDifficultyColor(tip.difficulty)}`}
                      >
                        {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(tip.created_date)}</td>
                    <td>{tip.views_count.toLocaleString()}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          tip.status === "published"
                            ? "admin-status-active"
                            : "admin-status-pending"
                        }`}
                      >
                        {tip.status}
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
                          onClick={() => handleEdit(tip)}
                        >
                          <Edit size={16} />
                        </button>
                        {tip.status === "draft" && (
                          <button
                            className="admin-action-btn"
                            style={{ background: "#dbeafe", color: "#2563eb" }}
                            title="Publish"
                            onClick={() => handlePublish(tip.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="admin-action-btn admin-action-delete"
                          title="Delete"
                          onClick={() => handleDelete(tip.id)}
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

        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingTip ? "Edit Care Tip" : "Create New Care Tip"}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {submitError && (
                <div style={{ padding: "1rem", background: "#fee2e2", color: "#dc2626", borderRadius: "4px", margin: "1rem" }}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Care Tip Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g., How to Water Your Cactus"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as CareTipFormData["category"],
                        })
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as CareTipFormData["difficulty"],
                        })
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "published" | "draft",
                        })
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
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    placeholder="Brief summary of the care tip..."
                  />
                </div>

                <div className="admin-form-group">
                  <label>Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                    placeholder="Write your care tip content here... Include detailed instructions and tips."
                  />
                </div>

                <div className="admin-form-group">
                  <label>Featured Image</label>
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

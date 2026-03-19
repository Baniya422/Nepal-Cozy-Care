import { useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2, Upload, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Reminder = {
  id: number;
  title: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  season_key: string;
  city?: string | null;
  priority: number;
  status: "published" | "draft";
  care_tip_id?: number | null;
  care_tip_title?: string | null;
};

type CareTipOption = {
  id: number;
  title: string;
  category: string;
};

type FormState = {
  title: string;
  excerpt: string;
  content: string;
  season_key: string;
  city: string;
  priority: string;
  care_tip_id: string;
  status: "published" | "draft";
};

const seasonOptions = [
  { value: "all", label: "All Year" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "monsoon", label: "Monsoon" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
];

const emptyForm: FormState = {
  title: "",
  excerpt: "",
  content: "",
  season_key: "monsoon",
  city: "",
  priority: "0",
  care_tip_id: "",
  status: "draft",
};

const extractErrorMessage = (data: any, fallback: string) => {
  const validationMessages = Object.values(data?.errors ?? {}).flat();
  const firstValidationMessage = validationMessages.find(
    (message): message is string => typeof message === "string"
  );

  return data?.message || firstValidationMessage || fallback;
};

export default function ManageSeasonalReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [careTips, setCareTips] = useState<CareTipOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchReminders(), fetchCareTips()]);
  }, []);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/seasonal-reminders`, {
        headers: authHeader(),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load seasonal reminders.");
      }

      const items = (data.data?.reminders ?? []) as any[];
      setReminders(
        items.map((item) => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          image: item.image,
          season_key: item.season_key,
          city: item.city,
          priority: Number(item.priority ?? 0),
          status: item.is_published ? "published" : "draft",
          care_tip_id: item.care_tip_id,
          care_tip_title: item.care_tip?.title ?? null,
        }))
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load seasonal reminders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCareTips = async () => {
    try {
      const response = await fetch(`${API}/api/admin/care-tips?per_page=100`, {
        headers: authHeader(),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) return;

      const items = (data.data?.tips ?? []) as CareTipOption[];
      setCareTips(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error loading care tips:", error);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setEditingReminder(null);
    setError(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      excerpt: reminder.excerpt ?? "",
      content: reminder.content,
      season_key: reminder.season_key,
      city: reminder.city ?? "",
      priority: String(reminder.priority),
      care_tip_id: reminder.care_tip_id ? String(reminder.care_tip_id) : "",
      status: reminder.status,
    });
    setSelectedImage(null);
    setImagePreview(reminder.image ? `${API}/storage/${reminder.image}` : null);
    setShowModal(true);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      let imagePath = editingReminder?.image ?? null;

      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append("file", selectedImage);
        uploadData.append("directory", "seasonal-reminders");

        const uploadResponse = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: authHeader(),
          body: uploadData,
        });

        const uploadJson = await uploadResponse.json().catch(() => ({}));

        if (!uploadResponse.ok) {
          throw new Error(uploadJson.message || "Could not upload image.");
        }

        imagePath = uploadJson.data?.path || null;
      }

      const response = await fetch(
        editingReminder
          ? `${API}/api/seasonal-reminders/${editingReminder.id}`
          : `${API}/api/seasonal-reminders`,
        {
          method: editingReminder ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({
            title: formData.title,
            excerpt: formData.excerpt || null,
            content: formData.content,
            season_key: formData.season_key,
            city: formData.city || null,
            priority: Number(formData.priority || 0),
            care_tip_id: formData.care_tip_id ? Number(formData.care_tip_id) : null,
            is_published: formData.status === "published",
            image: imagePath,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Could not save seasonal reminder."));
      }

      setShowModal(false);
      resetForm();
      await fetchReminders();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save seasonal reminder.");
    }
  };

  const handleDelete = async (reminderId: number) => {
    if (!window.confirm("Delete this seasonal reminder?")) return;

    try {
      const response = await fetch(`${API}/api/seasonal-reminders/${reminderId}`, {
        method: "DELETE",
        headers: authHeader(),
      });

      if (!response.ok) {
        throw new Error("Could not delete seasonal reminder.");
      }

      await fetchReminders();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not delete seasonal reminder.");
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    const haystack = `${reminder.title} ${reminder.city ?? ""} ${reminder.season_key} ${reminder.care_tip_title ?? ""}`;
    return haystack.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Manage Seasonal Reminders</h2>
            <p>Create Nepal-based reminder cards that appear in the user My Garden dashboard.</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openAdd}>
            <Plus size={18} />
            New Reminder
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {error ? <div className="admin-error">{error}</div> : null}

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading reminders...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Season</th>
                  <th>City</th>
                  <th>Linked Tip</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReminders.map((reminder) => (
                  <tr key={reminder.id}>
                    <td>
                      <strong>{reminder.title}</strong>
                    </td>
                    <td>{seasonOptions.find((option) => option.value === reminder.season_key)?.label || reminder.season_key}</td>
                    <td>{reminder.city || "All Nepal"}</td>
                    <td>{reminder.care_tip_title || "None"}</td>
                    <td>{reminder.priority}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          reminder.status === "published"
                            ? "admin-status-active"
                            : "admin-status-pending"
                        }`}
                      >
                        {reminder.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn admin-action-edit"
                          onClick={() => openEdit(reminder)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-delete"
                          onClick={() => void handleDelete(reminder.id)}
                          title="Delete"
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

          {!loading && filteredReminders.length === 0 ? (
            <div className="admin-empty-state">
              <p>No reminders found yet.</p>
            </div>
          ) : null}
        </div>

        {showModal ? (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal admin-modal-large" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingReminder ? "Edit Seasonal Reminder" : "Create Seasonal Reminder"}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="admin-form">
                {error ? <div className="admin-error">{error}</div> : null}

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                      required
                    />
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
                  <div className="admin-form-group">
                    <label>Season</label>
                    <select
                      value={formData.season_key}
                      onChange={(event) => setFormData((current) => ({ ...current, season_key: event.target.value }))}
                    >
                      {seasonOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(event) => setFormData((current) => ({ ...current, city: event.target.value }))}
                      placeholder="Leave empty for all Nepal"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Priority</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.priority}
                      onChange={(event) => setFormData((current) => ({ ...current, priority: event.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Related Care Tip</label>
                    <select
                      value={formData.care_tip_id}
                      onChange={(event) => setFormData((current) => ({ ...current, care_tip_id: event.target.value }))}
                    >
                      <option value="">None</option>
                      {careTips.map((tip) => (
                        <option key={tip.id} value={tip.id}>
                          {tip.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Short Summary</label>
                  <textarea
                    rows={3}
                    value={formData.excerpt}
                    onChange={(event) => setFormData((current) => ({ ...current, excerpt: event.target.value }))}
                    placeholder="Small summary shown on user dashboard"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Detailed Content *</label>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(event) => setFormData((current) => ({ ...current, content: event.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Reminder Image</label>
                  <div className="admin-image-upload">
                    {imagePreview ? (
                      <div className="admin-image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    ) : null}
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
                    {editingReminder ? "Update Reminder" : "Create Reminder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

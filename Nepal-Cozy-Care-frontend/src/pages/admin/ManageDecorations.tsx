import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Box,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Upload,
  CheckCircle,
  Archive,
  Sparkles,
  Info,
  X,
  RefreshCw,
  Layers,
} from "lucide-react";
import "../../styles/adminDecorations.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface DecorationItem {
  id: number;
  name: string;
  slug: string;
  category: "plants" | "furniture" | "pots" | "decorations";
  description: string | null;
  suitable_room_types: string[] | null;
  width: number;
  depth: number;
  height: number;
  default_color: string;
  thumbnail_url: string | null;
  model_url: string | null;
  model_scale: number;
  model_rotation_offset: number;
  floor_alignment: "floor" | "tabletop" | "wall";
  plant_id: number | null;
  status: "draft" | "published" | "archived";
  source_type: "manual_upload" | "image_to_3d" | "built_in";
  created_at: string;
}

/**
 * 3D Model preview inside Admin modal
 */
function ModalModelPreview({
  modelUrl,
  scale = 1,
  rotation = 0,
  color = "#276749",
}: {
  modelUrl: string | null;
  scale?: number;
  rotation?: number;
  color?: string;
}) {
  if (!modelUrl) {
    return (
      <mesh position={[0, 0.4 * scale, 0]} rotation={[0, rotation, 0]}>
        <boxGeometry args={[0.8 * scale, 0.8 * scale, 0.8 * scale]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    );
  }

  return (
    <Suspense
      fallback={
        <mesh position={[0, 0.4 * scale, 0]}>
          <boxGeometry args={[0.8 * scale, 0.8 * scale, 0.8 * scale]} />
          <meshStandardMaterial color="#b7e4c7" wireframe />
        </mesh>
      }
    >
      <LoadedModel modelUrl={modelUrl} scale={scale} rotation={rotation} />
    </Suspense>
  );
}

function LoadedModel({
  modelUrl,
  scale,
  rotation,
}: {
  modelUrl: string;
  scale: number;
  rotation: number;
}) {
  const { scene } = useGLTF(modelUrl);
  const cloned = scene.clone();
  return <primitive object={cloned} scale={[scale, scale, scale]} rotation={[0, rotation, 0]} />;
}

export default function ManageDecorations() {
  const [decorations, setDecorations] = useState<DecorationItem[]>([]);
  const [plants, setPlants] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DecorationItem | null>(null);
  const [imageTo3dStatus, setImageTo3dStatus] = useState<{ is_configured: boolean; notice: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: "plants" | "furniture" | "pots" | "decorations";
    description: string;
    suitable_room_types: string[];
    width: number;
    depth: number;
    height: number;
    default_color: string;
    model_scale: number;
    model_rotation_offset: number;
    floor_alignment: "floor" | "tabletop" | "wall";
    plant_id: string | number;
    status: "draft" | "published" | "archived";
  }>({
    name: "",
    category: "decorations",
    description: "",
    suitable_room_types: ["living-room", "office", "bedroom"],
    width: 1.0,
    depth: 1.0,
    height: 1.0,
    default_color: "#276749",
    model_scale: 1.0,
    model_rotation_offset: 0.0,
    floor_alignment: "floor",
    plant_id: "",
    status: "draft",
  });

  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("token") || "";

  const fetchDecorations = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/admin/decorations?per_page=50`;
      if (categoryFilter !== "all") url += `&category=${categoryFilter}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDecorations(data.data?.data || data.data || []);
      }
    } catch (e) {
      console.warn("Notice loading decorations:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const res = await fetch(`${API}/api/plants?per_page=100`);
      if (res.ok) {
        const data = await res.json();
        const plantList = data.data?.plants || data.data?.data || data.data || [];
        setPlants(plantList);
      }
    } catch {}
  };

  const fetchAiStatus = async () => {
    try {
      const res = await fetch(`${API}/api/admin/image-to-3d/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setImageTo3dStatus(data.data);
      }
    } catch {}
  };

  useEffect(() => {
    void fetchDecorations();
    void fetchPlants();
    void fetchAiStatus();
  }, [categoryFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "decorations",
      description: "",
      suitable_room_types: ["living-room", "office", "bedroom"],
      width: 1.0,
      depth: 1.0,
      height: 1.0,
      default_color: "#276749",
      model_scale: 1.0,
      model_rotation_offset: 0.0,
      floor_alignment: "floor",
      plant_id: "",
      status: "draft",
    });
    setModelFile(null);
    setThumbnailFile(null);
    setPreviewBlobUrl(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DecorationItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || "",
      suitable_room_types: item.suitable_room_types || ["living-room", "office", "bedroom"],
      width: item.width,
      depth: item.depth,
      height: item.height,
      default_color: item.default_color || "#276749",
      model_scale: item.model_scale || 1.0,
      model_rotation_offset: item.model_rotation_offset || 0.0,
      floor_alignment: item.floor_alignment || "floor",
      plant_id: item.plant_id || "",
      status: item.status,
    });
    setModelFile(null);
    setThumbnailFile(null);
    setPreviewBlobUrl(item.model_url);
    setIsModalOpen(true);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".glb")) {
        alert("Please select a valid .glb 3D model file.");
        return;
      }
      setModelFile(file);
      const blobUrl = URL.createObjectURL(file);
      setPreviewBlobUrl(blobUrl);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const toggleRoomType = (type: string) => {
    setFormData((prev) => {
      const current = prev.suitable_room_types;
      const exists = current.includes(type);
      return {
        ...prev,
        suitable_room_types: exists ? current.filter((t) => t !== type) : [...current, type],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("category", formData.category);
      if (formData.description) body.append("description", formData.description);
      formData.suitable_room_types.forEach((t) => body.append("suitable_room_types[]", t));
      body.append("width", String(formData.width));
      body.append("depth", String(formData.depth));
      body.append("height", String(formData.height));
      body.append("default_color", formData.default_color);
      body.append("model_scale", String(formData.model_scale));
      body.append("model_rotation_offset", String(formData.model_rotation_offset));
      body.append("floor_alignment", formData.floor_alignment);
      if (formData.plant_id) body.append("plant_id", String(formData.plant_id));
      body.append("status", formData.status);

      if (modelFile) body.append("model_file", modelFile);
      if (thumbnailFile) body.append("thumbnail", thumbnailFile);

      const url = editingItem
        ? `${API}/api/admin/decorations/${editingItem.id}`
        : `${API}/api/admin/decorations`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save decoration item.");
      }

      setNotice(editingItem ? "Decoration updated." : "Decoration created.");
      setIsModalOpen(false);
      void fetchDecorations();
    } catch (err: any) {
      alert(err.message || "Failed to submit decoration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/admin/decorations/${id}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotice("Decoration item published to public Room Studio.");
        void fetchDecorations();
      }
    } catch {}
  };

  const handleArchive = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/admin/decorations/${id}/archive`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotice("Decoration archived.");
        void fetchDecorations();
      }
    } catch {}
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`${API}/api/admin/decorations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotice("Decoration deleted.");
        void fetchDecorations();
      }
    } catch {}
  };

  const availableRooms = [
    { id: "living-room", label: "Living Room" },
    { id: "bedroom", label: "Bedroom" },
    { id: "office", label: "Home Office" },
    { id: "balcony", label: "Balcony / Patio" },
    { id: "kitchen", label: "Kitchen" },
    { id: "bathroom", label: "Bathroom" },
  ];

  return (
    <AdminLayout>
      <div className="admin-decorations-page">
        {/* Header Title Section */}
        <div className="admin-dec-header">
          <div>
            <div className="admin-dec-badge">
              <Box size={15} />
              <span>3D Room Studio Catalog</span>
            </div>
            <h1>Decoration & Botanical 3D Catalogue</h1>
            <p>
              Upload, preview, and manage 3D GLB models, physical dimensions, and placement properties for the Room Designer.
            </p>
          </div>

          <button type="button" className="admin-dec-add-btn" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add 3D Decoration</span>
          </button>
        </div>

        {/* AI Image-to-3D Notice Banner */}
        <div className="admin-dec-ai-card">
          <div className="ai-card-content">
            <div className="ai-card-kicker">
              <Sparkles size={14} />
              <span>AI Image-to-3D Generation Status</span>
            </div>
            <h3>Automated 3D Generation Architecture</h3>
            <p>
              {imageTo3dStatus?.is_configured
                ? "Image-to-3D provider is configured and active. Submissions will be processed in draft status."
                : "External 3D generation API key (e.g. MESHY_API_KEY in backend .env) is not configured. Manual 3D GLB file uploading and live WebGL preview are fully enabled and ready for use."}
            </p>
          </div>
          <div className="ai-card-badge-wrap">
            <span className={`ai-status-pill ${imageTo3dStatus?.is_configured ? "active" : "standby"}`}>
              {imageTo3dStatus?.is_configured ? "● Provider Configured" : "○ Manual GLB Ready"}
            </span>
          </div>
        </div>

        {notice && (
          <div className="admin-dec-notice" role="status">
            <Info size={16} /> {notice}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="admin-dec-filters">
          <div className="admin-dec-search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by decoration name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDecorations()}
            />
          </div>

          <div className="admin-dec-select-group">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
            >
              <option value="all">All Categories</option>
              <option value="plants">Plants</option>
              <option value="furniture">Furniture</option>
              <option value="pots">Pots & Planters</option>
              <option value="decorations">Decorations</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <button type="button" className="admin-dec-refresh-btn" onClick={fetchDecorations} title="Refresh catalog">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="admin-dec-table-card">
          {loading ? (
            <div className="admin-dec-loading">Loading 3D decoration catalog...</div>
          ) : decorations.length === 0 ? (
            <div className="admin-dec-empty">
              <Box size={36} />
              <h3>No decorations found</h3>
              <p>Add your first 3D GLB model or adjust your filters above.</p>
              <button type="button" className="admin-dec-add-btn" onClick={handleOpenAddModal}>
                <Plus size={16} /> Add Decoration
              </button>
            </div>
          ) : (
            <table className="admin-dec-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Dimensions (W×D×H)</th>
                  <th>3D Asset</th>
                  <th>Rooms</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {decorations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-item-cell">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.name} className="table-item-thumb" />
                        ) : (
                          <div className="table-item-icon-ph">
                            <Box size={18} />
                          </div>
                        )}
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cat-pill">{item.category}</span>
                    </td>
                    <td>
                      <span className="dim-text">
                        {item.width}m × {item.depth}m × {item.height}m
                      </span>
                    </td>
                    <td>
                      {item.model_url ? (
                        <span className="model-badge has-glb">
                          <CheckCircle size={13} /> GLB Ready ({item.model_scale}x)
                        </span>
                      ) : (
                        <span className="model-badge built-in">
                          <Layers size={13} /> Procedural Mesh
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="room-pills-wrap">
                        {(item.suitable_room_types || []).slice(0, 3).map((r) => (
                          <span key={r} className="room-pill">
                            {r}
                          </span>
                        ))}
                        {(item.suitable_room_types || []).length > 3 && (
                          <span className="room-pill more">+{(item.suitable_room_types || []).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${item.status}`}>{item.status}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {item.status === "draft" && (
                          <button
                            type="button"
                            className="action-btn publish"
                            onClick={() => handlePublish(item.id)}
                            title="Publish to public Room Designer"
                          >
                            <CheckCircle size={15} /> Publish
                          </button>
                        )}
                        {item.status === "published" && (
                          <button
                            type="button"
                            className="action-btn archive"
                            onClick={() => handleArchive(item.id)}
                            title="Archive item"
                          >
                            <Archive size={15} /> Archive
                          </button>
                        )}
                        <button
                          type="button"
                          className="action-btn edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit decoration"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create / Edit Modal with Embedded WebGL 3D Preview */}
        {isModalOpen && (
          <div className="admin-dec-modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div className="admin-dec-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-dec-modal-header">
                <div>
                  <h2>{editingItem ? "Edit 3D Decoration" : "Add 3D Decoration Item"}</h2>
                  <p>Configure physical properties, suitable rooms, and inspect the 3D model.</p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="admin-dec-modal-form">
                <div className="modal-form-grid">
                  {/* Left Column: Form Fields */}
                  <div className="modal-form-left">
                    <label className="form-field">
                      <span>Item Name *</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Minimalist Ceramic Planter"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </label>

                    <div className="form-row-2">
                      <label className="form-field">
                        <span>Category *</span>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        >
                          <option value="plants">Plants</option>
                          <option value="furniture">Furniture</option>
                          <option value="pots">Pots & Planters</option>
                          <option value="decorations">Decorations</option>
                        </select>
                      </label>

                      <label className="form-field">
                        <span>Default Color / Finish</span>
                        <div className="color-picker-input">
                          <input
                            type="color"
                            value={formData.default_color}
                            onChange={(e) => setFormData({ ...formData, default_color: e.target.value })}
                          />
                          <span>{formData.default_color}</span>
                        </div>
                      </label>
                    </div>

                    <label className="form-field">
                      <span>Description</span>
                      <textarea
                        rows={2}
                        placeholder="Brief aesthetic and styling description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </label>

                    <div className="form-field">
                      <span>Suitable Room Types</span>
                      <div className="checkbox-grid">
                        {availableRooms.map((room) => (
                          <label key={room.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.suitable_room_types.includes(room.id)}
                              onChange={() => toggleRoomType(room.id)}
                            />
                            <span>{room.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="form-row-3">
                      <label className="form-field">
                        <span>Width (m)</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.1"
                          max="10"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                        />
                      </label>
                      <label className="form-field">
                        <span>Depth (m)</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.1"
                          max="10"
                          value={formData.depth}
                          onChange={(e) => setFormData({ ...formData, depth: Number(e.target.value) })}
                        />
                      </label>
                      <label className="form-field">
                        <span>Height (m)</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.1"
                          max="10"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                        />
                      </label>
                    </div>

                    {/* File Uploads */}
                    <div className="form-row-2">
                      <div className="file-upload-box">
                        <label>3D Model (.GLB, max 25MB)</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".glb"
                          onChange={handleModelChange}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          className="file-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={14} />
                          <span>{modelFile ? modelFile.name : "Select .GLB File"}</span>
                        </button>
                      </div>

                      <div className="file-upload-box">
                        <label>Thumbnail Image (max 5MB)</label>
                        <input
                          type="file"
                          ref={thumbInputRef}
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          className="file-btn"
                          onClick={() => thumbInputRef.current?.click()}
                        >
                          <Upload size={14} />
                          <span>{thumbnailFile ? thumbnailFile.name : "Select Image"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <label className="form-field">
                        <span>Link to Existing Plant (Optional)</span>
                        <select
                          value={formData.plant_id}
                          onChange={(e) => setFormData({ ...formData, plant_id: e.target.value })}
                        >
                          <option value="">None (Generic item)</option>
                          {plants.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-field">
                        <span>Status</span>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                          <option value="draft">Draft (Private)</option>
                          <option value="published">Published (Live in Studio)</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Interactive 3D Model WebGL Preview */}
                  <div className="modal-form-right">
                    <div className="modal-preview-card">
                      <div className="preview-card-header">
                        <Eye size={15} />
                        <span>Interactive 3D WebGL Preview</span>
                      </div>

                      <div className="modal-canvas-viewport">
                        <Canvas
                          shadows
                          dpr={[1, 1.5]}
                          camera={{ position: [2.5, 2.0, 2.5], fov: 40 }}
                        >
                          <ambientLight intensity={0.6} />
                          <directionalLight position={[4, 6, 3]} intensity={1.8} castShadow />
                          <directionalLight position={[-3, 4, -2]} intensity={0.5} />
                          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                            <planeGeometry args={[4, 4]} />
                            <meshStandardMaterial color="#e5e5e5" />
                          </mesh>
                          <ModalModelPreview
                            modelUrl={previewBlobUrl}
                            scale={formData.model_scale}
                            rotation={formData.model_rotation_offset}
                            color={formData.default_color}
                          />
                          <OrbitControls makeDefault enableDamping minDistance={1} maxDistance={6} />
                        </Canvas>
                        <div className="canvas-hint">Drag to inspect 3D orientation</div>
                      </div>

                      {/* 3D Offset Controls */}
                      <div className="preview-controls">
                        <label className="range-field">
                          <span>Model Scale: {formData.model_scale}x</span>
                          <input
                            type="range"
                            min="0.2"
                            max="3.0"
                            step="0.05"
                            value={formData.model_scale}
                            onChange={(e) =>
                              setFormData({ ...formData, model_scale: Number(e.target.value) })
                            }
                          />
                        </label>

                        <label className="range-field">
                          <span>
                            Rotation Offset: {Math.round(((formData.model_rotation_offset * 180) / Math.PI) % 360)}°
                          </span>
                          <input
                            type="range"
                            min="0"
                            max={Math.PI * 2}
                            step={Math.PI / 18}
                            value={formData.model_rotation_offset}
                            onChange={(e) =>
                              setFormData({ ...formData, model_rotation_offset: Number(e.target.value) })
                            }
                          />
                        </label>

                        <label className="form-field">
                          <span>Floor Alignment</span>
                          <select
                            value={formData.floor_alignment}
                            onChange={(e) =>
                              setFormData({ ...formData, floor_alignment: e.target.value as any })
                            }
                          >
                            <option value="floor">Floor / Ground</option>
                            <option value="tabletop">Tabletop / Surface</option>
                            <option value="wall">Wall Mounted</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-dec-modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save" disabled={submitting}>
                    {submitting ? "Saving..." : editingItem ? "Save Changes" : "Create 3D Decoration"}
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

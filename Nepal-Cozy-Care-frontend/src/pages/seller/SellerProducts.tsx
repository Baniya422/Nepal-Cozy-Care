import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Leaf,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import "../../components/seller/seller.css";
import type { Plant } from "../../types/plant";
import { compressImage } from "../../utils/imageCompressor";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function SellerProducts() {
  const [searchParams] = useSearchParams();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    scientific_name: "",
    category: "Indoor",
    difficulty: "easy",
    price: "",
    stock: "",
    light: "bright-indirect",
    water: "weekly",
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/seller/products?per_page=50`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPlants(json.data.plants || []);
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Failed to load seller products", err);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [statusFilter]);

  const openAddModal = useCallback(() => {
    setFeedback(null);
    setEditingPlant(null);
    setFormData({
      name: "",
      scientific_name: "",
      category: "Indoor",
      difficulty: "easy",
      price: "",
      stock: "",
      light: "bright-indirect",
      water: "weekly",
      description: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProducts(controller.signal);
    if (searchParams.get("action") === "new") {
      openAddModal();
    }
    return () => controller.abort();
  }, [fetchProducts, openAddModal, searchParams]);

  const openEditModal = (plant: Plant) => {
    setFeedback(null);
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      scientific_name: plant.scientific_name || "",
      category: plant.category || "Indoor",
      difficulty: plant.difficulty || "easy",
      price: plant.price.toString(),
      stock: (plant.stock ?? 0).toString(),
      light: plant.light || "bright-indirect",
      water: plant.water || "weekly",
      description: plant.description || "",
    });
    setImageFile(null);
    setImagePreview(
      plant.image
        ? plant.image.startsWith("http")
          ? plant.image
          : `${API}/storage/${plant.image}`
        : null
    );
    setShowModal(true);
  };

  const handleImageChange = async (file?: File) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFeedback({ type: "error", text: "Please choose a JPG, PNG, or WebP image." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: "error", text: "The image must be smaller than 10 MB." });
      return;
    }

    setImageProcessing(true);
    setFeedback(null);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.78,
      });
      if (compressed.size > 5 * 1024 * 1024) {
        throw new Error("The optimized image is still over 5 MB. Please choose a smaller photo.");
      }
      setImageFile(compressed);
      setImagePreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return URL.createObjectURL(compressed);
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not prepare that image.",
      });
    } finally {
      setImageProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageProcessing) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      if (formData.scientific_name) data.append("scientific_name", formData.scientific_name);
      data.append("category", formData.category);
      data.append("difficulty", formData.difficulty);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("light", formData.light);
      data.append("water", formData.water);
      data.append("description", formData.description);
      data.append("submit_for_review", "true");

      if (imageFile) {
        data.append("image", imageFile);
      }

      const url = editingPlant
        ? `${API}/api/seller/products/${editingPlant.id}`
        : `${API}/api/seller/products`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: data,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const validationMessage = json?.errors
          ? (Object.values(json.errors).flat().find(Boolean) as string | undefined)
          : undefined;
        throw new Error(
          res.status === 413
            ? "The image upload is too large. Please choose a smaller photo."
            : validationMessage || json?.message || "Failed to save product. Please try again."
        );
      }

      const savedPlant = json?.data?.plant as Plant | undefined;
      if (savedPlant) {
        const normalizedPlant = {
          ...savedPlant,
          price: Number(savedPlant.price),
        };
        setPlants((current) => {
          const withoutSaved = current.filter((plant) => plant.id !== normalizedPlant.id);
          const belongsInCurrentFilter =
            statusFilter === "all" || normalizedPlant.approval_status === statusFilter;
          return belongsInCurrentFilter ? [normalizedPlant, ...withoutSaved] : withoutSaved;
        });
      }

      setFeedback({
        type: "success",
        text: editingPlant
          ? "Product updated and submitted for review!"
          : "Product submitted for Super Admin review!",
      });
      setShowModal(false);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit product.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this plant product?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/seller/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPlants(plants.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const filteredPlants = plants.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.scientific_name?.toLowerCase().includes(q)
    );
  });

  const approvedCount = plants.filter((p) => p.approval_status === "approved" || !p.approval_status).length;
  const pendingCount = plants.filter((p) => p.approval_status === "pending").length;
  const rejectedCount = plants.filter((p) => p.approval_status === "rejected").length;

  return (
    <SellerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header Bar */}
        <div className="seller-form-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              My Product Catalog
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0.2rem 0 0" }}>
              Create, update, and manage inventory for all plants and garden supplies sold by your nursery.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="seller-btn seller-btn-primary"
          >
            <Plus size={16} />
            <span>Add New Product</span>
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
            <span className="seller-stat-label">Total Catalog</span>
            <div className="seller-stat-value">{plants.length}</div>
            <div className="seller-stat-caption">Items listed</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Live In Store</span>
            <div className="seller-stat-value" style={{ color: "#059669" }}>{approvedCount}</div>
            <div className="seller-stat-caption" style={{ color: "#059669" }}>Visible to buyers</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Pending Review</span>
            <div className="seller-stat-value" style={{ color: "#ca8a04" }}>{pendingCount}</div>
            <div className="seller-stat-caption" style={{ color: "#ca8a04" }}>Awaiting admin approval</div>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Needs Edit</span>
            <div className="seller-stat-value" style={{ color: "#dc2626" }}>{rejectedCount}</div>
            <div className="seller-stat-caption" style={{ color: "#dc2626" }}>Requires correction</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="seller-toolbar">
          <div className="seller-tab-group">
            {[
              { key: "all", label: "All Products" },
              { key: "approved", label: "Approved" },
              { key: "pending", label: "Pending" },
              { key: "draft", label: "Draft" },
              { key: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`seller-tab-btn ${statusFilter === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="seller-search" style={{ width: "260px" }}>
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="seller-card">
          {loading ? (
            <div className="seller-empty-state">Loading your catalog products...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon">
                <Leaf size={26} />
              </div>
              <h4>No products found</h4>
              <p>There are no products matching this filter. Click "Add New Product" to list your nursery stock.</p>
            </div>
          ) : (
            <div className="seller-table-container">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Approval Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlants.map((plant) => (
                    <tr key={plant.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "10px",
                              background: "#f1f5f9",
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {plant.image ? (
                              <img
                                src={
                                  plant.image.startsWith("http")
                                    ? plant.image
                                    : `${API}/storage/${plant.image}`
                                }
                                alt={plant.name}
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
                                {plant.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{plant.name}</div>
                            {plant.scientific_name && (
                              <span style={{ fontSize: "0.72rem", color: "#64748b", fontStyle: "italic" }}>
                                {plant.scientific_name}
                              </span>
                            )}
                            {plant.rejection_reason && (
                              <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "#dc2626" }}>
                                Note: {plant.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: "#334155" }}>
                          {plant.category || "General"}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#0f172a" }}>Rs. {plant.price.toLocaleString()}</strong>
                      </td>
                      <td>
                        <span style={{ color: (plant.stock ?? 0) < 5 ? "#dc2626" : "#334155", fontWeight: 600 }}>
                          {plant.stock ?? 0}
                        </span>{" "}
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>units</span>
                      </td>
                      <td>
                        <span className={`seller-badge seller-badge-${plant.approval_status || "approved"}`}>
                          {plant.approval_status === "approved" && <CheckCircle2 size={11} />}
                          {plant.approval_status === "pending" && <Clock size={11} />}
                          {plant.approval_status === "rejected" && <AlertCircle size={11} />}
                          <span>{plant.approval_status || "approved"}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(plant)}
                            className="seller-btn seller-btn-secondary seller-btn-sm"
                            title="Edit product"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(plant.id)}
                            className="seller-btn seller-btn-danger seller-btn-sm"
                            title="Delete product"
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

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="seller-modal-overlay">
            <div className="seller-modal seller-modal-large">
              <div className="seller-modal-header">
                <h3>{editingPlant ? `Edit Plant: ${editingPlant.name}` : "Add New Plant to Catalog"}</h3>
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
                  {feedback?.type === "error" && (
                    <div
                      role="alert"
                      style={{
                        padding: "0.8rem 1rem",
                        borderRadius: "8px",
                        background: "#fef2f2",
                        color: "#991b1b",
                        border: "1px solid #fecaca",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {feedback.text}
                    </div>
                  )}
                  <div className="seller-form-grid">
                    <div className="seller-form-group">
                      <label htmlFor="pName">Plant Common Name *</label>
                      <input
                        id="pName"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Monstera Deliciosa"
                      />
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="pSciName">Scientific / Botanical Name</label>
                      <input
                        id="pSciName"
                        type="text"
                        value={formData.scientific_name}
                        onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                        placeholder="e.g. Monstera deliciosa Liebm."
                      />
                    </div>
                  </div>

                  <div className="seller-form-grid-3">
                    <div className="seller-form-group">
                      <label htmlFor="pCategory">Category *</label>
                      <select
                        id="pCategory"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Indoor">Indoor Plants</option>
                        <option value="Outdoor">Outdoor Garden</option>
                        <option value="Flowering">Flowering Plants</option>
                        <option value="Succulents">Succulents & Cacti</option>
                        <option value="Herbs">Herbs & Edibles</option>
                        <option value="Bonsai">Bonsai & Rare</option>
                        <option value="Air Purifying">Air Purifying</option>
                      </select>
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="pPrice">Price (NPR) *</label>
                      <input
                        id="pPrice"
                        type="number"
                        min="1"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. 1200"
                      />
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="pStock">Available Stock (Units) *</label>
                      <input
                        id="pStock"
                        type="number"
                        min="0"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="e.g. 15"
                      />
                    </div>
                  </div>

                  <div className="seller-form-grid-3">
                    <div className="seller-form-group">
                      <label htmlFor="pDiff">Care Difficulty</label>
                      <select
                        id="pDiff"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        <option value="easy">Easy (Low Maintenance)</option>
                        <option value="moderate">Moderate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="pLight">Lighting Requirements</label>
                      <select
                        id="pLight"
                        value={formData.light}
                        onChange={(e) => setFormData({ ...formData, light: e.target.value })}
                      >
                        <option value="low-light">Low Light Tolerant</option>
                        <option value="bright-indirect">Bright Indirect Light</option>
                        <option value="direct-sunlight">Direct Full Sunlight</option>
                      </select>
                    </div>

                    <div className="seller-form-group">
                      <label htmlFor="pWater">Watering Frequency</label>
                      <select
                        id="pWater"
                        value={formData.water}
                        onChange={(e) => setFormData({ ...formData, water: e.target.value })}
                      >
                        <option value="bi-weekly">Bi-weekly / Drought Tolerant</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily / Moist Soil</option>
                      </select>
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div className="seller-form-group">
                    <label>Plant Photo</label>
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
                            alt="Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <label className="seller-btn seller-btn-secondary" style={{ cursor: "pointer" }}>
                        <Upload size={14} />
                        <span>
                          {imageProcessing
                            ? "Optimizing Photo..."
                            : imagePreview
                            ? "Change Photo"
                            : "Upload Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={imageProcessing || submitting}
                          style={{ display: "none" }}
                          onChange={(e) => void handleImageChange(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="seller-form-group">
                    <label htmlFor="pDesc">Plant Care & Botanical Description</label>
                    <textarea
                      id="pDesc"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the plant's size, pot size, foliage beauty, and care tips for buyers..."
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
                    disabled={submitting || imageProcessing}
                    aria-busy={submitting || imageProcessing}
                    className="seller-btn seller-btn-primary"
                  >
                    {imageProcessing
                      ? "Preparing Image..."
                      : submitting
                      ? "Submitting..."
                      : editingPlant
                      ? "Update Product"
                      : "Submit Product for Review"}
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

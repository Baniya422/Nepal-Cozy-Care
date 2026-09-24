import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
import { getProductPricing } from "../../utils/productPricing";
import {
  DEFAULT_PLANT_IMAGE,
  handleImageError,
  resolveImageUrl,
} from "../../utils/imageUrl";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
interface Plant {
  soil?: string;
  discount_percent?: number;
  id: number;
  name: string;
  scientific_name: string | null;
  description: string | null;
  survival_guide: string | null;
  care_instructions: string | null;
  category: string | null;
  size: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  image: string | null;
  difficulty: string | null;
  light: string | null;
  water: string | null;
  temperature: string | null;
  humidity: string | null;
  fertilizer: string | null;
  rooms?: string[] | null;
  is_popular_item?: boolean;
  is_best_seller?: boolean;
}
interface PlantFormData {
  soil: string;
  discount_percent: string;
  name: string;
  scientific_name: string;
  description: string;
  survival_guide: string;
  care_instructions: string;
  price: string;
  stock: string;
  category: string;
  size: string;
  light: string;
  water: string;
  temperature: string;
  humidity: string;
  fertilizer: string;
  difficulty: string;
  is_active: boolean;
  image: string;
  rooms: string[];
  is_popular_item: boolean;
  is_best_seller: boolean;
}
export default function ManagePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState<PlantFormData>({
    soil: "",
    discount_percent: "0",
    name: "",
    scientific_name: "",
    description: "",
    survival_guide: "",
    care_instructions: "",
    price: "",
    stock: "",
    category: "Indoor Plants",
    size: "Medium",
    light: "Bright Indirect",
    water: "",
    temperature: "",
    humidity: "Normal Humidity",
    fertilizer: "",
    difficulty: "Beginner Friendly",
    is_active: true,
    image: "",
    rooms: ["Living Room"],
    is_popular_item: false,
    is_best_seller: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const pricing = getProductPricing(formData.price, formData.discount_percent);
  const isAccessory = /pot|planter|tool|soil|fertilizer|accessor/i.test(formData.category);
  useEffect(() => {
    fetchPlants();
  }, []);
  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/plants?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Admin plants response:", data);
        let plantsData = data.data?.plants || data.data?.data || data.plants || data.data || [];
        plantsData = plantsData.map((plant: any) => ({
          ...plant,
          price: parseFloat(plant.price) || 0,
        }));
        setPlants(plantsData);
      } else {
        console.error("Failed to fetch plants:", res.status);
        const publicRes = await fetch(`${API}/api/plants?per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (publicRes.ok) {
          const data = await publicRes.json();
          let plantsData = data.data?.plants || data.data?.data || data.plants || data.data || [];
          plantsData = plantsData.map((plant: any) => ({
            ...plant,
            price: parseFloat(plant.price) || 0,
          }));
          setPlants(plantsData);
        }
      }
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Plant name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert("Please enter a valid stock quantity");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add plants");
      return;
    }
    const formDataToSend = new FormData();
    if (!isAccessory && (!formData.rooms.length || !formData.light || !formData.difficulty || !formData.humidity)) {
      alert("Choose light, care difficulty, humidity, and at least one suitable room for Plant Finder.");
      return;
    }
    formDataToSend.append("soil", formData.soil.trim());
    formDataToSend.append("discount_percent", formData.discount_percent || "0");
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("scientific_name", formData.scientific_name.trim() || "");
    formDataToSend.append("description", formData.description.trim() || "");
    formDataToSend.append("survival_guide", formData.survival_guide.trim() || "");
    formDataToSend.append("care_instructions", formData.care_instructions.trim() || "");
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category || "");
    formDataToSend.append("size", formData.size || "");
    formDataToSend.append("light", formData.light.trim() || "");
    formDataToSend.append("water", formData.water.trim() || "");
    formDataToSend.append("temperature", formData.temperature.trim() || "");
    formDataToSend.append("humidity", formData.humidity.trim() || "");
    formDataToSend.append("fertilizer", formData.fertilizer.trim() || "");
    formDataToSend.append("difficulty", formData.difficulty || "");
    formData.rooms.forEach((room) => {
      formDataToSend.append("rooms[]", room);
    });
    if (!formData.rooms.length) formDataToSend.append("rooms", "");
    formDataToSend.append("is_active", formData.is_active ? "1" : "0");
    formDataToSend.append("is_popular_item", formData.is_popular_item ? "1" : "0");
    formDataToSend.append("is_best_seller", formData.is_best_seller ? "1" : "0");
    if (selectedImage) {
      formDataToSend.append("image", selectedImage);
    } else if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    console.log("Submitting plant data with image:", selectedImage?.name || formData.image);
    console.log("API URL:", API);
    try {
      const url = editingPlant
        ? `${API}/api/admin/plants/${editingPlant.id}`
        : `${API}/api/admin/plants`;
      const method = editingPlant ? "POST" : "POST";
      console.log("Request URL:", url);
      console.log("Request method:", method);
      if (editingPlant) {
        formDataToSend.append("_method", "PUT");
      }
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Success response:", data);
        setShowModal(false);
        resetForm();
        fetchPlants();
        alert(editingPlant ? "Plant updated successfully!" : "Plant added successfully!");
      } else {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        let errorMessage = "Failed to save plant";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || JSON.stringify(errorJson.errors) || errorText;
        } catch {
          errorMessage = errorText || "Failed to save plant";
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving plant:", error);
      alert("Network error - please check if the backend server is running");
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plant?")) return;
    const token = localStorage.getItem("token");
    try {
      let res = await fetch(`${API}/api/admin/plants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        res = await fetch(`${API}/api/plants/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (res.ok) {
        fetchPlants();
      } else {
        alert("Failed to delete plant");
      }
    } catch (error) {
      console.error("Error deleting plant:", error);
    }
  };
  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      soil: plant.soil || "",
      discount_percent: String(plant.discount_percent ?? 0),
      name: plant.name,
      scientific_name: plant.scientific_name || "",
      description: plant.description || "",
      survival_guide: plant.survival_guide || "",
      care_instructions: plant.care_instructions || "",
      price: plant.price.toString(),
      stock: plant.stock.toString(),
      category: plant.category || "Indoor Plants",
      size: plant.size || "Medium",
      light: plant.light || "Bright Indirect",
      water: plant.water || "Once a week",
      temperature: plant.temperature || "18-24°C",
      humidity: plant.humidity || "Normal Humidity",
      fertilizer: plant.fertilizer || "Monthly in spring/summer",
      difficulty: plant.difficulty || "Beginner Friendly",
      is_active: plant.is_active,
      image: plant.image || "",
      rooms: plant.rooms || [],
      is_popular_item: plant.is_popular_item || false,
      is_best_seller: plant.is_best_seller || false,
    });
    setSelectedImage(null);
    setImagePreview(plant.image ? resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE) : null);
    setShowModal(true);
  };
  const handleAddNew = () => {
    setEditingPlant(null);
    resetForm();
    setShowModal(true);
  };
  const resetForm = () => {
    setFormData({
      soil: "",
      discount_percent: "0",
      name: "",
      scientific_name: "",
      description: "",
      survival_guide: "",
      care_instructions: "",
      price: "",
      stock: "",
      category: "Indoor Plants",
      size: "Medium",
      light: "Bright Indirect",
      water: "Once a week",
      temperature: "18-24°C",
      humidity: "Normal Humidity",
      fertilizer: "Monthly in spring/summer",
      difficulty: "Beginner Friendly",
      is_active: true,
      image: "",
      rooms: ["Living Room"],
      is_popular_item: false,
      is_best_seller: false,
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
  const filteredPlants = plants.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const formatPrice = (price: number) => {
    return `Rs ${price.toFixed(2)}`;
  };
  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Manage Plants</h2>
            <p>Add, edit, or remove plants from your inventory</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
            <Plus size={18} />
            Add New Plant
          </button>
        </div>
        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading plants...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant) => (
                  <tr key={plant.id}>
                    <td>
                      <div className="admin-plant-image">
                        {plant.image ? (
                          <img
                            src={resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE)}
                            alt={plant.name}
                            onError={(event) => handleImageError(event, DEFAULT_PLANT_IMAGE)}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="admin-image-placeholder">No Image</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-plant-name">
                        <strong>{plant.name}</strong>
                        {plant.scientific_name && (
                          <span className="admin-scientific-name">
                            {plant.scientific_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{plant.category || "-"}</td>
                    <td>{formatPrice(plant.price)}</td>
                    <td>
                      <span className={plant.stock < 10 ? "admin-stock-low" : ""}>
                        {plant.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          plant.is_active ? "admin-status-active" : "admin-status-inactive"
                        }`}
                      >
                        {plant.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn admin-action-view"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-edit"
                          title="Edit"
                          onClick={() => handleEdit(plant)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-delete"
                          title="Delete"
                          onClick={() => handleDelete(plant.id)}
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
          {!loading && filteredPlants.length === 0 && (
            <div className="admin-empty-state">
              <p>No plants found. Add your first plant!</p>
            </div>
          )}
        </div>
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal plant-editor-modal" role="dialog" aria-modal="true" aria-label={editingPlant ? "Edit Plant" : "Add New Plant"} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingPlant ? "Edit Plant" : "Add New Plant"}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="plant-editor-intro">
                  <h4>Product details & care profile</h4>
                  <p>These details appear in your shop and product page. Plant Finder uses light, difficulty, humidity, and suitable rooms to recommend this plant.</p>
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="plant-name">Plant Name *</label>
                    <input id="plant-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-scientific_name">Scientific Name</label>
                    <input id="plant-scientific_name"
                      type="text"
                      value={formData.scientific_name}
                      onChange={(e) =>
                        setFormData({ ...formData, scientific_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-category">Category</label>
                    <select id="plant-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Indoor Plants">Indoor Plants</option>
                      <option value="Air Purifying Plants">Air Purifying Plants</option>
                      <option value="Low Light Plants">Low Light Plants</option>
                      <option value="Pet Friendly Plants">Pet Friendly Plants</option>
                      <option value="Succulents & Cacti">Succulents & Cacti</option>
                      <option value="Flowering Plants">Flowering Plants</option>
                      <option value="Hanging Plants">Hanging Plants</option>
                      <option value="Outdoor / Balcony Plants">Outdoor / Balcony Plants</option>
                      <option value="Pots & Planters">Pots & Planters</option>
                      <option value="Plant Care & Tools">Plant Care & Tools</option>
                      <option value="Soil & Media">Soil & Media</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Indoor">Indoor (Legacy)</option>
                      <option value="Outdoor">Outdoor (Legacy)</option>
                      <option value="Succulent">Succulent (Legacy)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-size">Size</label>
                    <select id="plant-size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Extra Large">Extra Large</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-difficulty">Care Difficulty (Plant Finder Quiz)</label>
                    <select id="plant-difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="Beginner Friendly">Beginner Friendly</option>
                      <option value="Moderate Care">Moderate Care</option>
                      <option value="Green Thumb Enthusiast">Green Thumb Enthusiast</option>
                      {formData.difficulty && !["Beginner Friendly", "Moderate Care", "Green Thumb Enthusiast"].includes(formData.difficulty) && <option value={formData.difficulty}>{formData.difficulty}</option>}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-price">Selling Price (NPR) *</label>
                    <input id="plant-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-discount">Discount (%)</label>
                    <input id="plant-discount" type="number" min="0" max="99" step="1" value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })} />
                    <small>Use 0 for no sale. The selling price is what customers pay.</small>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-stock">Stock Quantity *</label>
                    <input id="plant-stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-light">Light Requirements (Plant Finder Quiz)</label>
                    <select id="plant-light"
                      value={formData.light}
                      onChange={(e) => setFormData({ ...formData, light: e.target.value })}
                    >
                      <option value="">Select light type</option>
                      <option value="Bright Indirect">Bright Indirect Light</option>
                      <option value="Medium Light">Medium / Filtered Light</option>
                      <option value="Low Light">Low Light / Shade</option>
                      <option value="Direct Sunlight">Direct Sunlight</option>
                      {formData.light && !["Bright Indirect", "Medium Light", "Low Light", "Direct Sunlight"].includes(formData.light) && <option value={formData.light}>{formData.light}</option>}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-water">Water Frequency</label>
                    <select id="plant-water"
                      value={formData.water}
                      onChange={(e) => setFormData({ ...formData, water: e.target.value })}
                    >
                      <option value="">Select frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="2-3 times a week">2-3 times a week</option>
                      <option value="Once a week">Once a week</option>
                      <option value="Every 2 weeks">Every 2 weeks</option>
                      <option value="Monthly">Monthly</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-humidity">Humidity Level (Plant Finder Quiz)</label>
                    <select id="plant-humidity"
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                    >
                      <option value="">Select humidity</option>
                      <option value="Normal Humidity">Normal Humidity (40–60%)</option>
                      <option value="High Humidity">High Humidity (60%+)</option>
                      <option value="Drier Air">Drier Air</option>
                      {formData.humidity && !["Normal Humidity", "High Humidity", "Drier Air"].includes(formData.humidity) && <option value={formData.humidity}>{formData.humidity}</option>}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-temperature">Temperature</label>
                    <input id="plant-temperature"
                      type="text"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      placeholder="e.g., 18-24°C"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-fertilizer">Fertilizer</label>
                    <input id="plant-fertilizer"
                      type="text"
                      value={formData.fertilizer}
                      onChange={(e) => setFormData({ ...formData, fertilizer: e.target.value })}
                      placeholder="e.g., Monthly in spring/summer"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="plant-soil">Soil / Potting Mix</label>
                    <input id="plant-soil" type="text" maxLength={255} value={formData.soil}
                      onChange={(e) => setFormData({ ...formData, soil: e.target.value })}
                      placeholder="e.g., Well-draining mix with perlite" />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Suitable Rooms (Plant Finder Quiz Match) *</label>
                  <p className="plant-editor-help">Select every room where this plant can thrive. Active plants are automatically available to the quiz; results depend on the customer's choices.</p>
                  <div className="admin-checkbox-group">
                    {[
                      { key: "Living Room", label: "🛋️ Living Room" },
                      { key: "Bedroom", label: "🛏️ Bedroom" },
                      { key: "Home Office", label: "💻 Home Office" },
                      { key: "Balcony / Terrace", label: "🌿 Balcony / Terrace" },
                      { key: "Kitchen", label: "🍳 Kitchen" },
                      { key: "Bathroom", label: "🚿 Bathroom" },
                    ].map((room) => (
                      <label key={room.key} className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.rooms.includes(room.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                rooms: [...formData.rooms, room.key],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                rooms: formData.rooms.filter((r) => r !== room.key),
                              });
                            }
                          }}
                        />
                        {room.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="admin-form-group">
                  <label htmlFor="plant-description">Description</label>
                  <textarea id="plant-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="plant-survival_guide">Survival Guide</label>
                  <textarea id="plant-survival_guide"
                    value={formData.survival_guide}
                    onChange={(e) => setFormData({ ...formData, survival_guide: e.target.value })}
                    rows={4}
                    placeholder="Detailed survival instructions for this plant..."
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="plant-care_instructions">Care Instructions</label>
                  <textarea id="plant-care_instructions"
                    value={formData.care_instructions}
                    onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                    rows={4}
                    placeholder="Step-by-step care instructions..."
                  />
                </div>
                <div className="admin-form-group">
                  <label>Plant Image</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "90px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", flexShrink: 0, background: "#f1f5f9" }}>
                        <img
                          src={imagePreview || resolveImageUrl(formData.image, DEFAULT_PLANT_IMAGE)}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(event) => handleImageError(event, DEFAULT_PLANT_IMAGE)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, image: e.target.value }));
                            setImagePreview(resolveImageUrl(e.target.value, DEFAULT_PLANT_IMAGE));
                            setSelectedImage(null);
                          }}
                          placeholder="Paste image URL (https://... or /images/...)"
                          style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", marginBottom: "0.5rem" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <label
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <Upload size={14} />
                            <span>{selectedImage ? `Selected: ${selectedImage.name}` : "Upload Computer File"}</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                          </label>
                          {selectedImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(formData.image || null);
                              }}
                              style={{ background: "none", border: "none", color: "#dc2626", fontSize: "0.8rem", cursor: "pointer" }}
                            >
                              ✕ Remove file
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <small style={{ color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Popular High-Res Presets:</small>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {[
                          { label: "Monstera", path: "/images/blog-leaf-macro.jpg" },
                          { label: "Snake Plant", path: "/images/snake.jpg" },
                          { label: "Rubber Tree", path: "/images/rubber.jpg" },
                          { label: "Indoor Green", path: "/images/indoor-garden.jpg" },
                          { label: "Lush Conservatory", path: "/images/blog-hero-lush.jpg" },
                        ].map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, image: preset.path }));
                              setImagePreview(preset.path);
                              setSelectedImage(null);
                            }}
                            style={{
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              border: formData.image === preset.path ? "1px solid #10b981" : "1px solid #e2e8f0",
                              background: formData.image === preset.path ? "#ecfdf5" : "#ffffff",
                              color: formData.image === preset.path ? "#065f46" : "#475569",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="admin-form-group admin-form-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                    />
                    Active — visible in shop and Plant Finder
                  </label>
                </div>
                <div className="admin-form-group">
                  <label>Homepage Categories</label>
                  <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.75rem" }}>
                    Mark this product for specific homepage sections (all active products appear in Shop Plants)
                  </p>
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.is_popular_item}
                        onChange={(e) =>
                          setFormData({ ...formData, is_popular_item: e.target.checked })
                        }
                      />
                      Popular Item
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.is_best_seller}
                        onChange={(e) =>
                          setFormData({ ...formData, is_best_seller: e.target.checked })
                        }
                      />
                      Best Seller
                    </label>
                  </div>
                </div>
                <section className="plant-editor-preview" aria-label="Product card preview">
                  <img key={imagePreview || formData.image} src={imagePreview || resolveImageUrl(formData.image, DEFAULT_PLANT_IMAGE)} alt="Product card preview" onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)} />
                  <div>
                    <h4>Product card preview</h4>
                    <div className="plant-editor-badges">
                      {formData.is_best_seller ? <span>BESTSELLER</span> : formData.is_popular_item ? <span>POPULAR</span> : null}
                      {pricing.discountPercent > 0 && <span>{pricing.discountPercent}% OFF</span>}
                    </div>
                    <strong>{formData.name || "Your plant name"}</strong>
                    <p>{formData.category}</p>
                    <p>Rs. {pricing.sellingPrice.toLocaleString()} {pricing.discountPercent > 0 && <del>Rs. {pricing.originalPrice.toLocaleString()}</del>}</p>
                    <small>Ratings and review counts come from customer reviews.</small>
                  </div>
                </section>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingPlant ? "Update Plant" : "Add Plant"}
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

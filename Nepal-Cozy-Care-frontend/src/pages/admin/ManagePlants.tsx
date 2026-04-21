import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Plant {
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
    name: "",
    scientific_name: "",
    description: "",
    survival_guide: "",
    care_instructions: "",
    price: "",
    stock: "",
    category: "Indoor",
    size: "Medium",
    light: "",
    water: "",
    temperature: "",
    humidity: "",
    fertilizer: "",
    difficulty: "Easy",
    is_active: true,
    image: "",
    rooms: [],
    is_popular_item: false,
    is_best_seller: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use admin endpoint to get ALL plants including inactive
      const res = await fetch(`${API}/api/admin/plants?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Admin plants response:", data);
        // Handle different API response structures
        let plantsData = data.data?.plants || data.data?.data || data.plants || data.data || [];
        
        // Convert price to number for each plant
        plantsData = plantsData.map((plant: any) => ({
          ...plant,
          price: parseFloat(plant.price) || 0,
        }));
        
        setPlants(plantsData);
      } else {
        console.error("Failed to fetch plants:", res.status);
        // Fallback to public endpoint if admin endpoint fails
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
    
    // Validate required fields
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

    // Create FormData for file upload
    const formDataToSend = new FormData();
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
    formDataToSend.append("is_active", formData.is_active ? "1" : "0");
    formDataToSend.append("is_popular_item", formData.is_popular_item ? "1" : "0");
    formDataToSend.append("is_best_seller", formData.is_best_seller ? "1" : "0");
    
    if (selectedImage) {
      formDataToSend.append("image", selectedImage);
    }

    console.log("Submitting plant data with image:", selectedImage?.name);
    console.log("API URL:", API);

    try {
      const url = editingPlant
        ? `${API}/api/plants/${editingPlant.id}`
        : `${API}/api/plants`;
      const method = editingPlant ? "POST" : "POST"; // Use POST for both, with _method for PUT

      console.log("Request URL:", url);
      console.log("Request method:", method);

      // For file uploads, we need to use FormData
      // Laravel requires POST with _method=PUT for file uploads on PUT requests
      if (editingPlant) {
        formDataToSend.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST", // Always POST for file uploads
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
      const res = await fetch(`${API}/api/plants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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
      name: plant.name,
      scientific_name: plant.scientific_name || "",
      description: plant.description || "",
      survival_guide: plant.survival_guide || "",
      care_instructions: plant.care_instructions || "",
      price: plant.price.toString(),
      stock: plant.stock.toString(),
      category: plant.category || "Indoor",
      size: plant.size || "Medium",
      light: plant.light || "",
      water: plant.water || "",
      temperature: plant.temperature || "",
      humidity: plant.humidity || "",
      fertilizer: plant.fertilizer || "",
      difficulty: plant.difficulty || "Easy",
      is_active: plant.is_active,
      image: plant.image || "",
      rooms: plant.rooms || [],
      is_popular_item: plant.is_popular_item || false,
      is_best_seller: plant.is_best_seller || false,
    });
    setSelectedImage(null); // Reset selected image when editing
    setImagePreview(plant.image ? `${API}/storage/${plant.image}` : null);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingPlant(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      scientific_name: "",
      description: "",
      survival_guide: "",
      care_instructions: "",
      price: "",
      stock: "",
      category: "Indoor",
      size: "Medium",
      light: "",
      water: "",
      temperature: "",
      humidity: "",
      fertilizer: "",
      difficulty: "Easy",
      is_active: true,
      image: "",
      rooms: [],
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
                            src={`${API}/storage/${plant.image}`}
                            alt={plant.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/placeholder-plant.jpg";
                            }}
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
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingPlant ? "Edit Plant" : "Add New Plant"}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Plant Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Scientific Name</label>
                    <input
                      type="text"
                      value={formData.scientific_name}
                      onChange={(e) =>
                        setFormData({ ...formData, scientific_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Succulent">Succulent</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Pots">Pots</option>
                      <option value="Tools">Tools</option>
                      <option value="Soil">Soil</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Size</label>
                    <select
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
                    <label>Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Light Requirements</label>
                    <select
                      value={formData.light}
                      onChange={(e) => setFormData({ ...formData, light: e.target.value })}
                    >
                      <option value="">Select light type</option>
                      <option value="Bright Light">Bright Light</option>
                      <option value="Medium Light">Medium Light</option>
                      <option value="Low Light">Low Light</option>
                      <option value="Indirect Light">Indirect Light</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Water Frequency</label>
                    <select
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
                    <label>Humidity Level</label>
                    <select
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                    >
                      <option value="">Select humidity</option>
                      <option value="Dry">Dry (Low Humidity)</option>
                      <option value="Normal">Normal Humidity</option>
                      <option value="Humid">Humid (High Humidity)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Temperature</label>
                    <input
                      type="text"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      placeholder="e.g., 18-24°C"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Fertilizer</label>
                    <input
                      type="text"
                      value={formData.fertilizer}
                      onChange={(e) => setFormData({ ...formData, fertilizer: e.target.value })}
                      placeholder="e.g., Monthly in spring/summer"
                    />
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label>Suitable Rooms (Multi-select)</label>
                  <div className="admin-checkbox-group">
                    {["Bedroom", "Living Room", "Kitchen", "Bathroom", "Office", "Balcony"].map((room) => (
                      <label key={room} className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.rooms.includes(room)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                rooms: [...formData.rooms, room],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                rooms: formData.rooms.filter((r) => r !== room),
                              });
                            }
                          }}
                        />
                        {room}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Survival Guide</label>
                  <textarea
                    value={formData.survival_guide}
                    onChange={(e) => setFormData({ ...formData, survival_guide: e.target.value })}
                    rows={4}
                    placeholder="Detailed survival instructions for this plant..."
                  />
                </div>
                <div className="admin-form-group">
                  <label>Care Instructions</label>
                  <textarea
                    value={formData.care_instructions}
                    onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                    rows={4}
                    placeholder="Step-by-step care instructions..."
                  />
                </div>
                <div className="admin-form-group">
                  <label>Plant Image</label>
                  <div className="admin-image-upload">
                    {imagePreview && (
                      <div className="admin-image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <label className="admin-file-input">
                      <Upload size={18} />
                      <span>{selectedImage ? "Change Image" : "Upload Image"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {selectedImage && (
                      <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.5rem", display: "block" }}>
                        Selected: {selectedImage.name}
                      </small>
                    )}
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
                    Active
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

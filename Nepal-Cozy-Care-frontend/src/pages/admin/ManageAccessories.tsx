import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Accessory {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  image: string | null;
  description?: string | null;
}

interface AccessoryFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  is_active: boolean;
}

export default function ManageAccessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [formData, setFormData] = useState<AccessoryFormData>({
    name: "",
    category: "Pots",
    price: "",
    stock: "",
    description: "",
    is_active: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/plants?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        let plantsData = data.data?.plants || data.data?.data || data.plants || data.data || [];
        
        // Convert price to number and filter for accessory categories
        plantsData = plantsData.map((item: any) => ({
          ...item,
          price: parseFloat(item.price) || 0,
        }));
        
        // Filter for Pots, Tools, Soil, Fertilizers, Accessories categories
        const accessories = plantsData.filter((item: any) => {
          const category = (item.category || "").toLowerCase().trim();
          return category.includes("pot") || 
                 category.includes("tool") || 
                 category.includes("soil") || 
                 category.includes("fertilizer") || 
                 category.includes("accessory");
        });
        
        setAccessories(accessories);
      } else {
        console.error("Failed to fetch accessories:", res.status);
      }
    } catch (error) {
      console.error("Error fetching accessories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Accessory name is required");
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
      alert("You must be logged in to add accessories");
      return;
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("description", formData.description.trim() || "");
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("is_active", formData.is_active ? "1" : "0");
    
    if (selectedImage) {
      formDataToSend.append("image", selectedImage);
    }

    try {
      const url = editingAccessory
        ? `${API}/api/plants/${editingAccessory.id}`
        : `${API}/api/plants`;
      
      // For file uploads, use POST with _method for PUT requests
      if (editingAccessory) {
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

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchAccessories();
        alert(editingAccessory ? "Accessory updated successfully!" : "Accessory added successfully!");
      } else {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        let errorMessage = "Failed to save accessory";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || JSON.stringify(errorJson.errors) || errorText;
        } catch {
          errorMessage = errorText || "Failed to save accessory";
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving accessory:", error);
      alert("Network error - please check if the backend server is running");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this accessory?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/plants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAccessories();
        alert("Accessory deleted successfully!");
      } else {
        alert("Failed to delete accessory");
      }
    } catch (error) {
      console.error("Error deleting accessory:", error);
      alert("Network error - please check if the backend server is running");
    }
  };

  const handleEdit = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setFormData({
      name: accessory.name,
      category: accessory.category,
      price: accessory.price.toString(),
      stock: accessory.stock.toString(),
      description: accessory.description || "",
      is_active: accessory.is_active,
    });
    
    // Set image preview if accessory has an image
    if (accessory.image) {
      const imageUrl = accessory.image.startsWith("http") 
        ? accessory.image 
        : `${API}/storage/${accessory.image}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingAccessory(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Pots",
      price: "",
      stock: "",
      description: "",
      is_active: true,
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

  const filteredAccessories = accessories.filter(
    (accessory) =>
      accessory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accessory.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return `Rs ${price.toFixed(2)}`;
  };

  const formatId = (id: number) => {
    return `#${id}`;
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Manage Accessories</h2>
            <p>Add, edit, or remove accessories from your inventory</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
            <Plus size={18} />
            Add New Accessory
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading accessories...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccessories.map((accessory) => (
                  <tr key={accessory.id}>
                    <td className="admin-id">{formatId(accessory.id)}</td>
                    <td>
                      <strong>{accessory.name}</strong>
                    </td>
                    <td>{accessory.category}</td>
                    <td>{formatPrice(accessory.price)}</td>
                    <td>
                      <span className={accessory.stock < 10 ? "admin-stock-low" : ""}>
                        {accessory.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          accessory.is_active ? "admin-status-active" : "admin-status-inactive"
                        }`}
                      >
                        {accessory.is_active ? "active" : "inactive"}
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
                          onClick={() => handleEdit(accessory)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="admin-action-btn admin-action-delete"
                          title="Delete"
                          onClick={() => handleDelete(accessory.id)}
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

          {!loading && filteredAccessories.length === 0 && (
            <div className="admin-empty-state">
              <p>No accessories found. Add your first accessory!</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingAccessory ? "Edit Accessory" : "Add New Accessory"}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Accessory Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Pots">Pots</option>
                      <option value="Tools">Tools</option>
                      <option value="Soil">Soil</option>
                      <option value="Fertilizers">Fertilizers</option>
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
                  <label>Accessory Image</label>
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
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingAccessory ? "Update Accessory" : "Add Accessory"}
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

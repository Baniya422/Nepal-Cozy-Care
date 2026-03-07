import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

interface Accessory {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  image: string | null;
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

  // Mock data since accessories API might not exist yet
  useEffect(() => {
    // Simulating API call with mock data
    setTimeout(() => {
      setAccessories([
        { id: 1, name: "Ceramic Pot - Small", category: "Pots", price: 12.99, stock: 67, is_active: true, image: null },
        { id: 2, name: "Ceramic Pot - Medium", category: "Pots", price: 18.99, stock: 45, is_active: true, image: null },
        { id: 3, name: "Watering Can", category: "Tools", price: 15.99, stock: 32, is_active: true, image: null },
        { id: 4, name: "Plant Food", category: "Fertilizers", price: 8.99, stock: 89, is_active: true, image: null },
        { id: 5, name: "Pruning Shears", category: "Tools", price: 14.99, stock: 23, is_active: true, image: null },
        { id: 6, name: "Hanging Basket", category: "Pots", price: 22.99, stock: 0, is_active: false, image: null },
        { id: 7, name: "Soil Mix - 5L", category: "Soil", price: 9.99, stock: 56, is_active: true, image: null },
        { id: 8, name: "Plant Mister", category: "Tools", price: 6.99, stock: 41, is_active: true, image: null },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAccessory: Accessory = {
      id: editingAccessory?.id || Date.now(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      is_active: formData.is_active,
      image: imagePreview,
    };

    if (editingAccessory) {
      setAccessories(accessories.map(a => a.id === editingAccessory.id ? newAccessory : a));
    } else {
      setAccessories([...accessories, newAccessory]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this accessory?")) return;
    setAccessories(accessories.filter(a => a.id !== id));
  };

  const handleEdit = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setFormData({
      name: accessory.name,
      category: accessory.category,
      price: accessory.price.toString(),
      stock: accessory.stock.toString(),
      description: "",
      is_active: accessory.is_active,
    });
    setImagePreview(accessory.image);
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatId = (id: number) => {
    return `#${String(id).padStart(3, '0')}`;
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

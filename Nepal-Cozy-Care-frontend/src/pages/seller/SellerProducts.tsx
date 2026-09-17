import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import type { Plant } from "../../types/plant";

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

  useEffect(() => {
    fetchProducts();
    if (searchParams.get("action") === "new") {
      openAddModal();
    }
  }, [statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/seller/products?per_page=50`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPlants(json.data.plants || []);
      }
    } catch (err) {
      console.error("Failed to load seller products", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
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
  };

  const openEditModal = (plant: Plant) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save product.");
      }

      setFeedback({
        type: "success",
        text: editingPlant
          ? "Product updated and submitted for review!"
          : "Product submitted for Super Admin review!",
      });
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to submit product." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
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

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Product Catalog</h2>
            <p className="text-xs text-slate-500">
              Create, update, and manage inventory for all plants and garden supplies sold by your shop.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.text}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {["all", "approved", "pending", "draft", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {st === "all" ? "All Products" : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading products...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No products found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? "Try changing your search keywords"
                  : "Click 'Add New Product' to list your first item"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlants.map((plant) => (
                    <tr key={plant.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {plant.image ? (
                              <img
                                src={
                                  plant.image.startsWith("http")
                                    ? plant.image
                                    : `${API}/storage/${plant.image}`
                                }
                                alt={plant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                {plant.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{plant.name}</p>
                            {plant.scientific_name && (
                              <p className="text-[11px] text-slate-400 italic">
                                {plant.scientific_name}
                              </p>
                            )}
                            {plant.rejection_reason && (
                              <p className="text-[10px] text-rose-600 mt-0.5">
                                Reason: {plant.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{plant.category || "General"}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        Rs. {plant.price.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            (plant.stock ?? 0) < 5 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {plant.stock ?? 0} units
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            plant.approval_status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : plant.approval_status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : plant.approval_status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {plant.approval_status === "approved" && <CheckCircle2 size={10} />}
                          {plant.approval_status === "pending" && <Clock size={10} />}
                          {plant.approval_status === "rejected" && <AlertCircle size={10} />}
                          {plant.approval_status || "approved"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(plant)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                            title="Edit Product"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(plant.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Delete Product"
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

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingPlant ? "Edit Product" : "Add New Marketplace Product"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Peace Lily"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Scientific Botanical Name
                    </label>
                    <input
                      type="text"
                      value={formData.scientific_name}
                      onChange={(e) =>
                        setFormData({ ...formData, scientific_name: e.target.value })
                      }
                      placeholder="e.g. Spathiphyllum"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Succulents">Succulents</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Ferns">Ferns</option>
                      <option value="Bonsai">Bonsai</option>
                      <option value="Pots">Pots</option>
                      <option value="Tools">Tools</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 850"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Stock Count *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="e.g. 15"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Care Level</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Light Requirement
                    </label>
                    <input
                      type="text"
                      value={formData.light}
                      onChange={(e) => setFormData({ ...formData, light: e.target.value })}
                      placeholder="e.g. Bright indirect sunlight"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Watering Schedule
                    </label>
                    <input
                      type="text"
                      value={formData.water}
                      onChange={(e) => setFormData({ ...formData, water: e.target.value })}
                      placeholder="e.g. Once a week when top soil is dry"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product details, plant size, health, and tips..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Photo</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                    )}
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition font-semibold">
                      <Upload size={14} />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg text-[11px] text-emerald-800">
                  <span className="font-semibold">Note:</span> Newly added or edited products are
                  sent to the Super Admin for quick approval before appearing publicly on the
                  marketplace.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : editingPlant ? "Save & Submit" : "Submit for Approval"}
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

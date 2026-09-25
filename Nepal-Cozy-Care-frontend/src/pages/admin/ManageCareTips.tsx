import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  FileText,
  Clock3,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  BarChart3,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
import "../../styles/adminCareTips.css";
import { handleImageError, resolveImageUrl } from "../../utils/imageUrl";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface CareTip {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: string;
  created_date: string;
  views_count: number;
  status: "published" | "draft";
  image: string | null;
  plant_ids?: number[];
}

interface CareTipFormData {
  title: string;
  excerpt: string;
  content: string;
  category: "watering" | "fertilizing" | "pest_control" | "indoor" | "outdoor" | "seasonal";
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "published" | "draft";
  image: string;
  plant_ids: number[];
}

const emptyForm: CareTipFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "watering",
  difficulty: "beginner",
  status: "published",
  image: "",
  plant_ids: [],
};

export interface CareProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  image: string | null;
  description?: string | null;
  views?: number;
  total_sold?: number;
}

interface CareProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  image: string;
  is_active: boolean;
}

const emptyProductForm: CareProductFormData = {
  name: "",
  category: "Plant Care",
  price: "",
  stock: "25",
  description: "",
  image: "",
  is_active: true,
};

const FALLBACK_IMAGE = "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp";

export default function ManageCareTips() {
  // Navigation between Care Guides & Care Products
  const [activeSection, setActiveSection] = useState<"guides" | "products">("guides");

  // ================= GUIDES STATE =================
  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<CareTip | null>(null);
  const [previewTip, setPreviewTip] = useState<CareTip | null>(null);
  const [formData, setFormData] = useState<CareTipFormData>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: number; name: string; category?: string; price: number; image?: string }>>([]);
  const [productSearch, setProductSearch] = useState("");

  // ================= CARE PRODUCTS STATE =================
  const [careProducts, setCareProducts] = useState<CareProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productFilterCategory, setProductFilterCategory] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CareProductItem | null>(null);
  const [productFormData, setProductFormData] = useState<CareProductFormData>(emptyProductForm);
  const [productSelectedImage, setProductSelectedImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productBusyId, setProductBusyId] = useState<number | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    void fetchCareTips();
    void fetchCareProducts();
  }, []);

  useEffect(() => () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    if (productImagePreview?.startsWith("blob:")) URL.revokeObjectURL(productImagePreview);
  }, [imagePreview, productImagePreview]);

  const getPreviewText = (excerpt: string, content: string, maxLength = 155) => {
    if (excerpt.trim()) return excerpt;
    const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain;
  };

  // ================= FETCH GUIDES =================
  const fetchCareTips = async () => {
    setLoading(true);
    setPageError("");
    try {
      const token = getToken();
      const tipsData = [];
      let page = 1;
      let lastPage = 1;
      do {
        const res = await fetch(`${API}/api/admin/care-tips?per_page=100&page=${page}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load care tips. Please try again.");
        const data = await res.json();
        const items = data.data?.tips ?? data.data?.data ?? data.data;
        if (!Array.isArray(items)) throw new Error("Invalid care tips response.");
        tipsData.push(...items);
        lastPage = Number(data.data?.pagination?.last_page) || 1;
        page++;
      } while (page <= lastPage);

      const transformedTips: CareTip[] = tipsData.map((tip: any) => ({
        id: tip.id,
        title: tip.title,
        excerpt: tip.excerpt || "",
        content: tip.content || "",
        category: tip.category || "watering",
        difficulty: tip.difficulty || "beginner",
        created_date: tip.created_at,
        views_count: tip.views_count || 0,
        status: tip.is_published ? "published" : "draft",
        image: tip.image,
        plant_ids: Array.isArray(tip.plant_ids) ? tip.plant_ids : [],
      }));
      setCareTips(transformedTips);
    } catch (error) {
      console.error("Error fetching care tips:", error);
      setPageError("Failed to load care tips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH CARE PRODUCTS =================
  const fetchCareProducts = async () => {
    setLoadingProducts(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/admin/plants?per_page=100`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const allPlants = data.data?.plants ?? data.data?.data ?? data.plants ?? [];
        
        // Filter specifically for Care Products, soils, fertilizers, pest control, tools, seeds, decor
        const careItems: CareProductItem[] = allPlants.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category || "Plant Care",
          price: Number(item.price) || 0,
          stock: Number(item.stock) ?? 0,
          is_active: Boolean(item.is_active),
          image: item.image || null,
          description: item.description || "",
          views: item.views || 0,
          total_sold: item.total_sold || 0,
        }));

        setCareProducts(careItems);

        // Also update availableProducts list for linking to guides
        setAvailableProducts(
          careItems.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image || undefined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load care products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ================= GUIDE ACTIONS =================
  const closeEditor = (force = false) => {
    if (saving && !force) return;
    setShowModal(false);
    setEditingTip(null);
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setSubmitError(null);
  };

  const handleAddNewGuide = () => {
    setEditingTip(null);
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditGuide = (tip: CareTip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      excerpt: tip.excerpt || "",
      content: tip.content || "",
      category: (tip.category as CareTipFormData["category"]) || "watering",
      difficulty: (tip.difficulty as CareTipFormData["difficulty"]) || "beginner",
      status: tip.status,
      image: tip.image || "",
      plant_ids: Array.isArray(tip.plant_ids) ? tip.plant_ids : [],
    });
    setSelectedImage(null);
    setImagePreview(tip.image ? resolveImageUrl(tip.image, FALLBACK_IMAGE) : null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleGuideSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSubmitError(null);
    if (!formData.title.trim() || !formData.content.trim()) {
      setSubmitError("A title and guide content are required.");
      return;
    }
    setSaving(true);
    const token = getToken();
    try {
      let imagePath = formData.image || null;
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append("file", selectedImage);
        formDataImage.append("directory", "care-tips");
        const uploadRes = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          body: formDataImage,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imagePath = uploadData.data?.path || uploadData.path;
        } else {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.message || `Image upload failed (${uploadRes.status})`);
        }
      }
      const url = editingTip ? `${API}/api/admin/care-tips/${editingTip.id}` : `${API}/api/admin/care-tips`;
      const method = editingTip ? "PUT" : "POST";
      const requestBody: Record<string, unknown> = {
        title: formData.title.trim(),
        excerpt: formData.excerpt,
        content: formData.content.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        is_published: formData.status === "published",
        image: imagePath || null,
        plant_ids: formData.plant_ids,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        closeEditor(true);
        await fetchCareTips();
      } else {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Failed to save care tip (${res.status})`);
      }
    } catch (error) {
      console.error("Error saving care tip:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to save care tip.");
    } finally {
      setSaving(false);
    }
  };

  const changeTipStatus = async (tip: CareTip, action: "delete" | "toggle") => {
    if (busyId !== null) return;
    if (action === "delete" && !confirm("Are you sure you want to delete this care tip?")) return;
    setBusyId(tip.id);
    try {
      const res = await fetch(`${API}/api/admin/care-tips/${tip.id}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        ...(action === "toggle" ? { body: JSON.stringify({ is_published: tip.status !== "published" }) } : {}),
      });
      if (!res.ok) throw new Error("Could not update the guide.");
      await fetchCareTips();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not update the guide.");
    } finally {
      setBusyId(null);
    }
  };

  // ================= CARE PRODUCTS ACTIONS =================
  const closeProductModal = () => {
    if (productSaving) return;
    setShowProductModal(false);
    setEditingProduct(null);
    setProductFormData(emptyProductForm);
    setProductSelectedImage(null);
    setProductImagePreview(null);
    setProductError(null);
  };

  const handleAddNewCareProduct = () => {
    setEditingProduct(null);
    setProductFormData(emptyProductForm);
    setProductSelectedImage(null);
    setProductImagePreview(null);
    setProductError(null);
    setShowProductModal(true);
  };

  const handleEditCareProduct = (prod: CareProductItem) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      category: prod.category || "Plant Care",
      price: String(prod.price),
      stock: String(prod.stock),
      description: prod.description || "",
      image: prod.image || "",
      is_active: prod.is_active,
    });
    setProductSelectedImage(null);
    setProductImagePreview(prod.image ? resolveImageUrl(prod.image, FALLBACK_IMAGE) : null);
    setProductError(null);
    setShowProductModal(true);
  };

  const handleCareProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productSaving) return;
    setProductError(null);

    if (!productFormData.name.trim()) {
      setProductError("Product name is required.");
      return;
    }
    const priceNum = parseFloat(productFormData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setProductError("Enter a valid price greater than 0.");
      return;
    }

    setProductSaving(true);
    const token = getToken();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", productFormData.name.trim());
      formDataToSend.append("category", productFormData.category);
      formDataToSend.append("price", String(priceNum));
      formDataToSend.append("stock", String(parseInt(productFormData.stock) || 0));
      formDataToSend.append("description", productFormData.description.trim());
      formDataToSend.append("is_active", productFormData.is_active ? "1" : "0");

      if (productSelectedImage) {
        formDataToSend.append("image", productSelectedImage);
      } else if (productFormData.image) {
        formDataToSend.append("image", productFormData.image);
      }

      const url = editingProduct
        ? `${API}/api/plants/${editingProduct.id}`
        : `${API}/api/plants`;

      if (editingProduct) {
        formDataToSend.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (res.ok) {
        closeProductModal();
        await fetchCareProducts();
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save care product.");
      }
    } catch (err) {
      setProductError(err instanceof Error ? err.message : "Error saving product.");
    } finally {
      setProductSaving(false);
    }
  };

  const handleToggleProductActive = async (prod: CareProductItem) => {
    if (productBusyId !== null) return;
    setProductBusyId(prod.id);
    try {
      const res = await fetch(`${API}/api/plants/${prod.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_active: !prod.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      await fetchCareProducts();
    } catch (err) {
      alert("Could not update product status.");
    } finally {
      setProductBusyId(null);
    }
  };

  const handleDeleteCareProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this care product?")) return;
    try {
      const res = await fetch(`${API}/api/plants/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete product.");
      await fetchCareProducts();
    } catch (err) {
      alert("Could not delete product.");
    }
  };

  // ================= FILTERED LISTS =================
  const filteredTips = careTips
    .filter((tip) => !statusFilter || tip.status === statusFilter)
    .filter(
      (tip) =>
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredCareProducts = careProducts.filter((prod) => {
    if (productFilterCategory && !prod.category.toLowerCase().includes(productFilterCategory.toLowerCase())) {
      return false;
    }
    if (productSearchQuery && !prod.name.toLowerCase().includes(productSearchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

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
      case "beginner": return "admin-status-active";
      case "intermediate": return "admin-status-pending";
      case "advanced": return "admin-status-inactive";
      default: return "";
    }
  };

  const activeProductsCount = careProducts.filter((p) => p.is_active).length;
  const lowStockCount = careProducts.filter((p) => p.stock < 10).length;
  const publishedGuidesCount = careTips.filter((t) => t.status === "published").length;
  const totalViews = careTips.reduce((sum, tip) => sum + tip.views_count, 0);

  return (
    <AdminLayout>
      <div className="admin-page admin-care-tips-page">
        {/* ================= HERO HEADER & SECTION SWITCHER ================= */}
        <section className="admin-care-tips-hero" style={{ paddingBottom: "1rem" }}>
          <div className="admin-care-tips-hero-copy">
            <span className="admin-care-tips-kicker">Care Tips Studio</span>
            <h2>Plant Care Guidance & Products Management</h2>
            <p>
              Manage both educational botanical guides and purchasable care products (soils, fertilizers, neem sprays, tools) displayed on the public Care Tips page.
            </p>
          </div>
          <div className="admin-care-tips-hero-side">
            {activeSection === "guides" ? (
              <button className="admin-btn admin-btn-primary" onClick={handleAddNewGuide}>
                <Plus size={18} />
                Create New Guide
              </button>
            ) : (
              <button className="admin-btn admin-btn-primary" onClick={handleAddNewCareProduct}>
                <Plus size={18} />
                Add Care Product
              </button>
            )}
          </div>
        </section>

        {/* Studio Section Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => setActiveSection("guides")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.4rem",
              borderRadius: "8px",
              border: activeSection === "guides" ? "2px solid #0d4e3a" : "1px solid #cbd5e1",
              background: activeSection === "guides" ? "#ecfdf5" : "#ffffff",
              color: activeSection === "guides" ? "#065f46" : "#475569",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
            }}
          >
            <FileText size={17} />
            Care Guides Library ({careTips.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("products")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.4rem",
              borderRadius: "8px",
              border: activeSection === "products" ? "2px solid #0d4e3a" : "1px solid #cbd5e1",
              background: activeSection === "products" ? "#ecfdf5" : "#ffffff",
              color: activeSection === "products" ? "#065f46" : "#475569",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
            }}
          >
            <ShoppingBag size={17} />
            Care Products Catalog ({careProducts.length})
          </button>
        </div>

        {/* =========================================================================
            SECTION 1: CARE GUIDES STUDIO
           ========================================================================= */}
        {activeSection === "guides" && (
          <>
            <section className="admin-care-tips-stats">
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon emerald"><FileText size={20} /></div>
                <div>
                  <span>Total Guides</span>
                  <strong>{careTips.length}</strong>
                </div>
              </article>
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon blue"><Sparkles size={20} /></div>
                <div>
                  <span>Published Guides</span>
                  <strong>{publishedGuidesCount}</strong>
                </div>
              </article>
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon purple"><Clock3 size={20} /></div>
                <div>
                  <span>Drafts</span>
                  <strong>{careTips.length - publishedGuidesCount}</strong>
                </div>
              </article>
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon amber"><BarChart3 size={20} /></div>
                <div>
                  <span>Total Views</span>
                  <strong>{totalViews.toLocaleString()}</strong>
                </div>
              </article>
            </section>

            <div className="admin-filters admin-care-tips-filters">
              <div className="admin-search admin-care-tips-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search title, excerpt, category, or difficulty..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <label>
                Status filter{" "}
                <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All guides</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </label>
            </div>

            {pageError && <div role="alert" className="admin-care-tip-error">{pageError}</div>}
            <div className="admin-table-container admin-care-tips-table-wrap">
              {loading ? (
                <div className="admin-loading">Loading care tips...</div>
              ) : (
                <table className="admin-table admin-table-striped">
                  <thead>
                    <tr>
                      <th>Guide</th>
                      <th>Difficulty</th>
                      <th>Linked Products</th>
                      <th>Created</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTips.map((tip) => (
                      <tr key={tip.id}>
                        <td>
                          <div className="admin-care-tip-cell">
                            <div className="admin-care-tip-thumb">
                              <img
                                src={resolveImageUrl(tip.image, FALLBACK_IMAGE)}
                                alt={tip.title}
                                onError={(event) => handleImageError(event, FALLBACK_IMAGE)}
                                loading="lazy"
                              />
                            </div>
                            <div className="admin-care-tip-copy">
                              <div className="admin-care-tip-copy-top">
                                <strong>{tip.title}</strong>
                                <span className="admin-care-tip-category-pill">
                                  {getCategoryLabel(tip.category)}
                                </span>
                              </div>
                              <p>{getPreviewText(tip.excerpt, tip.content)}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${getDifficultyColor(tip.difficulty)}`}>
                            {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                          </span>
                        </td>
                        <td>
                          {tip.plant_ids && tip.plant_ids.length > 0 ? (
                            <span
                              className="admin-care-tip-category-pill"
                              style={{
                                background: "#ecfdf5",
                                color: "#065f46",
                                border: "1px solid #a7f3d0",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontSize: "0.78rem",
                                padding: "0.2rem 0.5rem",
                              }}
                              title={
                                availableProducts
                                  .filter((p) => tip.plant_ids?.includes(p.id))
                                  .map((p) => p.name)
                                  .join(", ") || `${tip.plant_ids.length} products`
                              }
                            >
                              <ShoppingBag size={12} />
                              {tip.plant_ids.length} linked
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>None</span>
                          )}
                        </td>
                        <td>{formatDate(tip.created_date)}</td>
                        <td>{tip.views_count.toLocaleString()}</td>
                        <td>
                          <span
                            className={`admin-status-badge ${
                              tip.status === "published" ? "admin-status-active" : "admin-status-pending"
                            }`}
                          >
                            {tip.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-action-btn admin-action-view"
                              title="Preview"
                              onClick={() => setPreviewTip(tip)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="admin-action-btn admin-action-edit"
                              title="Edit"
                              onClick={() => handleEditGuide(tip)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="admin-care-tip-publish-btn"
                              title={tip.status === "published" ? "Unpublish" : "Publish"}
                              disabled={busyId !== null}
                              onClick={() => void changeTipStatus(tip, "toggle")}
                            >
                              {tip.status === "published" ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              className="admin-action-btn admin-action-delete"
                              title="Delete"
                              disabled={busyId !== null}
                              onClick={() => void changeTipStatus(tip, "delete")}
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
          </>
        )}

        {/* =========================================================================
            SECTION 2: CARE PRODUCTS CATALOG STUDIO (Admin keeps products)
           ========================================================================= */}
        {activeSection === "products" && (
          <>
            <section className="admin-care-tips-stats">
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon emerald"><Package size={20} /></div>
                <div>
                  <span>Total Care Products</span>
                  <strong>{careProducts.length}</strong>
                </div>
              </article>
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon blue"><CheckCircle2 size={20} /></div>
                <div>
                  <span>Active On Public Site</span>
                  <strong>{activeProductsCount}</strong>
                </div>
              </article>
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon amber"><AlertCircle size={20} /></div>
                <div>
                  <span>Low Stock (&lt;10)</span>
                  <strong>{lowStockCount}</strong>
                </div>
              </article>
              <article className="admin-care-tips-stat-card">
                <div className="admin-care-tips-stat-icon purple"><Layers size={20} /></div>
                <div>
                  <span>Care Categories</span>
                  <strong>7 types</strong>
                </div>
              </article>
            </section>

            <div className="admin-filters admin-care-tips-filters">
              <div className="admin-search admin-care-tips-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search care product by name or description..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
              <label>
                Category{" "}
                <select
                  aria-label="Filter by category"
                  value={productFilterCategory}
                  onChange={(e) => setProductFilterCategory(e.target.value)}
                >
                  <option value="">All Care Categories</option>
                  <option value="Plant Care">Plant Care & Sprays</option>
                  <option value="Soil">Soil & Media</option>
                  <option value="Fertilizer">Fertilizers & Food</option>
                  <option value="Seed">Seeds & Microgreens</option>
                  <option value="Tool">Garden Tools</option>
                  <option value="Water">Watering Supplies</option>
                  <option value="Decor">Gardening Decor</option>
                </select>
              </label>
            </div>

            <div className="admin-table-container admin-care-tips-table-wrap">
              {loadingProducts ? (
                <div className="admin-loading">Loading care products...</div>
              ) : (
                <table className="admin-table admin-table-striped">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCareProducts.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                              <img
                                src={resolveImageUrl(prod.image, FALLBACK_IMAGE)}
                                alt={prod.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                              />
                            </div>
                            <div>
                              <strong style={{ display: "block", color: "#1e293b", fontSize: "0.9rem" }}>{prod.name}</strong>
                              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>ID #{prod.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              background: "#f1f5f9",
                              color: "#334155",
                            }}
                          >
                            {prod.category}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#0d4e3a" }}>Rs. {prod.price}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: prod.stock <= 5 ? "#dc2626" : "#1e293b" }}>
                            {prod.stock} in stock
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${prod.is_active ? "admin-status-active" : "admin-status-inactive"}`}>
                            {prod.is_active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-action-btn admin-action-edit"
                              title="Edit Care Product"
                              onClick={() => handleEditCareProduct(prod)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="admin-care-tip-publish-btn"
                              title={prod.is_active ? "Hide from Care Tips" : "Show on Care Tips"}
                              disabled={productBusyId !== null}
                              onClick={() => void handleToggleProductActive(prod)}
                            >
                              {prod.is_active ? "Hide" : "Show"}
                            </button>
                            <button
                              className="admin-action-btn admin-action-delete"
                              title="Delete Product"
                              onClick={() => void handleDeleteCareProduct(prod.id)}
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
              {!loadingProducts && filteredCareProducts.length === 0 && (
                <div className="admin-empty-state">
                  <p>No care products found. Click "Add Care Product" to add your first product!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* =========================================================================
            MODAL 1: CREATE / EDIT CARE GUIDE
           ========================================================================= */}
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => closeEditor()}>
            <div className="admin-modal admin-modal-large admin-care-tip-editor-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingTip ? "Edit Care Tip" : "Create New Care Tip"}</h3>
                <button className="admin-modal-close" onClick={() => closeEditor()}><X size={20} /></button>
              </div>
              {submitError && <div role="alert" className="admin-care-tip-error">{submitError}</div>}
              <form onSubmit={handleGuideSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-title">Care Tip Title *</label>
                    <input
                      type="text"
                      maxLength={255}
                      id="care-tip-title"
                      value={formData.title}
                      onChange={(e) => setFormData((cur) => ({ ...cur, title: e.target.value }))}
                      required
                      placeholder="e.g., How to Water Your Cactus"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-category">Category *</label>
                    <select
                      id="care-tip-category"
                      value={formData.category}
                      onChange={(e) => setFormData((cur) => ({ ...cur, category: e.target.value as CareTipFormData["category"] }))}
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
                    <label htmlFor="care-tip-difficulty">Difficulty Level *</label>
                    <select
                      id="care-tip-difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData((cur) => ({ ...cur, difficulty: e.target.value as CareTipFormData["difficulty"] }))}
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="care-tip-status">Status</label>
                    <select
                      id="care-tip-status"
                      value={formData.status}
                      onChange={(e) => setFormData((cur) => ({ ...cur, status: e.target.value as "published" | "draft" }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="care-tip-excerpt">Excerpt (Brief Summary)</label>
                  <textarea
                    id="care-tip-excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData((cur) => ({ ...cur, excerpt: e.target.value }))}
                    rows={3}
                    placeholder="Summarize the care tip in 1-2 clear sentences."
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="care-tip-content">Content *</label>
                  <textarea
                    id="care-tip-content"
                    value={formData.content}
                    onChange={(e) => setFormData((cur) => ({ ...cur, content: e.target.value }))}
                    rows={8}
                    required
                    placeholder="Write the full guide here."
                  />
                </div>

                {/* Linked Products Section */}
                <div className="admin-form-group">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <ShoppingBag size={16} style={{ color: "#059669" }} />
                      Recommended Care Products (Linked Products)
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                      {formData.plant_ids.length} linked to this guide
                    </span>
                  </label>

                  {formData.plant_ids.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      {formData.plant_ids.map((id) => {
                        const prod = availableProducts.find((p) => p.id === id);
                        return (
                          <span
                            key={id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "9999px",
                              padding: "0.25rem 0.65rem 0.25rem 0.4rem",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                            }}
                          >
                            <span>{prod?.name || `Product #${id}`}</span>
                            {prod?.price ? <span style={{ color: "#059669", fontWeight: 600 }}>Rs. {prod.price}</span> : null}
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, plant_ids: prev.plant_ids.filter((item) => item !== id) }))}
                              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Search products by name to link..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />

                  {productSearch.trim().length > 0 && (
                    <div style={{ maxHeight: "150px", overflowY: "auto", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "0.35rem" }}>
                      {availableProducts
                        .filter((p) => !formData.plant_ids.includes(p.id) && p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .slice(0, 6)
                        .map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, plant_ids: [...prev.plant_ids, prod.id] }));
                              setProductSearch("");
                            }}
                            style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                          >
                            <span>{prod.name}</span>
                            <span style={{ color: "#059669", fontWeight: 600 }}>+ Add (Rs. {prod.price})</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Featured Image</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, image: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    placeholder="Image URL or upload below"
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", marginBottom: "0.5rem" }}
                  />
                  <label className="admin-btn admin-btn-secondary" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <Upload size={14} />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => closeEditor()}>Cancel</button>
                  <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                    {saving ? "Saving..." : editingTip ? "Update Care Tip" : "Create Care Tip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: ADD / EDIT CARE PRODUCT
           ========================================================================= */}
        {showProductModal && (
          <div className="admin-modal-overlay" onClick={closeProductModal}>
            <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingProduct ? "Edit Care Product" : "Add New Care Product"}</h3>
                <button className="admin-modal-close" onClick={closeProductModal}><X size={20} /></button>
              </div>

              {productError && <div role="alert" className="admin-care-tip-error">{productError}</div>}

              <form onSubmit={handleCareProductSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Organic Cold-Pressed Neem Oil Spray (500ml)"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData((prev) => ({ ...prev, category: e.target.value }))}
                      required
                    >
                      <option value="Plant Care">Plant Care & Sprays</option>
                      <option value="Soil & Media">Soil & Media</option>
                      <option value="Fertilizers">Fertilizers & Food</option>
                      <option value="Seeds">Seeds & Microgreens</option>
                      <option value="Garden Tools">Garden Tools & Shears</option>
                      <option value="Watering">Watering Supplies</option>
                      <option value="Gardening Decor">Gardening Decor & Poles</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Price (Rs.) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData((prev) => ({ ...prev, price: e.target.value }))}
                      required
                      placeholder="e.g., 520"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      value={productFormData.stock}
                      onChange={(e) => setProductFormData((prev) => ({ ...prev, stock: e.target.value }))}
                      required
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description & Care Benefits</label>
                  <textarea
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe how this product protects or nourishes plants..."
                  />
                </div>

                <div className="admin-form-group">
                  <label>Product Image</label>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", flexShrink: 0 }}>
                      <img
                        src={productImagePreview || productFormData.image || FALLBACK_IMAGE}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={productFormData.image}
                        onChange={(e) => {
                          setProductFormData((prev) => ({ ...prev, image: e.target.value }));
                          setProductImagePreview(e.target.value);
                        }}
                        placeholder="Image URL (/images/neem.webp or https://...)"
                        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginBottom: "0.4rem" }}
                      />
                      <label className="admin-btn admin-btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Upload size={13} />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProductSelectedImage(file);
                              setProductImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ marginTop: "0.5rem" }}>
                    <small style={{ color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Quick Presets:</small>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {[
                        { label: "Neem Spray", path: "/images/neem.webp" },
                        { label: "Fertilizer Sticks", path: "/images/sticks.webp" },
                        { label: "Seaweed Liquid", path: "/images/seaweed.webp" },
                        { label: "Glass Sprayer", path: "/images/sprayer.webp" },
                        { label: "Garden Trowel", path: "/images/sovel.webp" },
                        { label: "Watering Can", path: "/images/can.jpg" },
                        { label: "Soil Mix", path: "/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp" },
                        { label: "Seeds", path: "/images/categories/seeds.webp" },
                        { label: "Decor / Pole", path: "/images/categories/decor.webp" },
                      ].map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => {
                            setProductFormData((prev) => ({ ...prev, image: preset.path }));
                            setProductImagePreview(preset.path);
                          }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={productFormData.is_active}
                      onChange={(e) => setProductFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span>Active and visible in public Care Tips catalog</span>
                  </label>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={closeProductModal}>Cancel</button>
                  <button type="submit" disabled={productSaving} className="admin-btn admin-btn-primary">
                    {productSaving ? "Saving..." : editingProduct ? "Update Product" : "Add Care Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: PREVIEW CARE GUIDE
           ========================================================================= */}
        {previewTip && (
          <div className="admin-modal-overlay" onClick={() => setPreviewTip(null)}>
            <div className="admin-modal admin-care-tip-preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Care Tip Preview</h3>
                <button className="admin-modal-close" onClick={() => setPreviewTip(null)}><X size={20} /></button>
              </div>
              <div className="admin-care-tip-preview">
                <h4>{previewTip.title}</h4>
                <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
                  <span className="admin-care-tip-category-pill">{getCategoryLabel(previewTip.category)}</span>
                  <span className={`admin-status-badge ${getDifficultyColor(previewTip.difficulty)}`}>{previewTip.difficulty}</span>
                </div>
                <p style={{ color: "#64748b", margin: "0.75rem 0" }}>{previewTip.excerpt}</p>
                <div style={{ marginTop: "1rem", whiteSpace: "pre-line", color: "#334155" }}>{previewTip.content}</div>
              </div>
              <div className="admin-modal-footer">
                <a className="admin-btn admin-btn-secondary" href={`/care-tips/${previewTip.id}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Open Public Page
                </a>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => { setPreviewTip(null); handleEditGuide(previewTip); }}>
                  <Edit size={16} /> Edit Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

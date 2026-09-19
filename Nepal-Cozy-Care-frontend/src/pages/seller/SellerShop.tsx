import { useEffect, useState } from "react";
import {
  Store,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  ShieldCheck,
  Save,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import "../../components/seller/seller.css";
import type { Shop } from "../../types/shop";
import { DEFAULT_PLANT_IMAGE, handleImageError, resolveImageUrl } from "../../utils/imageUrl";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function SellerShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    establishment_year: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/seller/shop`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const s: Shop = json.data.shop;
        setShop(s);
        setFormData({
          name: s.name || "",
          short_description: s.short_description || "",
          description: s.description || "",
          establishment_year: s.establishment_year?.toString() || "",
          email: s.email || "",
          phone: s.phone || "",
          address: s.address || "",
          city: s.city || "",
          website: s.website || "",
        });
        if (s.logo) {
          setLogoPreview(resolveImageUrl(s.logo, DEFAULT_PLANT_IMAGE));
        }
        if (s.banner) {
          setBannerPreview(resolveImageUrl(s.banner, DEFAULT_PLANT_IMAGE));
        }
      }
    } catch (err) {
      console.error("Failed to load seller shop", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) data.append(k, v);
      });
      if (logoFile) data.append("logo", logoFile);
      if (bannerFile) data.append("banner", bannerFile);

      const res = await fetch(`${API}/api/seller/shop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update shop details.");
      }

      setStatusMsg({ type: "success", text: "Shop details updated successfully!" });
      const updatedShop = json.data.shop as Shop;
      setShop(updatedShop);
      setLogoFile(null);
      setBannerFile(null);
      if (updatedShop.logo) {
        setLogoPreview(resolveImageUrl(updatedShop.logo, DEFAULT_PLANT_IMAGE) + `?t=${Date.now()}`);
      }
      if (updatedShop.banner) {
        setBannerPreview(resolveImageUrl(updatedShop.banner, DEFAULT_PLANT_IMAGE) + `?t=${Date.now()}`);
      }
      window.dispatchEvent(
        new CustomEvent("cozycare:seller-shop-updated", { detail: updatedShop })
      );
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1000px" }}>
        {/* Header with status badge & view store button */}
        <div className="seller-form-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {shop?.name || "Shop Profile & Branding"}
              </h2>
              {shop?.is_verified && (
                <span className="seller-badge seller-badge-approved">
                  <ShieldCheck size={12} />
                  <span>Verified Partner</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
              Customize how your farm nursery and plant catalog appears to customers across Nepal Cozy Care.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className={`seller-badge seller-badge-${shop?.status || "pending"}`}>
              Status: {shop?.status || "Pending"}
            </span>
            {shop?.slug && (
              <a
                href={`/shops/${shop.slug}`}
                target="_blank"
                rel="noreferrer"
                className="seller-btn seller-btn-secondary seller-btn-sm"
              >
                <ExternalLink size={14} />
                <span>Preview Store</span>
              </a>
            )}
          </div>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: "0.9rem 1.25rem",
              borderRadius: "10px",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: statusMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: statusMsg.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${statusMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {loading ? (
          <div className="seller-card" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            Loading nursery profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Brand Imagery Section */}
            <div className="seller-form-card">
              <div className="seller-form-card-head">
                <h3>Storefront Brand Imagery</h3>
                <p>Upload a clean nursery storefront banner and high-resolution logo</p>
              </div>

              {/* Banner */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Storefront Banner Image (Recommended: 1200x350)
                </label>
                <div className="seller-banner-upload-box">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      onError={(event) => handleImageError(event, DEFAULT_PLANT_IMAGE)}
                    />
                  ) : (
                    <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>No banner uploaded yet</span>
                  )}
                  <label
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(255,255,255,0.95)",
                      color: "#1e293b",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      padding: "0.45rem 0.85rem",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBannerFile(file);
                          setBannerPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Shop Logo (Recommended: Square 400x400)
                </label>
                <div className="seller-logo-upload-wrap">
                  <div className="seller-logo-avatar-box">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        onError={(event) => handleImageError(event, DEFAULT_PLANT_IMAGE)}
                      />
                    ) : (
                      shop?.name?.charAt(0) || <Store size={26} />
                    )}
                  </div>
                  <div>
                    <label className="seller-btn seller-btn-secondary" style={{ cursor: "pointer" }}>
                      <Upload size={14} />
                      <span>Choose New Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLogoFile(file);
                            setLogoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0.3rem 0 0" }}>
                      Supports PNG, JPG, or WEBP up to 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* General Nursery Details */}
            <div className="seller-form-card">
              <div className="seller-form-card-head">
                <h3>General Nursery Information</h3>
                <p>Basic information displayed on your storefront and order receipts</p>
              </div>

              <div className="seller-form-grid">
                <div className="seller-form-group">
                  <label htmlFor="shopName">Shop / Nursery Name *</label>
                  <input
                    id="shopName"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Evergreen Flora Nursery"
                  />
                </div>

                <div className="seller-form-group">
                  <label htmlFor="estYear">Establishment Year</label>
                  <input
                    id="estYear"
                    type="number"
                    value={formData.establishment_year}
                    onChange={(e) => setFormData({ ...formData, establishment_year: e.target.value })}
                    placeholder="e.g. 2018"
                  />
                </div>
              </div>

              <div className="seller-form-group">
                <label htmlFor="tagline">Short Tagline / Catchphrase *</label>
                <input
                  id="tagline"
                  type="text"
                  required
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="e.g. Specialist in indoor air-purifying foliage and rare succulents"
                />
              </div>

              <div className="seller-form-group">
                <label htmlFor="aboutDesc">About the Nursery & Farm Story</label>
                <textarea
                  id="aboutDesc"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your passion for plants, your cultivation techniques, and your warranty on plant health..."
                />
              </div>
            </div>

            {/* Contact & Location Details */}
            <div className="seller-form-card">
              <div className="seller-form-card-head">
                <h3>Contact & Physical Location</h3>
                <p>Location details for customer deliveries and contact channels</p>
              </div>

              <div className="seller-form-grid">
                <div className="seller-form-group">
                  <label htmlFor="bizEmail">Business Email *</label>
                  <input
                    id="bizEmail"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nursery@example.com"
                  />
                </div>

                <div className="seller-form-group">
                  <label htmlFor="bizPhone">Contact Phone *</label>
                  <input
                    id="bizPhone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div className="seller-form-grid">
                <div className="seller-form-group">
                  <label htmlFor="bizCity">City / Region *</label>
                  <input
                    id="bizCity"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kathmandu"
                  />
                </div>

                <div className="seller-form-group">
                  <label htmlFor="bizAddress">Street / Physical Address *</label>
                  <input
                    id="bizAddress"
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Ward 4, Baluwatar"
                  />
                </div>
              </div>

              <div className="seller-form-group">
                <label htmlFor="bizWeb">Official Website (Optional)</label>
                <input
                  id="bizWeb"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yournursery.com.np"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={saving}
                className="seller-btn seller-btn-primary"
                style={{ padding: "0.75rem 1.75rem", fontSize: "0.9rem" }}
              >
                <Save size={16} />
                <span>{saving ? "Saving Changes..." : "Save Shop Profile"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </SellerLayout>
  );
}

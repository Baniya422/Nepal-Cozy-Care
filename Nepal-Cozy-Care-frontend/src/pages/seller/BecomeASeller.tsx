import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Upload,
  Sparkles,
  MapPin,
  Building2,
  Image as ImageIcon,
  Check,
  Trash2,
} from "lucide-react";
import type { Shop } from "../../types/shop";
import { compressImage } from "../../utils/imageCompressor";
import "../../styles/shops.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function BecomeASeller() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingShop, setExistingShop] = useState<Shop | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    establishment_year: new Date().getFullYear().toString(),
    email: "",
    phone: "",
    address: "",
    city: "Kathmandu",
    website: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API}/api/seller/application-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data?.has_shop) {
            setExistingShop(data.data.shop);
            setFormData({
              name: data.data.shop.name || "",
              short_description: data.data.shop.short_description || "",
              description: data.data.shop.description || "",
              establishment_year: data.data.shop.establishment_year?.toString() || "",
              email: data.data.shop.email || "",
              phone: data.data.shop.phone || "",
              address: data.data.shop.address || "",
              city: data.data.shop.city || "Kathmandu",
              website: data.data.shop.website || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch application status", err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [token]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
      setLogoFile(compressed);
      setLogoPreview(URL.createObjectURL(compressed));
    } catch {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 800, quality: 0.82 });
      setBannerFile(compressed);
      setBannerPreview(URL.createObjectURL(compressed));
    } catch {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate("/login?redirect=/become-a-seller");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });
      if (logoFile) data.append("logo", logoFile);
      if (bannerFile) data.append("banner", bannerFile);

      const res = await fetch(`${API}/api/seller/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to submit seller application.");
      }

      setSuccessMsg(json.message || "Application submitted successfully!");
      setExistingShop(json.data.shop);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="become-seller-page">
      {/* Hero Header */}
      <section className="seller-hero">
        <div className="seller-hero-inner">
          <div className="seller-hero-badge">
            <Sparkles size={14} />
            Partner Marketplace Program
          </div>
          <h1 className="seller-hero-title">
            Grow Your Nursery Business With Nepal Cozy Care
          </h1>
          <p className="seller-hero-subtext">
            Join Nepal’s premier plant marketplace. Connect directly with plant enthusiasts,
            garden lovers, and interior green designers across Kathmandu Valley and nationwide.
          </p>

          <div className="seller-hero-trust-chips">
            <span className="seller-trust-chip">
              <Check size={14} style={{ color: "#34d399" }} /> Free Digital Storefront
            </span>
            <span className="seller-trust-chip">
              <Check size={14} style={{ color: "#34d399" }} /> Verified Nursery Badge
            </span>
            <span className="seller-trust-chip">
              <Check size={14} style={{ color: "#34d399" }} /> Direct Customer Orders
            </span>
            <span className="seller-trust-chip">
              <Check size={14} style={{ color: "#34d399" }} /> Merchant Control Portal
            </span>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="seller-benefits-wrap">
        <div className="seller-benefits-grid">
          <div className="seller-benefit-card">
            <div className="seller-benefit-icon">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="seller-benefit-title">Expand Customer Reach</h3>
              <p className="seller-benefit-text">
                Reach thousands of verified plant buyers in Kathmandu Valley and beyond actively searching for healthy flora.
              </p>
            </div>
          </div>

          <div className="seller-benefit-card">
            <div className="seller-benefit-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="seller-benefit-title">Dedicated Shop Storefront</h3>
              <p className="seller-benefit-text">
                Showcase your unique nursery story, photos, location, direct contact, and verified partner credibility.
              </p>
            </div>
          </div>

          <div className="seller-benefit-card">
            <div className="seller-benefit-icon">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="seller-benefit-title">Full Inventory Control</h3>
              <p className="seller-benefit-text">
                Manage your catalog, adjust pricing and stock, and fulfill incoming orders with simple merchant tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Bar */}
      <div className="seller-steps-bar">
        <div className="seller-step-item">
          <div className="seller-step-number">1</div>
          <span className="seller-step-title">Submit Details</span>
          <span className="seller-step-desc">Fill nursery credentials below</span>
        </div>
        <div className="seller-step-item">
          <div className="seller-step-number">2</div>
          <span className="seller-step-title">Fast Verification</span>
          <span className="seller-step-desc">Review within 24h</span>
        </div>
        <div className="seller-step-item">
          <div className="seller-step-number">3</div>
          <span className="seller-step-title">Start Selling</span>
          <span className="seller-step-desc">List plants & grow your brand</span>
        </div>
      </div>

      {/* Status banner or Application Form */}
      <main className="seller-content-section">
        {loading ? (
          <div className="seller-form-card" style={{ textAlign: "center", color: "#64748b", padding: "4rem 1rem" }}>
            <div style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid #cbd5e1", borderTopColor: "#059669", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: "1rem", fontSize: "0.875rem", fontWeight: 600 }}>Checking partner application status...</p>
          </div>
        ) : existingShop?.status === "approved" ? (
          <div className="seller-status-card status-approved">
            <CheckCircle2 className="seller-status-icon" style={{ color: "#059669" }} />
            <h2 className="seller-status-title">You Are An Approved Partner Nursery!</h2>
            <p className="seller-status-text">
              Your nursery <strong>{existingShop.name}</strong> is live and verified on the Cozy Care marketplace. You can now manage your catalog, prices, and orders in the partner portal.
            </p>
            <div className="seller-status-actions">
              <Link to="/seller/dashboard" className="seller-status-btn-primary">
                Open Seller Dashboard <ArrowRight size={16} />
              </Link>
              <Link to={`/shops/${existingShop.slug}`} className="seller-status-btn-secondary">
                View Public Storefront
              </Link>
            </div>
          </div>
        ) : existingShop?.status === "pending" ? (
          <div className="seller-status-card status-pending">
            <Clock className="seller-status-icon" style={{ color: "#d97706" }} />
            <h2 className="seller-status-title">Application is on Review</h2>
            <p className="seller-status-text">
              Thank you for applying! Our team is currently verifying credentials for <strong>{existingShop.name}</strong>. You will receive an update once approved.
            </p>
            <div style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#92400e" }}>
              Registered City: <strong>{existingShop.city}</strong> • Phone: <strong>{existingShop.phone}</strong>
            </div>
          </div>
        ) : existingShop?.status === "suspended" ? (
          <div className="seller-status-card status-suspended">
            <XCircle className="seller-status-icon" style={{ color: "#dc2626" }} />
            <h2 className="seller-status-title">Shop Account Suspended</h2>
            <p className="seller-status-text">
              Your partner account for <strong>{existingShop.name}</strong> has been temporarily suspended. Please reach out to our team for assistance.
            </p>
            <div className="seller-status-actions">
              <Link to="/about" className="seller-status-btn-primary">
                Contact Administration
              </Link>
            </div>
          </div>
        ) : (
          <div className="seller-form-card">
            {existingShop?.status === "rejected" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.75rem", color: "#991b1b" }}>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.35rem" }}>Previous Application Revision Requested</p>
                <p style={{ fontSize: "0.8125rem" }}>
                  Feedback from Super Admin: <strong>{existingShop.rejection_reason || "Please review and update your credentials."}</strong>
                </p>
                <p style={{ fontSize: "0.75rem", color: "#7f1d1d", marginTop: "0.5rem" }}>Update your details below and click resubmit.</p>
              </div>
            )}

            <div className="seller-form-header">
              <h2 className="seller-form-heading">Partner Nursery Application</h2>
              <p className="seller-form-subtitle">
                Provide your nursery credentials to be verified and listed on Nepal Cozy Care marketplace.
              </p>
            </div>

            {errorMsg && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.875rem 1rem", borderRadius: "0.75rem", fontSize: "0.8125rem", marginBottom: "1.5rem" }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "0.875rem 1rem", borderRadius: "0.75rem", fontSize: "0.8125rem", marginBottom: "1.5rem", fontWeight: 600 }}>
                {successMsg}
              </div>
            )}

            {!token && (
              <div className="seller-auth-notice">
                <span className="seller-auth-notice-text">
                  Already have a Cozy Care account? Log in first to connect your nursery directly to your account.
                </span>
                <Link to="/login?redirect=/become-a-seller" className="seller-auth-login-btn">
                  Log In First
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Fieldset 1: Identity */}
              <div className="seller-form-fieldset">
                <div className="seller-fieldset-header">
                  <Building2 size={16} style={{ color: "#059669" }} />
                  <span className="seller-fieldset-title">Nursery Identity</span>
                  <div className="seller-fieldset-line" />
                </div>

                <div className="seller-form-row two-cols">
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Nursery / Shop Name <span className="seller-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kathmandu Valley Botanical Nursery"
                      className="seller-input"
                    />
                  </div>
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Establishment Year
                    </label>
                    <input
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.establishment_year}
                      onChange={(e) => setFormData({ ...formData, establishment_year: e.target.value })}
                      placeholder="e.g. 2018"
                      className="seller-input"
                    />
                  </div>
                </div>

                <div className="seller-form-row">
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Tagline / Specialties Summary <span className="seller-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={255}
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="e.g. Specialized in rare succulents, native foliage & handmade pots"
                      className="seller-input"
                    />
                  </div>
                </div>

                <div className="seller-form-row">
                  <div className="seller-field-group">
                    <label className="seller-label">
                      About Nursery & Care Philosophy
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell customers about your nursery, farming practices, soil mixtures, and plant care philosophy..."
                      className="seller-textarea"
                    />
                  </div>
                </div>
              </div>

              {/* Fieldset 2: Contact & Location */}
              <div className="seller-form-fieldset">
                <div className="seller-fieldset-header">
                  <MapPin size={16} style={{ color: "#059669" }} />
                  <span className="seller-fieldset-title">Contact & Location</span>
                  <div className="seller-fieldset-line" />
                </div>

                <div className="seller-form-row two-cols">
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Business Email <span className="seller-required">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@yournursery.com"
                      className="seller-input"
                    />
                  </div>
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Contact Phone / WhatsApp <span className="seller-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className="seller-input"
                    />
                  </div>
                </div>

                <div className="seller-form-row two-cols">
                  <div className="seller-field-group">
                    <label className="seller-label">
                      City / Region <span className="seller-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Kathmandu, Lalitpur, Pokhara, etc."
                      className="seller-input"
                    />
                  </div>
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Street Address <span className="seller-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Ward 4, Baluwatar"
                      className="seller-input"
                    />
                  </div>
                </div>

                <div className="seller-form-row">
                  <div className="seller-field-group">
                    <label className="seller-label">
                      Website or Social Media Profile (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://facebook.com/your-nursery or https://yournursery.com"
                      className="seller-input"
                    />
                  </div>
                </div>
              </div>

              {/* Fieldset 3: Branding Photos */}
              <div className="seller-form-fieldset">
                <div className="seller-fieldset-header">
                  <ImageIcon size={16} style={{ color: "#059669" }} />
                  <span className="seller-fieldset-title">Nursery Branding & Imagery</span>
                  <div className="seller-fieldset-line" />
                </div>

                <div className="seller-uploads-grid">
                  {/* Logo Upload */}
                  <div className="seller-upload-box">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                    />
                    <Upload className="seller-upload-icon" />
                    <span className="seller-upload-label">Shop Logo or Avatar</span>
                    <span className="seller-upload-hint">Square image, auto-compressed (WebP/JPG)</span>

                    {logoPreview && (
                      <div className="seller-upload-preview" onClick={(e) => e.stopPropagation()}>
                        <img src={logoPreview} alt="Logo preview" className="seller-preview-thumb" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {logoFile?.name || "logo.webp"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "auto" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Banner Upload */}
                  <div className="seller-upload-box">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleBannerChange}
                    />
                    <Upload className="seller-upload-icon" />
                    <span className="seller-upload-label">Storefront Hero Banner</span>
                    <span className="seller-upload-hint">Landscape photo of your greenhouse or nursery</span>

                    {bannerPreview && (
                      <div className="seller-upload-preview" onClick={(e) => e.stopPropagation()}>
                        <img src={bannerPreview} alt="Banner preview" className="seller-preview-thumb" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {bannerFile?.name || "banner.webp"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerFile(null);
                            setBannerPreview(null);
                          }}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "auto" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="seller-submit-btn"
              >
                {submitting ? (
                  <>Submitting Partner Application...</>
                ) : (
                  <>
                    Submit Partner Seller Application
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Upload,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import type { Shop } from "../../types/shop";

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
  const [bannerFile, setBannerFile] = useState<File | null>(null);

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
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700/80 px-4 py-1.5 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Store size={14} />
            Partner Marketplace
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Grow Your Nursery Business With Nepal Cozy Care
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Join Nepal’s premier plant marketplace. Connect directly with plant enthusiasts, garden lovers, and home decorators across Nepal.
          </p>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-8 px-4 max-w-5xl mx-auto -mt-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Expand Customer Reach</h3>
              <p className="text-xs text-slate-500 mt-1">
                Reach thousands of verified plant shoppers in Kathmandu Valley and beyond.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dedicated Shop Profile</h3>
              <p className="text-xs text-slate-500 mt-1">
                Showcase your nursery branding, story, logo, contact, and direct catalog.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <Leaf size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Full Inventory Control</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage stock, update prices, and fulfill your own incoming order items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status banner or Application Form */}
      <section className="py-8 px-4 max-w-3xl mx-auto w-full flex-1">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500">
            Checking seller application status...
          </div>
        ) : existingShop?.status === "approved" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-emerald-950">You Are An Approved Partner Seller!</h2>
            <p className="text-sm text-emerald-800 mt-2 max-w-md mx-auto">
              Your shop <strong>{existingShop.name}</strong> is live and approved. You can add products and manage your store in the Seller Portal.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/seller/dashboard"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition inline-flex items-center gap-2"
              >
                Go to Seller Dashboard <ArrowRight size={16} />
              </Link>
              <Link
                to={`/shops/${existingShop.slug}`}
                className="bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 font-semibold text-sm px-5 py-2.5 rounded-lg transition"
              >
                View Public Shop
              </Link>
            </div>
          </div>
        ) : existingShop?.status === "pending" ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-amber-950">Application Pending Super Admin Review</h2>
            <p className="text-sm text-amber-800 mt-2 max-w-md mx-auto">
              Thank you for applying! Our Super Admin team is currently reviewing your shop{" "}
              <strong>{existingShop.name}</strong>. You will be notified once approved.
            </p>
            <p className="text-xs text-amber-700 mt-3">
              Registered City: {existingShop.city} • Phone: {existingShop.phone}
            </p>
          </div>
        ) : existingShop?.status === "suspended" ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-red-950">Shop Account Suspended</h2>
            <p className="text-sm text-red-800 mt-2 max-w-md mx-auto">
              Your seller account for <strong>{existingShop.name}</strong> has been suspended. Please contact the Nepal Cozy Care administration team.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-lg"
            >
              Contact Support
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            {existingShop?.status === "rejected" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                <p className="font-bold text-sm mb-1">Previous Application Update Required</p>
                <p>
                  Reason from Super Admin:{" "}
                  <span className="font-medium">{existingShop.rejection_reason || "Details need revision."}</span>
                </p>
                <p className="mt-1 text-slate-600">Please review and update your details below to resubmit.</p>
              </div>
            )}

            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Partner Seller Application</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your farm, nursery, or business credentials for Super Admin verification.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">
                {successMsg}
              </div>
            )}

            {!token && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">
                  Have an account? Log in first to link your seller shop to your profile.
                </span>
                <Link
                  to="/login?redirect=/become-a-seller"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  Log In
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shop / Nursery Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kathmandu Valley Flora"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Establishment Year
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.establishment_year}
                    onChange={(e) => setFormData({ ...formData, establishment_year: e.target.value })}
                    placeholder="e.g. 2019"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Tagline / Summary *
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="e.g. Specialized in rare succulents, indoor foliage & handcrafted pots"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Nursery Story & Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your nursery, farming practices, and plant care philosophy..."
                  className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@yourfarm.com"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kathmandu, Lalitpur, Pokhara, etc."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nursery Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Ward 4, Baluwatar"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website or Social Media Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://facebook.com/your-nursery or website URL"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="block text-xs font-medium text-slate-700 mb-1">Shop Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>

                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="block text-xs font-medium text-slate-700 mb-1">Storefront Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Submitting Application..." : "Submit Partner Seller Application"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

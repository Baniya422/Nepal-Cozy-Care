import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  ShieldCheck,
  Package,
  Search,
  ArrowLeft,
  Heart,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import type { Shop } from "../../types/shop";
import type { Plant } from "../../types/plant";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";
import { useWishlist } from "../../hooks/useWishlist";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ShopDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });

  useEffect(() => {
    if (!slug) return;

    const fetchShop = async () => {
      setLoadingShop(true);
      try {
        const res = await fetch(`${API}/api/shops/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setShop(json.data.shop);
        }
      } catch (err) {
        console.error("Failed to fetch shop profile", err);
      } finally {
        setLoadingShop(false);
      }
    };

    fetchShop();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchPlants = async () => {
      setLoadingPlants(true);
      try {
        let url = `${API}/api/shops/${slug}/plants?per_page=50&include_accessories=true`;
        if (categoryFilter !== "all") {
          url += `&category=${encodeURIComponent(categoryFilter)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setPlants(json.data.plants || []);
        }
      } catch (err) {
        console.error("Failed to fetch shop plants", err);
      } finally {
        setLoadingPlants(false);
      }
    };

    fetchPlants();
  }, [slug, categoryFilter]);

  const filteredPlants = plants.filter((plant) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      plant.name.toLowerCase().includes(q) ||
      plant.scientific_name?.toLowerCase().includes(q) ||
      plant.description?.toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(plants.map((p) => p.category).filter(Boolean)));

  if (loadingShop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
          Loading nursery profile...
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <Store className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Nursery Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The nursery you are looking for might be unavailable or currently undergoing verification.
          </p>
          <Link
            to="/shops"
            className="mt-6 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const logoUrl = shop.logo
    ? shop.logo.startsWith("http")
      ? shop.logo
      : `${API}/storage/${shop.logo}`
    : null;
  const bannerUrl = shop.banner
    ? shop.banner.startsWith("http")
      ? shop.banner
      : `${API}/storage/${shop.banner}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Storefront Banner */}
      <div className="relative h-60 md:h-80 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={`${shop.name} Banner`}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-pattern opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            to="/shops"
            className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm border border-white/20 transition"
          >
            <ArrowLeft size={14} /> All Partner Shops
          </Link>
        </div>
      </div>

      {/* Shop Info Card Overlapping Banner */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 w-full mb-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 p-1">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center">
                    {shop.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {shop.name}
                  </h1>
                  {shop.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      Verified Partner Nursery
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
                  {shop.short_description || "Specialized in healthy house plants, seasonal flowering varieties & gardening essentials."}
                </p>

                {/* Quick Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                  {shop.city && (
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin size={14} className="text-emerald-600" />
                      {shop.address ? `${shop.address}, ` : ""}
                      {shop.city}
                    </span>
                  )}
                  {shop.establishment_year && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      Est. {shop.establishment_year}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Package size={14} />
                    {shop.plants_count ?? plants.length} Available Items
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 md:w-72 flex-shrink-0">
              <span className="block font-bold text-slate-900 text-xs uppercase tracking-wider text-[10px] text-slate-400">
                Direct Nursery Contact
              </span>
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 font-medium"
                >
                  <Phone size={13} className="text-emerald-600" />
                  {shop.phone}
                </a>
              )}
              {shop.email && (
                <a
                  href={`mailto:${shop.email}`}
                  className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 font-medium truncate"
                >
                  <Mail size={13} className="text-emerald-600" />
                  <span className="truncate">{shop.email}</span>
                </a>
              )}
              {shop.website && (
                <a
                  href={shop.website.startsWith("http") ? shop.website : `https://${shop.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-emerald-700 hover:underline font-medium truncate"
                >
                  <Globe size={13} className="text-emerald-600" />
                  <span className="truncate">{shop.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* Description Story */}
          {shop.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                About The Nursery
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl whitespace-pre-line">
                {shop.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Section */}
      <main className="max-w-6xl mx-auto px-4 pb-16 flex-1 w-full">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Products by {shop.name}</h2>
            <p className="text-xs text-slate-500">
              All items are prepared and dispatched directly from this nursery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search shop items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loadingPlants ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products currently available</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              This nursery hasn’t listed any products matching this filter yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE)}
                    alt={plant.name}
                    onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(plant.id)}
                    disabled={wishlistBusyId === plant.id}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-slate-600 transition"
                  >
                    <Heart
                      size={16}
                      className={wishlistIds.includes(plant.id) ? "fill-rose-500 text-rose-500" : ""}
                    />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                    {plant.category || "House Plant"}
                  </span>
                  <Link
                    to={`/plants/${plant.id}`}
                    className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition mt-1 line-clamp-1"
                  >
                    {plant.name}
                  </Link>
                  {plant.scientific_name && (
                    <span className="text-[11px] text-slate-400 italic line-clamp-1">
                      {plant.scientific_name}
                    </span>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      Rs. {plant.price.toLocaleString()}
                    </span>
                    <Link
                      to={`/plants/${plant.id}`}
                      className="text-xs bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

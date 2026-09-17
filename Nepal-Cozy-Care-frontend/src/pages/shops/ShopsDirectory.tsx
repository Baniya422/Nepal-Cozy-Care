import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Calendar,
  ShieldCheck,
  Search,
  ArrowRight,
  Package,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ShopsDirectory() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    fetchShops();
  }, [selectedCity]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/shops?per_page=30`;
      if (selectedCity !== "all") {
        url += `&city=${encodeURIComponent(selectedCity)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setShops(json.data.shops || []);
      }
    } catch (err) {
      console.error("Failed to load shops directory", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      shop.name.toLowerCase().includes(q) ||
      shop.city?.toLowerCase().includes(q) ||
      shop.short_description?.toLowerCase().includes(q)
    );
  });

  const cities = Array.from(new Set(shops.map((s) => s.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/80 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-700">
            <Store size={14} />
            Marketplace Directory
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Partner Plant Nurseries & Farms
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-xl mx-auto">
            Explore trusted independent plant growers, boutique nurseries, and botanical artisans across Nepal.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-6xl mx-auto px-4 -mt-6 w-full z-10">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by nursery name, specialty or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Shops Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No nurseries found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn’t find any approved nurseries matching your search criteria. Try a different city or query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => {
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
                <div
                  key={shop.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  {/* Banner header with logo */}
                  <div className="relative h-28 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
                    {bannerUrl && (
                      <img
                        src={bannerUrl}
                        alt={`${shop.name} banner`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Logo avatar */}
                    <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-xl bg-white p-1 shadow-md border border-slate-100 flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={shop.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                          {shop.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-7 p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {shop.name}
                      </h3>
                      {shop.is_verified && (
                        <span
                          className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold"
                          title="Verified Partner Nursery"
                        >
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 flex-1">
                      {shop.short_description || "Specialized in native plants, succulents, and decorative greenery."}
                    </p>

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                      {shop.city && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={12} className="text-emerald-600" />
                          {shop.city}
                        </span>
                      )}
                      {shop.establishment_year && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar size={12} className="text-slate-400" />
                          Est. {shop.establishment_year}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-500 ml-auto font-medium">
                        <Package size={12} className="text-slate-400" />
                        {shop.plants_count ?? 0} Plants
                      </span>
                    </div>

                    {/* View Shop CTA */}
                    <div className="mt-4 pt-2">
                      <Link
                        to={`/shops/${shop.slug}`}
                        className="w-full py-2 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition duration-150"
                      >
                        Visit Shop Storefront
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Become a partner banner */}
        <div className="mt-14 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-emerald-800 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              <Sparkles size={12} />
              Nursery Owners & Plant Growers
            </span>
            <h3 className="text-2xl font-bold">Sell Your Plants on Nepal Cozy Care</h3>
            <p className="text-emerald-100 text-xs md:text-sm mt-1.5 leading-relaxed">
              Create your free digital storefront, reach customers across Nepal, and manage your inventory with our partner tools.
            </p>
          </div>
          <Link
            to="/become-a-seller"
            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-6 py-3 rounded-xl text-sm transition whitespace-nowrap shadow-sm"
          >
            Apply to Become a Partner
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

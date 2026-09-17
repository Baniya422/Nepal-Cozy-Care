import { useEffect, useState } from "react";
import {
  Store,
  ShieldCheck,
  Search,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ManageShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setShops(json.data.shops || []);
      }
    } catch (err) {
      console.error("Failed to load marketplace shops", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (shop: Shop) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    }
  };

  const handleSuspend = async (shop: Shop) => {
    if (!window.confirm(`Are you sure you want to suspend "${shop.name}"? Products from this shop will no longer appear publicly.`)) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/suspend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      } else {
        setActionFeedback({ type: "error", text: json.message || "Suspension failed." });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    }
  };

  const handleReactivate = async (shop: Shop) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/reactivate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    }
  };

  const filteredShops = shops.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <Store size={14} />
              Super Admin Directory
            </div>
            <h2 className="text-xl font-bold text-slate-900">Manage Marketplace Shops</h2>
            <p className="text-xs text-slate-500">
              Verify partner nurseries, manage store statuses, and suspend or reactivate shops.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {actionFeedback && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              actionFeedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {actionFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {actionFeedback.text}
          </div>
        )}

        {/* Shops Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading shops...</div>
          ) : filteredShops.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No shops found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Shop Name</th>
                    <th className="p-3">Owner User</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Products</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Verified Badge</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0">
                            {shop.logo ? (
                              <img
                                src={
                                  shop.logo.startsWith("http")
                                    ? shop.logo
                                    : `${API}/storage/${shop.logo}`
                                }
                                alt={shop.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              shop.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{shop.name}</span>
                              {shop.slug === "nepal-cozy-care" && (
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  Default Platform
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{shop.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-700">{shop.user?.name || "N/A"}</span>
                        <p className="text-[10px] text-slate-400">{shop.user?.email}</p>
                      </td>
                      <td className="p-3 text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-600" />
                          {shop.city}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-semibold">
                        {shop.plants_count ?? 0} plants
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            shop.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : shop.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : shop.status === "suspended"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {shop.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleVerify(shop)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                            shop.is_verified
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <ShieldCheck
                            size={14}
                            className={shop.is_verified ? "text-emerald-600" : "text-slate-400"}
                          />
                          {shop.is_verified ? "Verified" : "Unverified"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/shops/${shop.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                            title="Visit Public Storefront"
                          >
                            <ExternalLink size={15} />
                          </a>

                          {shop.slug !== "nepal-cozy-care" && (
                            <>
                              {shop.status === "suspended" ? (
                                <button
                                  onClick={() => handleReactivate(shop)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition"
                                >
                                  Reactivate
                                </button>
                              ) : shop.status === "approved" ? (
                                <button
                                  onClick={() => handleSuspend(shop)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                                >
                                  Suspend
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

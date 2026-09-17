import { useEffect, useState } from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  Search,
  Store,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import type { Plant } from "../../types/plant";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ManageMarketplaceProducts() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [rejectingPlant, setRejectingPlant] = useState<Plant | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, shopFilter]);

  const fetchShops = async () => {
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
      console.error("Failed to load shops filter", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/admin/marketplace/products?per_page=100`;
      if (statusFilter !== "all") {
        url += `&approval_status=${statusFilter}`;
      }
      if (shopFilter !== "all") {
        url += `&shop_id=${shopFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPlants(json.data.plants || []);
      }
    } catch (err) {
      console.error("Failed to load marketplace products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (plant: Plant) => {
    setProcessingId(plant.id);
    setFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/marketplace/products/${plant.id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: json.message });
        fetchProducts();
      } else {
        setFeedback({ type: "error", text: json.message || "Approval failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPlant || !rejectReason.trim()) return;

    setProcessingId(rejectingPlant.id);
    setFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/marketplace/products/${rejectingPlant.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: json.message });
        setRejectingPlant(null);
        setRejectReason("");
        fetchProducts();
      } else {
        setFeedback({ type: "error", text: json.message || "Rejection failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPlants = plants.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.shop?.name.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <Package size={14} />
              Marketplace Catalog Oversight
            </div>
            <h2 className="text-xl font-bold text-slate-900">All Marketplace Products</h2>
            <p className="text-xs text-slate-500">
              Identify owning shops, review submitted items, and manage platform-wide catalog approvals.
            </p>
          </div>
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

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {st === "all" ? "All Statuses" : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
            >
              <option value="all">All Partner Nurseries</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search products or shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading products...</div>
          ) : filteredPlants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No products match filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Owning Nursery</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Approval Status</th>
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
                            <span className="text-[11px] text-slate-400">
                              {plant.category || "General"}
                            </span>
                            {plant.rejection_reason && (
                              <p className="text-[10px] text-rose-600 mt-0.5">
                                Reason: {plant.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Store size={13} className="text-emerald-700" />
                          <span className="font-semibold text-slate-900">
                            {plant.shop?.name || "Nepal Cozy Care"}
                          </span>
                          {plant.shop?.is_verified && (
                            <ShieldCheck size={12} className="text-emerald-600" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        Rs. {plant.price.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-700">{plant.stock ?? 0} units</td>
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
                          {plant.approval_status !== "approved" && (
                            <button
                              onClick={() => handleApprove(plant)}
                              disabled={processingId === plant.id}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {plant.approval_status !== "rejected" && (
                            <button
                              onClick={() => {
                                setRejectingPlant(plant);
                                setRejectReason("");
                              }}
                              disabled={processingId === plant.id}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition disabled:opacity-50"
                            >
                              Reject
                            </button>
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

        {/* Reject Modal */}
        {rejectingPlant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Reject Product: {rejectingPlant.name}
              </h3>
              <p className="text-xs text-slate-500">
                Provide feedback for the nursery on why this product was not approved (e.g. unclear photo, incorrect care guide, inappropriate pricing).
              </p>

              <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingPlant(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectingPlant.id}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg transition"
                  >
                    Confirm Rejection
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

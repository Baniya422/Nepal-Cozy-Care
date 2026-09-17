import { useEffect, useState } from "react";
import {
  Store,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ManageSellerApplications() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingShop, setRejectingShop] = useState<Shop | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchShops();
  }, [statusFilter]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/admin/shops?per_page=50`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setShops(json.data.shops || []);
      }
    } catch (err) {
      console.error("Failed to load seller applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shop: Shop) => {
    if (!window.confirm(`Approve seller application for "${shop.name}"? This will grant seller permissions to ${shop.email}.`)) {
      return;
    }
    setProcessingId(shop.id);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${shop.id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        fetchShops();
      } else {
        setActionFeedback({ type: "error", text: json.message || "Approval failed" });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingShop || !rejectReason.trim()) return;

    setProcessingId(rejectingShop.id);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops/${rejectingShop.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", text: json.message });
        setRejectingShop(null);
        setRejectReason("");
        fetchShops();
      } else {
        setActionFeedback({ type: "error", text: json.message || "Rejection failed" });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredShops = shops.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.user?.name?.toLowerCase().includes(q)
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
              Super Admin Marketplace Oversight
            </div>
            <h2 className="text-xl font-bold text-slate-900">Partner Seller Applications</h2>
            <p className="text-xs text-slate-500">
              Review and approve nurseries and farm businesses wanting to sell on Nepal Cozy Care.
            </p>
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

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {["pending", "approved", "rejected", "suspended", "all"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {st === "all" ? "All Applications" : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search applicant, shop, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              Loading applications...
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No applications found</p>
              <p className="text-xs text-slate-400 mt-1">
                There are no seller applications matching this status.
              </p>
            </div>
          ) : (
            filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-base">
                      {shop.logo ? (
                        <img
                          src={shop.logo.startsWith("http") ? shop.logo : `${API}/storage/${shop.logo}`}
                          alt={shop.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        shop.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{shop.name}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            shop.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : shop.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {shop.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{shop.short_description}</p>
                    </div>
                  </div>

                  {shop.description && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                      <p className="font-semibold text-slate-800 mb-0.5">Nursery Background:</p>
                      <p className="whitespace-pre-line">{shop.description}</p>
                    </div>
                  )}

                  {shop.rejection_reason && (
                    <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-800 border border-rose-200">
                      <span className="font-bold">Rejection Feedback: </span>
                      {shop.rejection_reason}
                    </div>
                  )}

                  {/* Metadata & User */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin size={13} className="text-emerald-600" />
                      {shop.address}, {shop.city}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone size={13} className="text-emerald-600" />
                      {shop.phone}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Mail size={13} className="text-emerald-600" />
                      {shop.email}
                    </span>
                    {shop.establishment_year && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        Est. {shop.establishment_year}
                      </span>
                    )}
                    {shop.user && (
                      <span className="text-slate-500">
                        Owner: <strong className="text-slate-800">{shop.user.name}</strong> (
                        {shop.user.email})
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center lg:flex-col justify-end gap-2 flex-shrink-0">
                  {shop.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(shop)}
                      disabled={processingId === shop.id}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      Approve & Grant Seller Access
                    </button>
                  )}

                  {shop.status !== "rejected" && (
                    <button
                      onClick={() => {
                        setRejectingShop(shop);
                        setRejectReason("");
                      }}
                      disabled={processingId === shop.id}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {rejectingShop && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Reject Seller Application: {rejectingShop.name}
              </h3>
              <p className="text-xs text-slate-500">
                Provide constructive feedback so the applicant can correct their business information or nursery documentation.
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
                    placeholder="e.g. Please provide a valid registration document or clearer photos of your nursery stock."
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingShop(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectingShop.id}
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

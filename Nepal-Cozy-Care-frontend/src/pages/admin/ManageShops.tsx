import { useEffect, useState } from "react";
import {
  Store,
  ShieldCheck,
  Search,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  shop?: { id: number; name: string } | null;
}

export default function ManageShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create & Assign Shop Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newShopName, setNewShopName] = useState("");
  const [newShopCity, setNewShopCity] = useState("Kathmandu");
  const [newShopPhone, setNewShopPhone] = useState("");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopShortDesc, setNewShopShortDesc] = useState("");
  const [newShopVerified, setNewShopVerified] = useState(true);
  const [creatingShop, setCreatingShop] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const users = (json.data?.users || []) as AdminUser[];
        setUsersList(users);
        if (users.length > 0) {
          setSelectedUserId(String(users[0].id));
          setNewShopName(`${users[0].name} Nursery`);
        }
      }
    } catch (err) {
      console.error("Failed to load users for shop assignment", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelectChange = (userIdStr: string) => {
    setSelectedUserId(userIdStr);
    const chosenUser = usersList.find((u) => String(u.id) === userIdStr);
    if (chosenUser && (!newShopName || newShopName.includes("Nursery"))) {
      setNewShopName(`${chosenUser.name} Nursery`);
    }
  };

  const handleCreateShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newShopName.trim()) return;

    setCreatingShop(true);
    setActionFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/shops`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(selectedUserId),
          name: newShopName.trim(),
          city: newShopCity.trim(),
          phone: newShopPhone.trim() || null,
          address: newShopAddress.trim() || null,
          short_description: newShopShortDesc.trim() || null,
          is_verified: newShopVerified,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to create vendor shop.");
      }

      setActionFeedback({ type: "success", text: json.message });
      setShowCreateModal(false);
      fetchShops();
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message });
    } finally {
      setCreatingShop(false);
    }
  };

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

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Assign & Create Shop</span>
            </button>
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
                            href={`/seller/dashboard?admin_shop_id=${shop.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded text-[11px] font-semibold transition"
                            title="Open Vendor Dashboard for this shop"
                          >
                            <Store size={13} />
                            <span>Vendor View</span>
                          </a>
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

        {/* Create & Assign Vendor Shop Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign & Create Vendor Shop</h3>
                  <p className="text-xs text-slate-500">Register a verified nursery shop directly to a user account.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateShopSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Shop Owner (User) *
                  </label>
                  {loadingUsers ? (
                    <div className="py-2 text-slate-400">Loading registered users...</div>
                  ) : (
                    <select
                      value={selectedUserId}
                      onChange={(e) => handleUserSelectChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) {u.shop ? `[Already owns ${u.shop.name}]` : `[${u.role}]`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shop / Nursery Name *</label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Kathmandu Botanical Nursery"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={newShopCity}
                      onChange={(e) => setNewShopCity(e.target.value)}
                      placeholder="e.g. Kathmandu"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={newShopPhone}
                      onChange={(e) => setNewShopPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    placeholder="e.g. Ward 4, Baluwatar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tagline / Summary</label>
                  <input
                    type="text"
                    value={newShopShortDesc}
                    onChange={(e) => setNewShopShortDesc(e.target.value)}
                    placeholder="e.g. Specialist in indoor foliage and rare succulents"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="newShopVerified"
                    checked={newShopVerified}
                    onChange={(e) => setNewShopVerified(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="newShopVerified" className="text-slate-700 font-medium">
                    Grant Verified Partner Badge immediately
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingShop}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {creatingShop ? "Creating..." : "Create & Activate Shop"}
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

import { useEffect, useState } from "react";
import { ShoppingBag, Search, MapPin, Phone, User, Calendar } from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function SellerOrders() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/api/seller/orders?per_page=50`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOrderItems(json.data.order_items || []);
      }
    } catch (err) {
      console.error("Failed to load seller order items", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = orderItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.product_name?.toLowerCase().includes(q) ||
      item.order_id?.toString().includes(q) ||
      item.shipping_name?.toLowerCase().includes(q) ||
      item.shipping_city?.toLowerCase().includes(q)
    );
  });

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Incoming Order Items</h2>
            <p className="text-xs text-slate-500">
              Only items belonging to your nursery are displayed here for fulfillment and inventory tracking.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {["all", "pending", "packed", "shipped", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {st === "all" ? "All Shipments" : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, product, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              Loading incoming orders...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No order items match your criteria</p>
              <p className="text-xs text-slate-400 mt-1">
                New customer orders containing your products will appear here.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition duration-150"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Item info */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.product_image ? (
                        <img
                          src={
                            item.product_image.startsWith("http")
                              ? item.product_image
                              : `${API}/storage/${item.product_image}`
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                          {item.product_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800 text-xs">
                          Order #{item.order_id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Quantity: <span className="font-semibold text-slate-900">{item.quantity}</span>{" "}
                        × Rs. {item.price.toLocaleString()} ={" "}
                        <span className="font-bold text-emerald-700">
                          Rs. {item.line_total.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Customer shipping details */}
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1 lg:max-w-md w-full border border-slate-100">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <User size={12} className="text-slate-400" />
                      {item.shipping_name || "Customer"}
                      {item.shipping_phone && (
                        <span className="text-slate-500 font-normal flex items-center gap-1 ml-2">
                          <Phone size={11} />
                          {item.shipping_phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {item.shipping_address}, {item.shipping_city}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center lg:flex-col lg:items-end justify-between gap-2 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        item.order_status === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.order_status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : item.order_status === "packed"
                          ? "bg-purple-100 text-purple-800"
                          : item.order_status === "cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.order_status}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      Payment: {item.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SellerLayout>
  );
}

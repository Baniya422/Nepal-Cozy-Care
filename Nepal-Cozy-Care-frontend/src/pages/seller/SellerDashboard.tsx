import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Plus,
  Store,
  ChevronRight,
} from "lucide-react";
import SellerLayout from "../../components/seller/SellerLayout";
import type { SellerStats, Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/seller/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setStats(json.data.stats);
          setShop(json.data.shop);
          setRecentOrders(json.data.recent_orders || []);
        }
      } catch (err) {
        console.error("Failed to load seller dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Welcome & Quick actions bar */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-semibold mb-2">
              <Store size={14} />
              {shop?.name || "Partner Shop"}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Seller Overview</h2>
            <p className="text-emerald-100 text-xs md:text-sm mt-1">
              Track your nursery products, approval requests, and customer shipments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/seller/products?action=new"
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={16} />
              Add Product
            </Link>
            <Link
              to="/seller/shop"
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-600 transition"
            >
              <Store size={14} />
              Edit Shop
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Products</span>
                <Package size={16} className="text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats?.total_products ?? 0}</p>
              <span className="text-[11px] text-slate-400">In your shop</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-semibold">Active Live</span>
                <CheckCircle2 size={16} />
              </div>
              <p className="text-2xl font-black text-emerald-700">{stats?.active_products ?? 0}</p>
              <span className="text-[11px] text-emerald-600 font-medium">Visible to customers</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-amber-500 mb-2">
                <span className="text-xs font-semibold">Pending Review</span>
                <Clock size={16} />
              </div>
              <p className="text-2xl font-black text-amber-600">{stats?.pending_products ?? 0}</p>
              <span className="text-[11px] text-amber-600 font-medium">Awaiting approval</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-rose-500 mb-2">
                <span className="text-xs font-semibold">Low Stock</span>
                <AlertTriangle size={16} />
              </div>
              <p className="text-2xl font-black text-rose-600">{stats?.low_stock_products ?? 0}</p>
              <span className="text-[11px] text-rose-600 font-medium">&lt; 5 units left</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-blue-500 mb-2">
                <span className="text-xs font-semibold">Total Orders</span>
                <ShoppingBag size={16} />
              </div>
              <p className="text-2xl font-black text-blue-700">{stats?.total_orders ?? 0}</p>
              <span className="text-[11px] text-blue-600 font-medium">Order shipments</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-semibold">Total Sales</span>
                <TrendingUp size={16} />
              </div>
              <p className="text-xl font-black text-slate-900">
                Rs. {(stats?.total_sales ?? 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Earned revenue</span>
            </div>
          </div>
        )}

        {/* Recent Order Items */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Order Items</h3>
              <p className="text-xs text-slate-500">Products recently purchased from your nursery</p>
            </div>
            <Link
              to="/seller/orders"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              View All Orders <ChevronRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No orders have been placed for your shop yet. Once customers purchase your approved plants, they will show up here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Line Total</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-emerald-700">#{item.order_id}</td>
                      <td className="p-3 font-medium text-slate-900">{item.product_name}</td>
                      <td className="p-3 text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-slate-600">Rs. {item.price.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        Rs. {item.line_total.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-600">{item.customer_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}

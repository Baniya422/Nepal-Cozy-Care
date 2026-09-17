import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Leaf,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import type { Shop } from "../../types/shop";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 1024;
    }
    return true;
  });
  const [shop, setShop] = useState<Shop | null>(null);

  let userName = "Partner Seller";
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    userName = storedUser?.name || userName;
  } catch {
    // fallback
  }

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/seller/shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setShop(data.data?.shop || null);
        }
      } catch (err) {
        console.error("Error loading seller shop:", err);
      }
    };
    fetchShop();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/seller/shop", label: "Shop Profile", icon: Store },
    { path: "/seller/products", label: "My Products", icon: Leaf },
    { path: "/seller/orders", label: "My Orders", icon: ShoppingBag },
    { path: "/seller/settings", label: "Account & Contact", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/seller/dashboard") {
      return location.pathname === "/seller" || location.pathname === "/seller/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Mobile top navigation */}
      <div className="lg:hidden bg-emerald-950 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-900 focus:outline-none"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Store size={18} />
            <span className="text-white text-base font-semibold">Seller Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {shop?.slug && (
            <Link
              to={`/shops/${shop.slug}`}
              target="_blank"
              className="text-xs bg-emerald-800 hover:bg-emerald-700 px-2.5 py-1 rounded text-emerald-100 flex items-center gap-1"
            >
              <ExternalLink size={12} />
              Store
            </Link>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 bg-emerald-950 text-emerald-100 flex-shrink-0 flex flex-col border-r border-emerald-900/60 z-20`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-emerald-900/80 bg-emerald-900/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight tracking-tight">
                Seller Center
              </h2>
              <span className="text-[11px] text-emerald-400 uppercase tracking-widest font-semibold">
                Nepal Cozy Care
              </span>
            </div>
          </div>
          {shop && (
            <div className="mt-3 p-2 bg-emerald-900/50 rounded-md border border-emerald-800/60">
              <div className="flex items-center gap-2">
                {shop.logo ? (
                  <img
                    src={shop.logo.startsWith("http") ? shop.logo : `${API}/storage/${shop.logo}`}
                    alt={shop.name}
                    className="w-7 h-7 rounded object-cover border border-emerald-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded bg-emerald-800 text-emerald-200 flex items-center justify-center text-xs font-bold">
                    {shop.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{shop.name}</p>
                  <p className="text-[10px] text-emerald-400 capitalize flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-300" />
                    {shop.status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                    : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
                }`}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <Icon size={18} className={active ? "text-white" : "text-emerald-400"} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-emerald-200" />}
              </Link>
            );
          })}
        </nav>

        {/* Public Storefront Link */}
        {shop?.slug && (
          <div className="px-3 pb-3">
            <Link
              to={`/shops/${shop.slug}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 transition-colors border border-emerald-800"
            >
              <ExternalLink size={14} className="text-emerald-400" />
              View My Public Shop
            </Link>
          </div>
        )}

        {/* User profile / Logout bottom */}
        <div className="p-4 border-t border-emerald-900/80 bg-emerald-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">Partner Seller</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-md text-emerald-300 hover:text-red-400 hover:bg-emerald-900/80 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Partner Seller Portal</h1>
            <p className="text-xs text-slate-500">Manage your farm nursery products, inventory and customer order items</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50"
            >
              Nepal Cozy Care Home
            </Link>
            {shop?.slug && (
              <Link
                to={`/shops/${shop.slug}`}
                target="_blank"
                className="text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 transition-colors px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink size={13} />
                Public Storefront
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

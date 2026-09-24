import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, Globe } from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import "../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalPlants:  number; totalOrders:  number;
  totalUsers:   number; totalSales:   number;
  plantsChange: number; ordersChange: number;
  usersChange:  number; salesChange:  number;
}
interface RecentOrder { id: number; order_id: string; customer: string; amount: number; status: string; }
interface TopProduct  { id: number; name: string; sales: number; revenue: number; }





// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, color, delay,
}: {
  icon: string; label: string; value: string | number; color: string; delay: number;
}) {
  return (
    <div
      style={{
        background: "#ffffff", border: "1px solid rgba(28,26,22,0.10)",
        borderRadius: 14, padding: "22px 22px 20px",
        animation: `fadeUp .7s cubic-bezier(.23,1,.32,1) ${delay}s both`,
        transition: "box-shadow .3s, transform .3s",
        cursor: "default",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(45,80,22,0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>{icon}</div>
      </div>
      <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 32, fontWeight: 400, color: "#1c1a16", letterSpacing: "-.02em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#7a7060", marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "#ffffff", border: "1px solid rgba(28,26,22,0.10)",
  borderRadius: 14, overflow: "hidden",
};

const fmt = (amount: number) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const statusColor = (s: string): { bg: string; fg: string } => {
  switch (s.toLowerCase()) {
    case "completed": case "delivered": return { bg: "rgba(45,80,22,0.1)",  fg: "#2d5016" };
    case "pending":                     return { bg: "rgba(196,98,45,0.1)", fg: "#c4622d" };
    case "packed": case "processing":   return { bg: "rgba(26,107,138,0.1)",fg: "#1a6b8a" };
    case "shipped":                     return { bg: "rgba(109,76,158,0.1)",fg: "#6d4c9e" };
    case "cancelled":                   return { bg: "rgba(239,68,68,0.1)", fg: "#dc2626" };
    default:                            return { bg: "rgba(138,107,26,0.1)",fg: "#8a6b1a" };
  }
};

const fmtStatus = (s: string) => s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlants: 0, totalOrders: 0, totalUsers: 0, totalSales: 0,
    plantsChange: 0, ordersChange: 0, usersChange: 0, salesChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts,  setTopProducts]  = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // ── CSS keyframe injection ─────────────────────────────────────────────────
  useEffect(() => {
    const id = "bj-admin-kf";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => { void fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const h = { Authorization: `Bearer ${token}` };

      const [sRes, oRes, pRes] = await Promise.all([
        fetch(`${API}/api/admin/dashboard/stats`,        { headers: h }),
        fetch(`${API}/api/admin/dashboard/recent-orders`,{ headers: h }),
        fetch(`${API}/api/admin/dashboard/top-products`, { headers: h }),
      ]);

      if (sRes.ok) {
        const { data } = await sRes.json();
        setStats({
          totalPlants: data.total_plants,   totalOrders: data.total_orders,
          totalUsers:  data.total_users,    totalSales:  data.total_sales,
          plantsChange: data.changes.plants, ordersChange: data.changes.orders,
          usersChange:  data.changes.users,  salesChange:  data.changes.sales,
        });
      }
      if (oRes.ok) { const d = await oRes.json(); setRecentOrders(d.data || []); }
      if (pRes.ok) {
        const d = await pRes.json();
        setTopProducts((d.data || []).map((p: any) => ({
          id: p.id, name: p.name, sales: p.total_sales, revenue: parseFloat(p.total_revenue),
        })));
      }
    } catch (err) { console.error("Dashboard error:", err); }
    finally { setLoading(false); }
  };

  const statCards = [
    { icon: "🌿", label: "Total Plants",  value: stats.totalPlants,     color: "#2d5016" },
    { icon: "🛍",  label: "Total Orders",  value: stats.totalOrders,     color: "#c4622d" },
    { icon: "👥",  label: "Total Users",   value: stats.totalUsers,      color: "#6d4c9e" },
    { icon: "💰",  label: "Total Sales",   value: fmt(stats.totalSales), color: "#1a6b8a" },
  ];

  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  return (
    <AdminLayout>
      <div
        style={{
          fontFamily: "'Outfit',system-ui,sans-serif",
          background: "#ede8e0", minHeight: "100vh", padding: "clamp(28px,4vw,44px)",
        }}
      >
        {/* ── Welcome header ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".16em", color: "#c4622d", textTransform: "uppercase", marginBottom: 8 }}>
            Dashboard
          </div>
          <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 400, color: "#1c1a16", letterSpacing: "-.02em", margin: 0 }}>
            Good morning 🌱
          </h1>
          <p style={{ color: "#7a7060", fontSize: 13, marginTop: 4 }}>
            Here's everything growing in your store today.
          </p>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
          {loading
            ? [1, 2, 3, 4].map((_, i) => (
                <div key={i} className="admin-stat-card skeleton" style={{ minHeight: 110 }} />
              ))
            : statCards.map((s, i) => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} change={s.change} color={s.color} delay={i * 0.07} />
              ))
          }
        </div>

        {/* ── Charts row ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Weekly Traffic */}
          <div style={{ ...cardStyle, padding: "22px 24px", animation: "fadeUp .7s .28s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, color: "#1c1a16", fontWeight: 400 }}>Weekly Traffic</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", letterSpacing: ".1em", marginTop: 2 }}>Page views · last 7 days</div>
              </div>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 24, color: "#1c1a16", fontWeight: 400 }}>
                {TRAFFIC.reduce((s, d) => s + d.views, 0).toLocaleString()}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#c4622d", marginLeft: 6 }}>↑ 18%</span>
              </div>
            </div>
            <SparkBar data={TRAFFIC} />
          </div>

          {/* Donut */}
          <div style={{ ...cardStyle, padding: "22px 24px", animation: "fadeUp .7s .34s both" }}>
            <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, color: "#1c1a16", fontWeight: 400, marginBottom: 4 }}>Distribution</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", letterSpacing: ".1em", marginBottom: 18 }}>Store breakdown</div>
            <DonutChart data={DONUT_DATA} />
          </div>
        </div>

        {/* ── Quick Actions: CMS links ───────────────────────────────────── */}
        <div style={{ ...cardStyle, padding: "1.25rem 1.5rem", marginBottom: 24, animation: "fadeUp .7s .38s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".5rem" }}>
            <div>
              <h3 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "1.05rem", fontWeight: 400, color: "#1c1a16", margin: 0 }}>
                Website &amp; Content Management
              </h3>
              <p style={{ color: "#7a7060", margin: ".2rem 0 0", fontSize: ".85rem" }}>
                Update live public pages, blogs, care guides, and diagnostic tools.
              </p>
            </div>
            <Link
              to="/admin/page-content"
              style={{ fontSize: ".85rem", color: "#2d5016", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: ".3rem" }}
            >
              Open Full Page Directory <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
            {[
              { to: "/admin/page-content", icon: <Compass size={20} />, color: "#2d5016", bg: "#e8f3ef", title: "Page Content CMS",    sub: "Edit 8 public pages & tools" },
              { to: "/admin/blogs",        icon: <BookOpen size={20} />, color: "#2563eb", bg: "#eff6ff", title: "Editorial Blogs",     sub: "Publish & manage stories" },
              { to: "/admin/care-tips",    icon: <Globe size={20} />,    color: "#d97706", bg: "#fef3c7", title: "Plant Care Guides",   sub: "Watering & tips library" },
            ].map((item) => (
              <Link
                key={item.to} to={item.to}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem", borderRadius: 10,
                  border: "1px solid rgba(28,26,22,0.1)",
                  background: "#f7f4ef", textDecoration: "none", color: "#1c1a16",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(45,80,22,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f7f4ef"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".92rem", color: "#0f172a" }}>{item.title}</div>
                  <div style={{ fontSize: ".8rem", color: "#7a7060" }}>{item.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom grid: Recent Orders + Top Products ─────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", gap: 16 }}>

          {/* Recent Orders */}
          <div style={{ ...cardStyle, animation: "fadeUp .7s .42s both" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(28,26,22,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 17, fontWeight: 400, color: "#1c1a16" }}>Recent Orders</div>
              <button
                onClick={() => navigate("/admin/orders")}
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#c4622d", background: "none", border: "none", cursor: "pointer", letterSpacing: ".1em", textTransform: "uppercase" }}
              >
                Manage All →
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#7a7060", fontSize: 13 }}>Loading…</div>
            ) : recentOrders.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#7a7060" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🛍</div>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, color: "#1c1a16" }}>No recent orders</div>
              </div>
            ) : (
              <div>
                {recentOrders.map((order, i) => {
                  const sc = statusColor(order.status);
                  return (
                    <div
                      key={order.id}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr auto auto auto",
                        alignItems: "center", padding: "12px 22px", gap: 12,
                        borderBottom: i < recentOrders.length - 1 ? "1px solid rgba(28,26,22,0.06)" : "none",
                        transition: "background .15s", cursor: "default",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f7f4ef"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1c1a16" }}>{order.customer}</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060", marginTop: 2 }}>{order.order_id}</div>
                      </div>
                      <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 15, color: "#1c1a16", fontWeight: 400, whiteSpace: "nowrap" }}>
                        {fmt(order.amount)}
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: 100, fontSize: 9,
                        fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase",
                        background: sc.bg, color: sc.fg, fontWeight: 600, whiteSpace: "nowrap",
                      }}>
                        {fmtStatus(order.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div style={{ ...cardStyle, animation: "fadeUp .7s .48s both" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(28,26,22,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 17, fontWeight: 400, color: "#1c1a16" }}>Top Performing Products</div>
              <button
                onClick={() => navigate("/admin/plants")}
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#c4622d", background: "none", border: "none", cursor: "pointer", letterSpacing: ".1em", textTransform: "uppercase" }}
              >
                Manage All →
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#7a7060", fontSize: 13 }}>Loading…</div>
            ) : topProducts.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#7a7060" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, color: "#1c1a16" }}>No product data yet</div>
              </div>
            ) : (
              <div>
                {topProducts.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "12px 22px",
                      borderBottom: i < topProducts.length - 1 ? "1px solid rgba(28,26,22,0.06)" : "none",
                      transition: "background .15s", cursor: "default",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f7f4ef"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    {/* Rank */}
                    <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic", fontSize: 20, color: "rgba(28,26,22,0.12)", width: 28, flexShrink: 0 }}>{i + 1}</div>
                    {/* Name + bar */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1c1a16", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 5 }}>
                        {p.name}
                      </div>
                      <div style={{ height: 3, background: "#ede8e0", borderRadius: 2 }}>
                        <div style={{
                          height: "100%", width: `${(p.revenue / maxRevenue) * 100}%`,
                          background: "linear-gradient(to right, #2d5016, #4a8a26)",
                          borderRadius: 2, transition: "width .6s ease",
                        }} />
                      </div>
                    </div>
                    {/* Revenue + sales */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 15, color: "#1c1a16", fontWeight: 400 }}>{fmt(p.revenue)}</div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#7a7060" }}>{p.sales} sales</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

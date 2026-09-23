import { useEffect } from "react";
import {
  ExternalLink,
  BookOpen,
  Send,
  Truck,
  Sparkles,
  Stethoscope,
  Info,
  ArrowRight,
  Compass,
  House,
  Globe,
  HelpCircle,
  Palette,
  CircleDot,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

type DirectoryCardMeta = {
  key: string;
  name: string;
  url: string;
  editorRoute: string;
  description: string;
  sectionsCount: string;
  icon: any;
  badge: string;
  accentColor: string;
};

const DIRECTORY_PAGES: DirectoryCardMeta[] = [
  {
    key: "homepage",
    name: "Homepage",
    url: "/",
    editorRoute: "/admin/homepage",
    description: "Hero banner, curated plant sections, why choose us, and brand promotional cards.",
    sectionsCount: "6 Key Sections",
    icon: House,
    badge: "Landing",
    accentColor: "#10b981",
  },
  {
    key: "about_page",
    name: "About Us",
    url: "/about",
    editorRoute: "/admin/pages/about",
    description: "Founder story, key growth metrics, company values, and greenhouse team members.",
    sectionsCount: "7 Sections",
    icon: Info,
    badge: "Brand Story",
    accentColor: "#8b5cf6",
  },
  {
    key: "our_mission",
    name: "Our Mission",
    url: "/mission",
    editorRoute: "/admin/pages/mission",
    description: "Purpose statement, four-pillar roadmap, sustainable growth, and customer care promises.",
    sectionsCount: "6 Sections",
    icon: Sparkles,
    badge: "Purpose",
    accentColor: "#ec4899",
  },
  {
    key: "contact_page",
    name: "Contact & Support",
    url: "/contact",
    editorRoute: "/admin/pages/contact",
    description: "Support channels, office hours, customer inquiries, and emergency care hotlines.",
    sectionsCount: "4 Sections",
    icon: Send,
    badge: "Support",
    accentColor: "#f59e0b",
  },
  {
    key: "shipping_page",
    name: "Shipping & Delivery",
    url: "/shipping",
    editorRoute: "/admin/pages/shipping",
    description: "Packaging protection guarantees, valley-wide delivery options, and customer reviews.",
    sectionsCount: "5 Sections",
    icon: Truck,
    badge: "Logistics",
    accentColor: "#06b6d4",
  },
  {
    key: "help_center",
    name: "Help Center",
    url: "/help-center",
    editorRoute: "/admin/pages/help-center",
    description: "FAQ accordions, customer service topics, return policies, and plant guarantees.",
    sectionsCount: "4 Sections",
    icon: HelpCircle,
    badge: "Knowledge",
    accentColor: "#6366f1",
  },
  {
    key: "blogs_page",
    name: "Care Blogs Hub",
    url: "/blogs",
    editorRoute: "/admin/pages/blogs-hub",
    description: "Featured editorial story, headline kicker, search bar, and community newsletter CTA.",
    sectionsCount: "3 Sections",
    icon: BookOpen,
    badge: "Editorial",
    accentColor: "#3b82f6",
  },
  {
    key: "site_branding",
    name: "Website Logo & Name",
    url: "/",
    editorRoute: "/admin/pages/branding",
    description: "Manage website logo image, store name ('Cozy Care'), subtitle ('Nepal Plant Studio'), and dashboard branding.",
    sectionsCount: "Brand Identity",
    icon: Palette,
    badge: "Branding",
    accentColor: "#164e43",
  },
  {
    key: "category_bubbles",
    name: "Category Circles (Bubbles)",
    url: "/plants",
    editorRoute: "/admin/pages/category-bubbles",
    description: "Add, remove, reorder, and customize the circular category filters on catalog pages (/plants, /pots).",
    sectionsCount: "Catalog Filter",
    icon: CircleDot,
    badge: "Catalog",
    accentColor: "#0d9488",
  },
  {
    key: "navigation_menu",
    name: "Navbar & Dropdowns",
    url: "/plants",
    editorRoute: "/admin/pages/navigation",
    description: "Manage plant categories, shop-by-location rooms (kitchen, bathroom, etc.), and care tips dropdowns.",
    sectionsCount: "4 Mega Menus",
    icon: Compass,
    badge: "Navigation",
    accentColor: "#059669",
  },
  {
    key: "plant_finder",
    name: "Plant Finder Tool",
    url: "/plant-finder",
    editorRoute: "/admin/pages/plant-finder",
    description: "Interactive lifestyle quiz, room/light matching algorithms, and plant filter logic.",
    sectionsCount: "Quiz Tool",
    icon: Sparkles,
    badge: "Interactive",
    accentColor: "#14b8a6",
  },
  {
    key: "plant_health",
    name: "Plant Health Doctor",
    url: "/plant-health-checker",
    editorRoute: "/admin/pages/plant-health",
    description: "Symptom diagnosis profiles, pest/disease guides, and seasonal remedies.",
    sectionsCount: "Diagnostic Tool",
    icon: Stethoscope,
    badge: "Diagnostic",
    accentColor: "#ef4444",
  },
];

const LEGACY_TAB_REDIRECTS: Record<string, string> = {
  homepage: "/admin/homepage",
  about_page: "/admin/pages/about",
  our_mission: "/admin/pages/mission",
  contact_page: "/admin/pages/contact",
  shipping_page: "/admin/pages/shipping",
  help_center: "/admin/pages/help-center",
  blogs_page: "/admin/pages/blogs-hub",
  navigation_menu: "/admin/pages/navigation",
  category_bubbles: "/admin/pages/category-bubbles",
  site_branding: "/admin/pages/branding",
  plant_finder: "/admin/pages/plant-finder",
  plant_health: "/admin/pages/plant-health",
};

export default function ManagePageContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Backward compatibility: redirect ?tab=page_key to its dedicated editor route
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && LEGACY_TAB_REDIRECTS[tab]) {
      navigate(LEGACY_TAB_REDIRECTS[tab], { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <AdminLayout>
      <div className="admin-page-content-manager" style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Hub Header */}
        <div
          className="admin-page-content-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
            marginBottom: "1.75rem",
            background: "#ffffff",
            padding: "1.5rem 1.75rem",
            borderRadius: "14px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#e8f3ef",
                color: "#1b4e54",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Globe size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#102e23" }}>
                Website Pages & Content (CMS)
              </h1>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.92rem" }}>
                Each website page now has its own clean, dedicated editor. Click any card below to manage its content.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#1b4e54",
                background: "#e8f3ef",
                padding: "0.45rem 0.85rem",
                borderRadius: "999px",
              }}
            >
              10 Dedicated Page Editors
            </span>
          </div>
        </div>

        {/* Visual Directory Grid */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#102e23", margin: "0 0 0.4rem" }}>
            Select a Page to Edit Content
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.92rem" }}>
            Dedicated interfaces with structured fields for headlines, hero photography, copy, FAQs, and navigation.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {DIRECTORY_PAGES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  padding: "1.4rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: `${item.accentColor}18`,
                        color: item.accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: item.accentColor,
                        background: `${item.accentColor}12`,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "6px",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "0 0 0.4rem",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "#102e23",
                    }}
                  >
                    {item.name}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 1.25rem",
                      fontSize: "0.88rem",
                      color: "#64748b",
                      lineHeight: 1.45,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      color: "#94a3b8",
                      marginBottom: "0.85rem",
                    }}
                  >
                    <span>{item.sectionsCount}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#1b4e54",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontWeight: 600,
                      }}
                    >
                      Visit Live <ExternalLink size={12} />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(item.editorRoute)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "9px",
                      border: "none",
                      background: "#1b4e54",
                      color: "#ffffff",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.45rem",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 6px rgba(27,78,84,0.18)",
                      transition: "background 0.2s ease",
                    }}
                  >
                    Edit Page Content <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

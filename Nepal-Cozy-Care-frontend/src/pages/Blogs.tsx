import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Eye,
  Clock,
  Heart,
  Sparkles,
  Flame,
  LayoutGrid,
  List,
  ArrowRight,
  Stethoscope,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { CURATED_BLOGS, DAILY_BOTANICAL_TIPS, type CuratedBlog } from "../features/blogs/curatedBlogs";
import "../styles/blogs.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const CATEGORIES = [
  "All Stories",
  "Indoor Plants",
  "Plant Care & Hacks",
  "Plant Doctor",
  "Soil & Propagation",
  "Urban Living & Decor",
  "Seasonal Advice",
];

const POPULAR_TAGS = [
  "KathmanduGardening",
  "MonsteraCare",
  "LowLightPlants",
  "RootRot",
  "Propagation",
  "WinterCare",
  "UrbanSanctuary",
  "AirPurifying",
];

export default function Blogs() {
  const navigate = useNavigate();

  // Data states
  const [blogs, setBlogs] = useState<CuratedBlog[]>(CURATED_BLOGS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Stories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("cozy_blog_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily tip widget state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipFlipping, setTipFlipping] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Dynamic Page Content (CMS) from API
  const [pageContent, setPageContent] = useState({
    hero: {
      kicker: "Nepal Cozy Care Botanical Journal & Care Stories",
      title_main: "Stories from the Soil:",
      title_highlight: "Cultivating Life & Serenity",
      subtitle:
        "Deep-dive care handbooks, interior styling guides, Nepal seasonal secrets, and expert wisdom from our greenhouse botanists to your living room.",
      search_placeholder: "Search plant species, care problems, monsoon advice, or hacks...",
      search_button_text: "Find Guides",
      background_image: "/images/blog-hero-lush.jpg",
      badge_1: "60+ Deep-Dive Guides",
      badge_2: "12,000+ Readers in Nepal",
      badge_3: "100% Expert Botanist Verified",
    },
    newsletter: {
      title: "Cultivate a Greener Life Every Weekend",
      subtitle:
        "Receive handpicked seasonal advice for Kathmandu Valley, propagation blueprints, early access to rare exotic plant drops, and exclusive workshop invitations.",
      button_text: "Subscribe Free",
    },
  });

  // Fetch CMS dynamic content template
  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const res = await fetch(`${API}/api/content-templates/blogs_page`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.payload) {
            setPageContent((prev) => ({
              hero: { ...prev.hero, ...(json.data.payload.hero || {}) },
              newsletter: { ...prev.newsletter, ...(json.data.payload.newsletter || {}) },
            }));
          }
        }
      } catch (e) {
        console.warn("Using default blog page content:", e);
      }
    };

    void fetchPageContent();

    const handleContentUpdate = (e: any) => {
      if (e.detail?.key === "blogs_page") {
        void fetchPageContent();
      }
    };
    window.addEventListener("cozycare:content-updated", handleContentUpdate);
    return () => window.removeEventListener("cozycare:content-updated", handleContentUpdate);
  }, []);

  const resolveHeroImage = (path: string) => {
    if (!path) return "/images/blog-hero-lush.jpg";
    if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
    return `${API}/storage/${path}`;
  };

  // Fetch backend blogs and seamlessly merge with curated collection
  useEffect(() => {
    const fetchApiBlogs = async () => {
      try {
        const res = await fetch(`${API}/api/blogs?per_page=30`);
        const json = await res.json();
        const apiList = json.data?.blogs || json.data || [];
        if (Array.isArray(apiList) && apiList.length > 0) {
          // Format API blogs
          const formattedApiBlogs: CuratedBlog[] = apiList.map((b: any, idx: number) => ({
            id: b.id,
            title: b.title,
            excerpt: b.excerpt || (b.content ? b.content.substring(0, 160) + "..." : ""),
            content: b.content || "",
            image: b.image
              ? b.image.startsWith("http") || b.image.startsWith("/")
                ? b.image
                : `${API}/storage/${b.image}`
              : CURATED_BLOGS[idx % CURATED_BLOGS.length].image,
            author: b.author || "Cozy Care Botanist",
            author_role: "Care Specialist",
            author_image: CURATED_BLOGS[idx % CURATED_BLOGS.length].author_image,
            category: b.category || "Indoor Plants",
            read_time: "5 min read",
            views: b.views || Math.floor(Math.random() * 1500) + 400,
            published_at: b.published_at || b.created_at || new Date().toISOString(),
            is_featured: Boolean(b.is_top_trend || idx === 0),
            is_top_trend: Boolean(b.is_top_trend),
            tags: ["PlantCare", "Kathmandu", b.category || "Greenery"],
          }));

          // Merge: Put unique API blogs first, then fill with curated rich articles
          const combined = [
            ...formattedApiBlogs,
            ...CURATED_BLOGS.filter((cb) => !formattedApiBlogs.some((ab) => ab.id === cb.id)),
          ];
          setBlogs(combined);
        }
      } catch (err) {
        console.warn("Using curated fallback blogs:", err);
      }
    };

    void fetchApiBlogs();
  }, []);

  // Filter blogs based on selected category & search query
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCategory =
        selectedCategory === "All Stories" ||
        b.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Featured Spotlight story
  const spotlightBlog = useMemo(() => {
    return blogs.find((b) => b.is_featured) || blogs[0];
  }, [blogs]);

  // Trending stories
  const trendingBlogs = useMemo(() => {
    return blogs.filter((b) => b.is_top_trend || b.views > 2000).slice(0, 5);
  }, [blogs]);

  // Toggle bookmark handler
  const handleToggleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSavedBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id];
      try {
        localStorage.setItem("cozy_blog_bookmarks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Next tip cycler
  const handleNextTip = () => {
    setTipFlipping(true);
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % DAILY_BOTANICAL_TIPS.length);
      setTipFlipping(false);
    }, 200);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  const activeTip = DAILY_BOTANICAL_TIPS[currentTipIndex];

  return (
    <Layout>
      <div className="cozy-blog-root">
        {/* =====================================================================
            1. CINEMATIC HERO WITH MOVING BACKGROUND & FLOATING LEAVES
            ===================================================================== */}
        <section className="cozy-blog-hero">
          {/* Animated Background Image */}
          <div
            className="cozy-blog-hero-bg"
            style={{
              backgroundImage: `url(${resolveHeroImage(pageContent.hero.background_image)})`,
            }}
          />
          <div className="cozy-blog-hero-overlay" />

          {/* Floating Organic Leaf Embellishments */}
          <svg className="floating-leaf-particle floating-leaf-1" viewBox="0 0 24 24" fill="#a7f3d0">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
          <svg className="floating-leaf-particle floating-leaf-2" viewBox="0 0 24 24" fill="#6ee7b7">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <svg className="floating-leaf-particle floating-leaf-3" viewBox="0 0 24 24" fill="#fef08a">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>

          {/* Hero Content Shell */}
          <div className="cozy-blog-hero-content">
            <div className="cozy-blog-kicker-badge">
              <Sparkles size={14} /> {pageContent.hero.kicker}
            </div>
            <h1 className="cozy-blog-hero-title">
              {pageContent.hero.title_main} <span>{pageContent.hero.title_highlight}</span>
            </h1>
            <p className="cozy-blog-hero-subtitle">
              {pageContent.hero.subtitle}
            </p>

            {/* Interactive Live Search Bar */}
            <div className="cozy-blog-search-box">
              <Search size={18} color="#a7f3d0" />
              <input
                type="text"
                placeholder={pageContent.hero.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cozy-blog-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: "4px" }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                className="cozy-blog-search-btn"
                onClick={() => {}}
              >
                {pageContent.hero.search_button_text}
              </button>
            </div>

            {/* Metric Trust Strip */}
            <div className="cozy-blog-stats-strip">
              <div className="cozy-blog-stat-item">
                <BookOpen size={16} />
                <span>{pageContent.hero.badge_1}</span>
              </div>
              <div className="cozy-blog-stat-item">
                <Sparkles size={16} />
                <span>{pageContent.hero.badge_2}</span>
              </div>
              <div className="cozy-blog-stat-item">
                <Stethoscope size={16} />
                <span>{pageContent.hero.badge_3}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. CATEGORY PILLS & VIEW MODE CONTROLS
            ===================================================================== */}
        <section className="cozy-blog-filter-bar">
          <div className="cozy-blog-filter-glass">
            <div className="cozy-blog-pills-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`cozy-blog-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="cozy-blog-view-toggle">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`cozy-blog-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                title="Magazine Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`cozy-blog-toggle-btn ${viewMode === "compact" ? "active" : ""}`}
                title="Compact List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. EDITORIAL SPOTLIGHT / MASTER FEATURE ARTICLE
            ===================================================================== */}
        {spotlightBlog && selectedCategory === "All Stories" && !searchQuery && (
          <section className="cozy-blog-spotlight-section">
            <article className="cozy-spotlight-card" onClick={() => navigate(`/blogs/${spotlightBlog.id}`)}>
              <div className="cozy-spotlight-media">
                <img
                  src={spotlightBlog.image}
                  alt={spotlightBlog.title}
                  className="cozy-spotlight-img"
                />
                <span className="cozy-spotlight-badge">★ Featured Cover Story</span>
              </div>

              <div className="cozy-spotlight-body">
                <div className="cozy-spotlight-meta-top">
                  <span className="cozy-spotlight-category-tag">{spotlightBlog.category}</span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={14} /> {spotlightBlog.read_time}
                  </span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Eye size={14} /> {spotlightBlog.views.toLocaleString()} reads
                  </span>
                </div>

                <h2 className="cozy-spotlight-title">{spotlightBlog.title}</h2>
                <p className="cozy-spotlight-excerpt">{spotlightBlog.excerpt}</p>

                <div className="cozy-spotlight-footer">
                  <div className="cozy-author-pill">
                    <img
                      src={spotlightBlog.author_image}
                      alt={spotlightBlog.author}
                      className="cozy-author-avatar"
                    />
                    <div className="cozy-author-info">
                      <span className="cozy-author-name">{spotlightBlog.author}</span>
                      <span className="cozy-author-role">{spotlightBlog.author_role}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cozy-spotlight-read-btn"
                    onClick={() => navigate(`/blogs/${spotlightBlog.id}`)}
                  >
                    Read Full Story <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* =====================================================================
            4. TRENDING TICKER STRIP
            ===================================================================== */}
        {trendingBlogs.length > 0 && !searchQuery && (
          <section className="cozy-blog-trends-strip">
            <div className="cozy-trends-wrapper">
              <div className="cozy-trends-tag">
                <Flame size={14} /> Trending in Nepal
              </div>
              <div className="cozy-trends-scroll">
                {trendingBlogs.map((tb, idx) => (
                  <div key={tb.id} style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      className="cozy-trend-link"
                      onClick={() => navigate(`/blogs/${tb.id}`)}
                    >
                      #{idx + 1} {tb.title}
                    </span>
                    {idx < trendingBlogs.length - 1 && <span className="cozy-trend-divider" />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            5. MAIN MAGAZINE FEED & INTERACTIVE SIDEBAR
            ===================================================================== */}
        <div className="cozy-blog-main-layout">
          {/* Left / Main Articles Feed */}
          <main>
            {filteredBlogs.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  padding: "4rem 2rem",
                  borderRadius: "20px",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                }}
              >
                <BookOpen size={36} color="#94a3b8" style={{ marginBottom: "1rem" }} />
                <h3 style={{ margin: "0 0 0.5rem", color: "#102e23" }}>No articles found</h3>
                <p style={{ color: "#64748b", margin: "0 0 1.5rem" }}>
                  We couldn't find any guides matching "{searchQuery}". Try searching for another topic.
                </p>
                <button
                  type="button"
                  className="cozy-blog-search-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Stories");
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`cozy-blog-grid ${viewMode === "compact" ? "compact-view" : ""}`}>
                {filteredBlogs.map((blog) => {
                  const isBookmarked = savedBookmarks.includes(blog.id);
                  return (
                    <article
                      key={blog.id}
                      className="cozy-article-card"
                      onClick={() => navigate(`/blogs/${blog.id}`)}
                    >
                      <div className="cozy-card-media">
                        <img src={blog.image} alt={blog.title} className="cozy-card-img" />
                        <span className="cozy-card-category">{blog.category}</span>
                        <button
                          type="button"
                          className={`cozy-card-bookmark-btn ${isBookmarked ? "saved" : ""}`}
                          onClick={(e) => handleToggleBookmark(e, blog.id)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Guide"}
                        >
                          <Heart size={16} fill={isBookmarked ? "#ef4444" : "none"} />
                        </button>
                      </div>

                      <div className="cozy-card-body">
                        <div className="cozy-card-meta">
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={13} /> {blog.read_time}
                          </span>
                          <span>•</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <Eye size={13} /> {blog.views.toLocaleString()}
                          </span>
                        </div>

                        <h3 className="cozy-card-title">{blog.title}</h3>
                        <p className="cozy-card-excerpt">{blog.excerpt}</p>

                        <div className="cozy-card-footer">
                          <div className="cozy-card-author-row">
                            <img
                              src={blog.author_image}
                              alt={blog.author}
                              className="cozy-card-author-avatar"
                            />
                            <span className="cozy-card-author-name">{blog.author}</span>
                          </div>

                          <span className="cozy-card-read-link">
                            Read Guide <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>

          {/* Right Sticky Sidebar with Widgets */}
          <aside className="cozy-blog-sidebar">
            {/* Widget 1: Plant Doctor "Tip of the Day" with Interactive 3D Flip */}
            <div className="cozy-widget-card">
              <h3 className="cozy-widget-title">
                <Stethoscope size={18} color="#1b4e54" /> Plant Doctor Daily Tip
              </h3>

              <div
                className="cozy-doctor-tip-box"
                style={{
                  transform: tipFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
                  opacity: tipFlipping ? 0.3 : 1,
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <span className="cozy-doctor-badge">{activeTip.season}</span>
                <h4 className="cozy-doctor-tip-title">{activeTip.title}</h4>
                <p className="cozy-doctor-tip-text">{activeTip.text}</p>
                <button
                  type="button"
                  className="cozy-flip-tip-btn"
                  onClick={handleNextTip}
                >
                  <RefreshCw size={13} /> Next Practical Tip
                </button>
              </div>
            </div>

            {/* Widget 2: Popular Botanical Topics & Tags */}
            <div className="cozy-widget-card">
              <h3 className="cozy-widget-title">
                <Sparkles size={18} color="#1b4e54" /> Popular Topics
              </h3>
              <div className="cozy-tag-cloud">
                {POPULAR_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="cozy-tag-chip"
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Widget 3: Most Read Guides */}
            <div className="cozy-widget-card">
              <h3 className="cozy-widget-title">
                <Flame size={18} color="#ef4444" /> Most Read Articles
              </h3>
              <div className="cozy-sidebar-stories-list">
                {trendingBlogs.slice(0, 4).map((story) => (
                  <div
                    key={story.id}
                    className="cozy-sidebar-story-item"
                    onClick={() => navigate(`/blogs/${story.id}`)}
                  >
                    <img
                      src={story.image}
                      alt={story.title}
                      className="cozy-sidebar-story-img"
                    />
                    <div className="cozy-sidebar-story-content">
                      <h4 className="cozy-sidebar-story-title">{story.title}</h4>
                      <span className="cozy-sidebar-story-date">
                        {story.read_time} • {story.views.toLocaleString()} reads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* =====================================================================
            6. VIP BOTANICAL CLUB NEWSLETTER CASSETTE WITH LIVING LEAF BG
            ===================================================================== */}
        <section className="cozy-blog-newsletter-section">
          <div className="cozy-newsletter-banner">
            <div className="cozy-newsletter-bg" />
            <div className="cozy-newsletter-content">
              <span className="cozy-newsletter-badge">
                <Sparkles size={14} /> Join The Botanical Inner Circle
              </span>
              <h2 className="cozy-newsletter-title">
                {pageContent.newsletter.title}
              </h2>
              <p className="cozy-newsletter-desc">
                {pageContent.newsletter.subtitle}
              </p>

              {subscribed ? (
                <div
                  style={{
                    background: "rgba(167, 243, 208, 0.25)",
                    border: "1px solid #a7f3d0",
                    padding: "1rem 1.5rem",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    color: "#a7f3d0",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={20} />
                  <span>Welcome to the Botanical Circle! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="cozy-newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="cozy-newsletter-input"
                  />
                  <button type="submit" className="cozy-newsletter-btn">
                    Subscribe Free
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

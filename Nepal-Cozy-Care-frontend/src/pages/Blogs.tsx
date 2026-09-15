import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  Heart,
  Sparkles,
  X,
  CheckCircle2,
  Leaf,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { CURATED_BLOGS, type CuratedBlog } from "../features/blogs/curatedBlogs";
import { resolveImageUrl, handleImageError, DEFAULT_BLOG_IMAGE } from "../utils/imageUrl";
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

const INITIAL_DISPLAY_COUNT = 9;
const PAGE_SIZE = 6;

export default function Blogs() {
  const navigate = useNavigate();

  // Data states
  const [blogs, setBlogs] = useState<CuratedBlog[]>(CURATED_BLOGS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Stories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(INITIAL_DISPLAY_COUNT);
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("cozy_blog_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Dynamic Page Content (CMS)
  const [pageContent, setPageContent] = useState({
    hero_kicker: "Featured Editorial",
    newsletter_title: "Let's cultivate something great",
    newsletter_subtitle:
      "Join over 12,000+ plant lovers in Nepal receiving our weekly indoor care handbooks and seasonal botanical advice.",
  });

  // Fetch CMS dynamic content template if available
  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const res = await fetch(`${API}/api/content-templates/blogs_page`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.payload?.newsletter) {
            setPageContent((prev) => ({
              ...prev,
              newsletter_title: json.data.payload.newsletter.title || prev.newsletter_title,
              newsletter_subtitle: json.data.payload.newsletter.subtitle || prev.newsletter_subtitle,
            }));
          }
        }
      } catch {
        // Fallback to defaults
      }
    };

    void fetchPageContent();
  }, []);

  // Fetch backend blogs and merge with curated collection
  useEffect(() => {
    const fetchApiBlogs = async () => {
      try {
        const res = await fetch(`${API}/api/blogs?per_page=30`);
        const json = await res.json();
        const apiList = json.data?.blogs || json.data || [];
        if (Array.isArray(apiList) && apiList.length > 0) {
          const formattedApiBlogs: CuratedBlog[] = apiList.map((b: any, idx: number) => ({
            id: b.id,
            title: b.title,
            excerpt: b.excerpt || (b.content ? b.content.substring(0, 160) + "..." : ""),
            content: b.content || "",
            image: resolveImageUrl(
              b.image,
              CURATED_BLOGS[idx % CURATED_BLOGS.length].image
            ),
            author: b.author || "Cozy Care Botanist",
            author_role: "Care Specialist",
            author_image: resolveImageUrl(
              CURATED_BLOGS[idx % CURATED_BLOGS.length].author_image,
              "/images/team-sarah.jpg"
            ),
            category: b.category || "Indoor Plants",
            read_time: "5 min read",
            views: b.views || 1200 + idx * 150,
            published_at: b.published_at || b.created_at || new Date().toISOString(),
            is_featured: Boolean(b.is_top_trend || idx === 0),
            is_top_trend: Boolean(b.is_top_trend),
            tags: ["PlantCare", "Kathmandu", b.category || "Greenery"],
          }));

          const combined = [
            ...formattedApiBlogs,
            ...CURATED_BLOGS.filter((cb) => !formattedApiBlogs.some((ab) => ab.id === cb.id)),
          ];
          setBlogs(combined);
        }
      } catch {
        // Using curated fallback
      }
    };

    void fetchApiBlogs();
  }, []);

  // Filter blogs
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

  // Featured Hero Story (Untitled UI style)
  const featuredBlog = useMemo(() => {
    return blogs.find((b) => b.is_featured) || blogs[0];
  }, [blogs]);

  // Grid blogs (exclude featured from grid if on "All Stories" without search)
  const gridBlogs = useMemo(() => {
    if (selectedCategory === "All Stories" && !searchQuery && featuredBlog) {
      return filteredBlogs.filter((b) => b.id !== featuredBlog.id);
    }
    return filteredBlogs;
  }, [filteredBlogs, selectedCategory, searchQuery, featuredBlog]);

  const visibleBlogs = useMemo(() => {
    return gridBlogs.slice(0, displayCount);
  }, [gridBlogs, displayCount]);

  const hasMore = visibleBlogs.length < gridBlogs.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  };

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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <Layout>
      <div className="ublog-root">
        {/* =====================================================================
            1. FEATURED HERO BANNER (UNTITLED UI / EDITORIAL MASTER STYLE)
            ===================================================================== */}
        {featuredBlog && selectedCategory === "All Stories" && !searchQuery && (
          <section className="ublog-hero-section">
            <div
              className="ublog-hero-card"
              onClick={() => navigate(`/blogs/${featuredBlog.id}`)}
            >
              <img
                src={featuredBlog.image}
                alt={featuredBlog.title}
                className="ublog-hero-img"
                onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
              />
              <div className="ublog-hero-overlay" />

              <div className="ublog-hero-content">
                <div className="ublog-hero-badge">
                  <Leaf size={13} /> {pageContent.hero_kicker}
                </div>

                <h1 className="ublog-hero-title">{featuredBlog.title}</h1>
                <p className="ublog-hero-excerpt">{featuredBlog.excerpt}</p>

                <div className="ublog-hero-meta-row">
                  <div className="ublog-author-chip">
                    <img
                      src={featuredBlog.author_image}
                      alt={featuredBlog.author}
                      className="ublog-author-avatar"
                      onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
                    />
                    <div className="ublog-author-info">
                      <span className="ublog-author-name">{featuredBlog.author}</span>
                      <span className="ublog-author-sub">
                        {formatDate(featuredBlog.published_at)} • {featuredBlog.read_time}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="ublog-hero-arrow-btn"
                    aria-label="Read featured article"
                  >
                    <ArrowUpRight size={22} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            2. SECTION HEADER & CATEGORIES BAR
            ===================================================================== */}
        <section className="ublog-feed-header-section">
          <div className="ublog-feed-header-inner">
            <div className="ublog-title-area">
              <h2 className="ublog-section-title">Recent blog posts</h2>
              <p className="ublog-section-sub">
                Expert botanical wisdom, indoor care handbooks, and green living inspiration.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="ublog-search-wrapper">
              <Search size={16} className="ublog-search-icon" />
              <input
                type="text"
                placeholder="Search topics, species, or hacks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(INITIAL_DISPLAY_COUNT);
                }}
                className="ublog-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ublog-search-clear"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Category Pill Tabs */}
          <div className="ublog-category-nav">
            <div className="ublog-pills-scroll">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setDisplayCount(INITIAL_DISPLAY_COUNT);
                  }}
                  className={`ublog-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. MODERN 3-COLUMN ARTICLE GRID (UNTITLED UI STYLE)
            ===================================================================== */}
        <section className="ublog-grid-section">
          {gridBlogs.length === 0 ? (
            <div className="ublog-empty-state">
              <Leaf size={36} className="ublog-empty-icon" />
              <h3 className="ublog-empty-title">No articles found</h3>
              <p className="ublog-empty-sub">
                We couldn't find any guides matching "{searchQuery}". Try searching for another keyword.
              </p>
              <button
                type="button"
                className="ublog-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Stories");
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="ublog-grid">
              {visibleBlogs.map((blog) => {
                const isBookmarked = savedBookmarks.includes(blog.id);
                return (
                  <article
                    key={blog.id}
                    className="ublog-card"
                    onClick={() => navigate(`/blogs/${blog.id}`)}
                  >
                    <div className="ublog-card-media">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="ublog-card-img"
                        loading="lazy"
                        onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
                      />
                      <span className="ublog-card-tag">{blog.category}</span>
                      <button
                        type="button"
                        className={`ublog-card-bookmark ${isBookmarked ? "active" : ""}`}
                        onClick={(e) => handleToggleBookmark(e, blog.id)}
                        title={isBookmarked ? "Remove Bookmark" : "Save Guide"}
                      >
                        <Heart size={15} fill={isBookmarked ? "#ef4444" : "none"} />
                      </button>
                    </div>

                    <div className="ublog-card-body">
                      <div className="ublog-card-lead">
                        <span className="ublog-card-category-label">{blog.category}</span>
                        <div className="ublog-card-title-row">
                          <h3 className="ublog-card-title">{blog.title}</h3>
                          <ArrowUpRight size={18} className="ublog-card-arrow" />
                        </div>
                        <p className="ublog-card-excerpt">{blog.excerpt}</p>
                      </div>

                      <div className="ublog-card-author-row">
                        <img
                          src={blog.author_image}
                          alt={blog.author}
                          className="ublog-card-author-img"
                          onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
                        />
                        <div className="ublog-card-author-meta">
                          <span className="ublog-card-author-name">{blog.author}</span>
                          <span className="ublog-card-author-date">
                            {formatDate(blog.published_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="ublog-loadmore-wrapper">
              <button
                type="button"
                className="ublog-loadmore-btn"
                onClick={handleLoadMore}
              >
                Load more...
              </button>
            </div>
          )}
        </section>

        {/* =====================================================================
            4. MODERN DARK CALL-TO-ACTION BANNER (UNTITLED UI STYLE)
            ===================================================================== */}
        <section className="ublog-cta-section">
          <div className="ublog-cta-card">
            <div className="ublog-cta-content">
              <span className="ublog-cta-kicker">
                <Sparkles size={14} /> Botanical Community
              </span>
              <h2 className="ublog-cta-title">{pageContent.newsletter_title}</h2>
              <p className="ublog-cta-sub">{pageContent.newsletter_subtitle}</p>

              {subscribed ? (
                <div className="ublog-subscribed-chip">
                  <CheckCircle2 size={18} />
                  <span>You're in! Watch your inbox for weekly plant care secrets.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="ublog-cta-form">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="ublog-cta-input"
                  />
                  <button type="submit" className="ublog-cta-btn">
                    Subscribe
                  </button>
                </form>
              )}

              <div className="ublog-cta-actions">
                <button
                  type="button"
                  className="ublog-cta-link-btn"
                  onClick={() => navigate("/plants")}
                >
                  Explore Plant Shop
                </button>
                <button
                  type="button"
                  className="ublog-cta-link-btn secondary"
                  onClick={() => navigate("/care-tips")}
                >
                  View Care Tips
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

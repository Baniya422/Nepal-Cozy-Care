import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import { CURATED_BLOGS, type CuratedBlog } from "../features/blogs/curatedBlogs";
import { resolveImageUrl, handleImageError, DEFAULT_BLOG_IMAGE } from "../utils/imageUrl";
import "../styles/blogs.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const CATEGORIES = [
  "All",
  "Care Guide",
  "Growing Tips",
  "Pots & Planters",
  "Indoor Plants",
  "Seasonal Care",
  "DIY & Propagation",
  "Plant Doctor",
  "Soil & Propagation",
  "Urban Living & Decor",
  "Seasonal Advice",
];

const INITIAL_DISPLAY_COUNT = 12;
const PAGE_SIZE = 6;

// ── Read Progress Bar ──────────────────────────────────────────────────────────
function ReadProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const fn = () => {
      const d = document.documentElement;
      setW((d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div className="blog-read-progress" style={{ width: `${w}%` }} />;
}

// ── Scroll reveal hook ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".bj-reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ── Magnetic Button ────────────────────────────────────────────────────────────
function MagBtn({ children, className, style, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const move = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.28;
    const y = (e.clientY - r.top  - r.height / 2) * 0.28;
    el.style.transform = `translate(${x}px,${y}px)`;
  }, []);
  const leave = useCallback(() => { if (ref.current) ref.current.style.transform = ""; }, []);
  return (
    <button
      ref={ref}
      className={className}
      style={{ transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)", ...style }}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={onClick}
      data-hover=""
    >
      {children}
    </button>
  );
}

// ── Wide Card ─────────────────────────────────────────────────────────────────
function WideCard({ blog, onClick }: { blog: CuratedBlog; onClick: () => void }) {
  return (
    <div className="bj-wide-card bj-reveal" onClick={onClick}>
      <div className="bj-wide-card-img-wrap">
        <img
          src={blog.image} alt={blog.title}
          className="bj-wide-card-img"
          onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
          loading="lazy"
        />
        <div className="bj-wide-card-hover-overlay" />
        <span className="bj-card-tag-pill">{blog.category}</span>
      </div>
      <div className="bj-wide-card-body">
        <div className="bj-card-cat">{blog.category}</div>
        <h3 className="bj-card-title">{blog.title}</h3>
        <p className="bj-card-excerpt">{blog.excerpt}</p>
        <div className="bj-card-author-row">
          <div className="bj-card-author">
            <img
              src={blog.author_image} alt={blog.author}
              className="bj-card-author-img"
              onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
            />
            <span className="bj-card-author-name">{blog.author}</span>
          </div>
          <span className="bj-card-readtime">{blog.read_time}</span>
        </div>
      </div>
    </div>
  );
}

// ── Small Card ────────────────────────────────────────────────────────────────
function SmallCard({ blog, delay, onClick }: { blog: CuratedBlog; delay: number; onClick: () => void }) {
  return (
    <div className="bj-small-card bj-reveal" style={{ animationDelay: `${delay}s`, flex: 1 }} onClick={onClick}>
      <div className="bj-small-card-img-wrap">
        <img
          src={blog.image} alt={blog.title}
          className="bj-small-card-img"
          onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
          loading="lazy"
        />
      </div>
      <div className="bj-small-card-body">
        <div>
          <div className="bj-card-cat">{blog.category}</div>
          <h3 className="bj-small-card-title">{blog.title}</h3>
          {blog.excerpt && <p className="bj-small-card-excerpt">{blog.excerpt}</p>}
        </div>
        <div className="bj-small-card-meta">
          {new Date(blog.published_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })} · {blog.read_time}
        </div>
      </div>
    </div>
  );
}

// ── Standard Card ─────────────────────────────────────────────────────────────
function StandardCard({
  blog, delay, onClick, isBookmarked, onBookmark,
}: {
  blog: CuratedBlog; delay: number; onClick: () => void;
  isBookmarked: boolean; onBookmark: (e: React.MouseEvent) => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div
      className="bj-tilt bj-reveal"
      style={{ animationDelay: `${delay}s`, cursor: "pointer" }}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 8, y: ((e.clientY - r.top) / r.height - 0.5) * -8 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className="bj-standard-card"
        style={{ transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
      >
        <div className="bj-standard-card-img-wrap">
          <img
            src={blog.image} alt={blog.title}
            className="bj-standard-card-img"
            onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
            loading="lazy"
          />
          <span className="bj-card-tag-pill" style={{ top: 12, left: 12 }}>{blog.category}</span>
          <button
            className={`bj-bookmark${isBookmarked ? " active" : ""}`}
            style={{ position: "absolute", top: 10, right: 10 }}
            onClick={onBookmark}
            title={isBookmarked ? "Remove bookmark" : "Save"}
          >
            <Heart size={15} fill={isBookmarked ? "#ef4444" : "none"} />
          </button>
        </div>
        <div className="bj-standard-card-body">
          <div className="bj-card-cat">{blog.category}</div>
          <h3 className="bj-standard-card-title">{blog.title}</h3>
          <p className="bj-standard-card-excerpt">{blog.excerpt}</p>
          <div className="bj-standard-card-footer">
            <div className="bj-card-author">
              <img
                src={blog.author_image} alt={blog.author}
                className="bj-card-author-img"
                onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
              />
              <span className="bj-card-author-name">{blog.author}</span>
            </div>
            <span className="bj-card-readtime">{blog.read_time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Blogs() {
  const navigate = useNavigate();
  useReveal();

  const [blogs, setBlogs]               = useState<CuratedBlog[]>(CURATED_BLOGS);
  const [cat,   setCat]                 = useState("All");
  const [search, setSearch]             = useState("");
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [heroY,  setHeroY]              = useState(0);
  const [mouseX, setMouseX]             = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed]     = useState(false);
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>(() => {
    try { const s = localStorage.getItem("cozy_blog_bookmarks"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Parallax hero scroll + mouse
  useEffect(() => {
    const onScroll = () => setHeroY(window.scrollY * 0.5);
    const onMouse  = (e: MouseEvent) => setMouseX((e.clientX / window.innerWidth - 0.5) * 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  // Fetch from backend
  useEffect(() => {
    const fetchApiBlogs = async () => {
      try {
        const res  = await fetch(`${API}/api/blogs?per_page=30`);
        const json = await res.json();
        const apiList = json.data?.blogs || json.data || [];
        if (Array.isArray(apiList) && apiList.length > 0) {
          const formatted: CuratedBlog[] = apiList.map((b: any, idx: number) => ({
            id: b.id,
            title: b.title,
            excerpt: b.excerpt || (b.content ? b.content.substring(0, 160) + "..." : ""),
            content: b.content || "",
            image: resolveImageUrl(b.image, CURATED_BLOGS[idx % CURATED_BLOGS.length].image),
            author: b.author || "Cozy Care Botanist",
            author_role: "Care Specialist",
            author_image: resolveImageUrl(CURATED_BLOGS[idx % CURATED_BLOGS.length].author_image, "/images/team-sarah.jpg"),
            category: b.category || "Indoor Plants",
            read_time: "5 min read",
            views: b.views || 0,
            published_at: b.published_at || b.created_at || new Date().toISOString(),
            is_featured: Boolean(b.is_top_story),
            is_top_trend: Boolean(b.is_top_trend),
            tags: ["PlantCare", "Kathmandu", b.category || "Greenery"],
          }));
          const combined = [...formatted, ...CURATED_BLOGS.filter((cb) => !formatted.some((ab) => ab.id === cb.id))];
          setBlogs(combined);
        }
      } catch { /* fallback */ }
    };
    void fetchApiBlogs();
  }, []);

  // Only show hero for explicitly featured blogs — no fallback to blogs[0]
  const featured = useMemo(() => blogs.find((b) => b.is_featured) ?? null, [blogs]);

  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const mc = cat === "All" || b.category?.toLowerCase() === cat.toLowerCase();
      const ms = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
      return mc && ms;
    });
  }, [blogs, cat, search]);

  // exclude featured from rest when on "All" without search
  const rest = useMemo(() => {
    if (cat === "All" && !search && featured) return filtered.filter((b) => b.id !== featured.id);
    return filtered;
  }, [filtered, cat, search, featured]);

  // Ensure that grid rows are complete before showing "Load More"
  // Top split section uses up to 3 articles (1 wide + 2 small)
  // Grid below uses 3 columns per row on desktop
  const { visible, hasMore } = useMemo(() => {
    const total = rest.length;
    if (total <= 3) {
      return { visible: rest, hasMore: false };
    }

    const availableForGrid = total - 3;
    const targetGridCount = Math.max(0, displayCount - 3);

    // If remaining articles after target is small (<= 2), show all to fill the row
    if (availableForGrid <= targetGridCount + 2) {
      return { visible: rest, hasMore: false };
    }

    // Otherwise, ensure grid count is a clean multiple of 3 so every row is full
    const fullGridCount = Math.max(3, Math.floor(targetGridCount / 3) * 3);
    const visibleCount = Math.min(total, 3 + fullGridCount);

    return {
      visible: rest.slice(0, visibleCount),
      hasMore: visibleCount < total,
    };
  }, [rest, displayCount]);

  const handleToggleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSavedBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id];
      try { localStorage.setItem("cozy_blog_bookmarks", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  const goToBlog = (blog: CuratedBlog) => navigate(`/blogs/${blog.id}`);

  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  return (
    <Layout>
      <div className="blog-journal">
        <ReadProgress />

        {/* ─────────────────────────────────────────────────────────────────
            1. CINEMATIC FULLSCREEN HERO
        ───────────────────────────────────────────────────────────────── */}
        {featured && cat === "All" && !search && (
          <section className="bj-hero">
            {/* Parallax background with fallback */}
            <img
              src={resolveImageUrl(featured.image, DEFAULT_BLOG_IMAGE)}
              alt={featured.title}
              className="bj-hero-bg"
              onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
              style={{
                transform: `translateY(${heroY}px) translateX(${mouseX * 0.3}px)`,
              }}
            />
            <div className="bj-hero-overlay-1" />
            <div className="bj-hero-overlay-2" />

            {/* Hero text */}
            <div className="bj-hero-content">
              <div className="bj-hero-eyebrow bj-fade-up" style={{ animationDelay: ".1s" }}>
                <div className="bj-hero-line" />
                <span className="bj-hero-label">Featured Story</span>
                <span className="bj-hero-date">· {currentMonth} 2026</span>
              </div>

              <h1 className="bj-hero-title bj-fade-up" style={{ animationDelay: ".2s" }}>
                {featured.title}
              </h1>

              <p className="bj-hero-excerpt bj-fade-up" style={{ animationDelay: ".3s" }}>
                {featured.excerpt}
              </p>

              <div className="bj-hero-meta bj-fade-up" style={{ animationDelay: ".4s" }}>
                <div className="bj-hero-author">
                  <img
                    src={featured.author_image} alt={featured.author}
                    className="bj-hero-avatar"
                    onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
                  />
                  <div>
                    <div className="bj-hero-author-name">{featured.author}</div>
                    <div className="bj-hero-author-meta">{featured.read_time}</div>
                  </div>
                </div>

                <MagBtn
                  className="bj-hero-btn"
                  onClick={() => goToBlog(featured)}
                >
                  Read Article →
                </MagBtn>
              </div>
            </div>

            {/* Scroll cue */}
            <div className="bj-hero-scroll bj-fade-in" style={{ animationDelay: "1s" }}>
              <span className="bj-hero-scroll-label">Scroll</span>
              <div className="bj-hero-scroll-line" />
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            2. SECTION HEADER + SEARCH + CATEGORY PILLS
        ───────────────────────────────────────────────────────────────── */}
        <section className="bj-section-header">
          <div className="bj-section-top bj-reveal">
            <div>
              <div className="bj-section-eyebrow">
                <div className="bj-section-eyebrow-line" />
                <span className="bj-section-eyebrow-label">The Journal</span>
              </div>
              <h2 className="bj-section-title">
                Stories from the<br />
                <em>Green World</em>
              </h2>
            </div>

            {/* Search */}
            <div className="bj-search-wrap">
              <span className="bj-search-icon">⌕</span>
              <input
                className="bj-search-input"
                placeholder="Search topics, species, or hacks…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setDisplayCount(INITIAL_DISPLAY_COUNT); }}
              />
              {search && (
                <button className="bj-search-clear" onClick={() => setSearch("")} title="Clear">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="bj-pills bj-reveal">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`bj-pill${cat === c ? " active" : ""}`}
                onClick={() => { setCat(c); setDisplayCount(INITIAL_DISPLAY_COUNT); }}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            3. ASYMMETRIC EDITORIAL GRID
        ───────────────────────────────────────────────────────────────── */}
        <section className="bj-grid-section">
          {rest.length === 0 ? (
            <div className="bj-empty">
              <div className="bj-empty-icon">🌱</div>
              <div className="bj-empty-title">No articles found</div>
              <div className="bj-empty-sub">
                {search ? `No guides matching "${search}". Try another keyword.` : "No articles in this category yet."}
              </div>
              <button className="bj-empty-reset" onClick={() => { setSearch(""); setCat("All"); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Row 1: Wide card + 2 stacked small cards */}
              {visible.length > 0 && (
                <div className={`bj-top-split-row${visible.length < 2 ? " single-item" : ""}`}>
                  {visible[0] && <WideCard blog={visible[0]} onClick={() => goToBlog(visible[0])} />}
                  {visible.slice(1, 3).length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {visible.slice(1, 3).map((b, i) => (
                        <SmallCard key={b.id} blog={b} delay={i * 0.08} onClick={() => goToBlog(b)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Remaining 3-column grid */}
              {visible.length > 3 && (
                <div className="bj-articles-grid">
                  {visible.slice(3).map((b, i) => (
                    <StandardCard
                      key={b.id} blog={b} delay={i * 0.06}
                      onClick={() => goToBlog(b)}
                      isBookmarked={savedBookmarks.includes(b.id)}
                      onBookmark={(e) => handleToggleBookmark(e, b.id)}
                    />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasMore && (
                <div className="bj-loadmore-wrap">
                  <button className="bj-loadmore" onClick={() => setDisplayCount((p) => p + PAGE_SIZE)}>
                    Load more articles
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            4. NEWSLETTER CTA
        ───────────────────────────────────────────────────────────────── */}
        <section className="bj-newsletter">
          <div className="bj-newsletter-card bj-reveal">
            <div className="bj-newsletter-blob1" />
            <div className="bj-newsletter-blob2" />

            <div className="bj-newsletter-text">
              <div className="bj-newsletter-kicker">Green in your inbox</div>
              <h2 className="bj-newsletter-title">Join 12,000+ plant lovers</h2>
              <p className="bj-newsletter-sub">
                Weekly care tips, seasonal guides &amp; new arrivals from the heart of Nepal.
              </p>
            </div>

            <div className="bj-newsletter-form-wrap">
              {subscribed ? (
                <div className="bj-newsletter-success">🌱 Welcome to the family!</div>
              ) : (
                <form className="bj-newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    className="bj-newsletter-input"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="bj-newsletter-btn">
                    Subscribe →
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

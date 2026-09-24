import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { ArrowLeft, Share2, Check, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { CURATED_BLOGS, type CuratedBlog } from "../features/blogs/curatedBlogs";
import { resolveImageUrl, handleImageError, DEFAULT_BLOG_IMAGE } from "../utils/imageUrl";
import SEO from "../components/common/SEO";
import "../styles/blogDetail.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type RelatedBlogApi = {
  id: number; title: string; excerpt?: string | null; content?: string | null;
  image?: string | null; author?: string | null; category?: string | null;
  views?: number | null; published_at?: string | null;
};

// ── Inline markdown renderer ──────────────────────────────────────────────────
const renderInline = (text: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")  && part.endsWith("*"))  return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".art-reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ── Reading Progress ──────────────────────────────────────────────────────────
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
  return <div className="art-progress" style={{ width: `${w}%` }} />;
}

// ── Toc sidebar (table of contents) ──────────────────────────────────────────
function TableOfContents({ sections }: { sections: string[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const hs = document.querySelectorAll(".art-section-anchor");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx || 0));
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    hs.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;
  return (
    <nav
      className="art-toc art-reveal"
      style={{
        position: "sticky", top: 120,
        width: 220, flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 6,
        padding: "20px 0",
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".18em", color: "var(--muted-fg)", textTransform: "uppercase", marginBottom: 12 }}>
        In this article
      </div>
      {sections.map((s, i) => (
        <button
          key={i}
          onClick={() => {
            document.querySelector(`.art-section-anchor[data-idx="${i}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          style={{
            textAlign: "left", background: "none", border: "none", cursor: "pointer",
            padding: "5px 0 5px 14px",
            borderLeft: `2px solid ${active === i ? "var(--accent)" : "var(--border)"}`,
            fontFamily: "var(--font-body)", fontSize: 13,
            color: active === i ? "var(--fg)" : "var(--muted-fg)",
            fontWeight: active === i ? 600 : 400,
            transition: "all .2s",
            lineHeight: 1.4,
          }}
        >
          {s}
        </button>
      ))}
    </nav>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BlogDetail() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  useReveal();

  const [blog,         setBlog]         = useState<CuratedBlog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<CuratedBlog[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [copied,       setCopied]       = useState(false);
  const [heroY,        setHeroY]        = useState(0);
  const [lightboxImg,  setLightboxImg]  = useState<string | null>(null);

  // Parallax
  useEffect(() => {
    const fn = () => setHeroY(window.scrollY * 0.42);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Fetch
  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchArticle = async () => {
      setLoading(true);
      const numericId  = Number(id);
      const foundCurated = CURATED_BLOGS.find((b) => b.id === numericId);

      try {
        const res  = await fetch(`${API}/api/blogs/${id}`);
        if (res.ok) {
          const data   = await res.json();
          const apiBlog = data.data?.blog;
          if (apiBlog) {
            setBlog({
              id: apiBlog.id, title: apiBlog.title,
              excerpt:  apiBlog.excerpt || "",
              content:  apiBlog.content || "",
              image:    resolveImageUrl(apiBlog.image || foundCurated?.image, DEFAULT_BLOG_IMAGE),
              author:   apiBlog.author || foundCurated?.author || "Cozy Care Botanist",
              author_role:  foundCurated?.author_role  || "Senior Botanist",
              author_image: resolveImageUrl(foundCurated?.author_image, "/images/team-sarah.jpg"),
              category:   apiBlog.category || foundCurated?.category || "Indoor Plants",
              read_time:  foundCurated?.read_time || "5 min read",
              views:      apiBlog.views   || foundCurated?.views || 1840,
              published_at: apiBlog.published_at || apiBlog.created_at || "2026-09-08",
              tags:       foundCurated?.tags || ["PlantCare", "Kathmandu"],
              tips:       foundCurated?.tips || ["Always check root moisture before watering.", "Provide bright, gentle indirect sunlight."],
              takeaways:  foundCurated?.takeaways || ["Consistency in care yields thriving plants.", "Aerated soil prevents root decay."],
            });
            const apiRelated = data.data?.related_blogs || [];
            setRelatedBlogs(
              apiRelated.length > 0
                ? apiRelated.map((rb: RelatedBlogApi) => ({
                    id: rb.id, title: rb.title, excerpt: rb.excerpt || "",
                    content: rb.content || "",
                    image:   resolveImageUrl(rb.image, "/images/blog-leaf-macro.jpg"),
                    author:  rb.author || "Cozy Care Team", author_role: "Care Specialist",
                    author_image: "/images/team-emily.jpg",
                    category: rb.category || "Care Tips", read_time: "4 min read",
                    views: rb.views || 920, published_at: rb.published_at || "2026-09-01",
                    tags: ["IndoorPlants"],
                  }))
                : CURATED_BLOGS.filter((b) => b.id !== numericId).slice(0, 3)
            );
            setLoading(false); return;
          }
        }
      } catch { /* fallback */ }

      if (foundCurated) { setBlog(foundCurated); setRelatedBlogs(CURATED_BLOGS.filter((b) => b.id !== numericId).slice(0, 3)); }
      else               { setBlog(CURATED_BLOGS[0]); setRelatedBlogs(CURATED_BLOGS.slice(1, 4)); }
      setLoading(false);
    };

    void fetchArticle();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };
  const handleShare = (platform: string) => {
    const url  = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || "");
    const urls: Record<string, string> = {
      "Twitter / X": `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "Facebook":    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "Copy Link":   "__copy__",
    };
    if (urls[platform] === "__copy__") { handleCopy(); return; }
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  // ── Loading ──
  if (loading) {
    return (
      <Layout>
        <div className="art-loading">
          <div className="art-loading-spinner" />
          <span className="art-loading-text">Loading article…</span>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div style={{ padding: "6rem 2rem", textAlign: "center", color: "var(--muted-fg)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.8rem", marginBottom: 8 }}>Article Not Found</h2>
          <p style={{ marginBottom: 24 }}>We couldn't find this article in the journal.</p>
          <button onClick={() => navigate("/blogs")} style={{ padding: "11px 28px", borderRadius: 100, background: "var(--primary)", color: "#f7f4ef", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
            ← Return to Journal
          </button>
        </div>
      </Layout>
    );
  }

  // Parse content into sections
  const rawParagraphs = blog.content
    ? blog.content.split("\n\n").filter((p) => p.trim().length > 0)
    : [];

  // Build named sections from headings
  type Section = { heading: string | null; paras: string[] };
  const sections: Section[] = [];
  let current: Section = { heading: null, paras: [] };
  for (const para of rawParagraphs) {
    if (para.startsWith("### ") || para.startsWith("## ")) {
      if (current.paras.length > 0 || current.heading) sections.push(current);
      current = { heading: para.replace(/^##+ /, ""), paras: [] };
    } else {
      current.paras.push(para);
    }
  }
  if (current.paras.length > 0 || current.heading) sections.push(current);

  // TOC headings
  const tocHeadings = sections.filter((s) => s.heading).map((s) => s.heading!);

  // First para intro
  const introSection  = sections[0];
  const bodySections  = sections.slice(1);

  const publishedDate = new Date(blog.published_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <Layout>
      <SEO
        title={blog.title}
        description={blog.excerpt || blog.content?.slice(0, 160)}
        canonicalPath={`/blogs/${blog.id}`}
        image={blog.image || undefined}
        type="article"
      />

      <div className="art-root">
        <ReadProgress />

        {/* ───────────────────────────────────────────────────────────────
            1. CINEMATIC PARALLAX HERO
        ─────────────────────────────────────────────────────────────── */}
        <header className="art-hero">
          <div
            className="art-hero-bg"
            style={{ backgroundImage: `url(${blog.image})`, transform: `translateY(${heroY}px)` }}
          />
          <div className="art-hero-ov1" />
          <div className="art-hero-ov2" />

          <div className="art-hero-content">
            {/* Back */}
            <button className="art-back-btn" onClick={() => navigate("/blogs")}>
              <ArrowLeft size={14} /> Back to Journal
            </button>

            {/* Badges */}
            <div className="art-hero-badges">
              <span className="art-badge-cat">{blog.category}</span>
              <span className="art-badge-meta">{blog.read_time}</span>
              <span className="art-badge-meta">{blog.views.toLocaleString()} reads</span>
            </div>

            {/* Title */}
            <h1 className="art-hero-title">{blog.title}</h1>

            {/* Author + share */}
            <div className="art-hero-author-row">
              <div className="art-hero-author">
                <img
                  src={blog.author_image} alt={blog.author}
                  className="art-hero-avatar"
                  onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
                />
                <div>
                  <div className="art-hero-author-name">{blog.author}</div>
                  <div className="art-hero-author-date">{publishedDate}</div>
                </div>
              </div>
              <div className="art-hero-divider" />
              <span className="art-hero-readtime">{blog.read_time} read</span>
              <button
                className={`art-share-btn${copied ? " copied" : ""}`}
                onClick={handleCopy}
                title="Copy link"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────────
            2. ARTICLE BODY — two column layout on wide screens
        ─────────────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(24px,4vw,40px)", display: "flex", gap: 64, alignItems: "flex-start" }}>

          {/* Table of contents (sticky sidebar) */}
          <TableOfContents sections={tocHeadings} />

          {/* Main prose */}
          <div className="art-body" style={{ flex: 1, minWidth: 0, padding: "clamp(52px,8vw,80px) 0" }}>

            {/* Intro with drop cap */}
            {introSection && introSection.paras.length > 0 && (
              <p className="art-intro art-drop-cap art-reveal">
                {introSection.paras.join(" ")}
              </p>
            )}

            {/* Sections */}
            {bodySections.map((sec, i) => (
              <div
                key={i}
                className="art-section art-reveal"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Anchor for TOC / IntersectionObserver */}
                <span className="art-section-anchor" data-idx={i} style={{ display: "block", height: 0 }} />

                {sec.heading && (
                  <div className="art-section-head">
                    <div className="art-section-num">{String(i + 1).padStart(2, "0")}</div>
                    <h2 className="art-section-title">{sec.heading}</h2>
                  </div>
                )}

                {/* Inline image for first section */}
                {i === 0 && (
                  <div className="art-section-img-wrap">
                    <button
                      style={{ all: "unset", cursor: "zoom-in", display: "block", width: "100%" }}
                      onClick={() => setLightboxImg(blog.image)}
                    >
                      <img
                        src={blog.image} alt={blog.title}
                        className="art-section-img"
                        onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
                        loading="lazy"
                      />
                    </button>
                  </div>
                )}

                {sec.paras.map((para, j) => {
                  if (para.startsWith("> ")) {
                    return (
                      <blockquote key={j} className="art-pullquote">
                        <p>{renderInline(para.replace(/^> /, "").replace(/"/g, ""))}</p>
                      </blockquote>
                    );
                  }
                  const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
                  if (lines.every((l) => /^\d+\.\s/.test(l))) {
                    return (
                      <ol key={j} style={{ paddingLeft: 24, margin: "0 0 18px", lineHeight: 1.85 }}>
                        {lines.map((l, li) => <li key={li} style={{ fontSize: 17, color: "var(--fg)", marginBottom: 6, opacity: .9 }}>{renderInline(l.replace(/^\d+\.\s*/, ""))}</li>)}
                      </ol>
                    );
                  }
                  if (lines.every((l) => /^[-*]\s/.test(l))) {
                    return (
                      <ul key={j} style={{ paddingLeft: 24, margin: "0 0 18px", lineHeight: 1.85 }}>
                        {lines.map((l, li) => <li key={li} style={{ fontSize: 17, color: "var(--fg)", marginBottom: 6, opacity: .9 }}>{renderInline(l.replace(/^[-*]\s*/, ""))}</li>)}
                      </ul>
                    );
                  }
                  return (
                    <p key={j} className="art-section-para">{renderInline(para)}</p>
                  );
                })}

                {/* Pull quote after section 1 */}
                {i === 0 && blog.excerpt && (
                  <blockquote className="art-pullquote">
                    <p>{blog.excerpt}</p>
                  </blockquote>
                )}
              </div>
            ))}

            {/* Tips / takeaways box */}
            {((blog.tips && blog.tips.length > 0) || (blog.takeaways && blog.takeaways.length > 0)) && (
              <div className="art-tip-box art-reveal">
                <div className="art-tip-inner">
                  <div className="art-tip-icon">🌱</div>
                  <div>
                    <div className="art-tip-label">Grower's Tip</div>
                    {blog.tips?.map((tip, i) => (
                      <p key={i} className="art-tip-text">{tip}</p>
                    ))}
                    {blog.takeaways && blog.takeaways.length > 0 && (
                      <>
                        <div className="art-tip-label" style={{ marginTop: 16 }}>Key Takeaways</div>
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {blog.takeaways.map((t, i) => (
                            <li key={i} className="art-tip-text" style={{ marginBottom: 4 }}>{t}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="art-divider art-reveal">
              <div className="art-divider-line" />
              <span className="art-divider-icon">🌿</span>
              <div className="art-divider-line" />
            </div>

            {/* Author card */}
            <div className="art-author-card art-reveal">
              <img
                src={blog.author_image} alt={blog.author}
                className="art-author-card-img"
                onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
              />
              <div>
                <div className="art-author-card-label">Written by</div>
                <div className="art-author-card-name">{blog.author}</div>
                <div className="art-author-card-bio">
                  Plant enthusiast &amp; contributor at Nepal Cozy Care. Sharing care wisdom rooted in the
                  Himalayan landscape, one leaf at a time.
                </div>
              </div>
            </div>

            {/* Share row */}
            <div className="art-share-row art-reveal">
              <span className="art-share-label">Share this story</span>
              {["Twitter / X", "Facebook", "Copy Link"].map((s) => (
                <button key={s} className="art-share-chip" onClick={() => handleShare(s)}>
                  {s === "Copy Link" && copied ? "✓ Copied!" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────
            3. RELATED ARTICLES
        ─────────────────────────────────────────────────────────────── */}
        {relatedBlogs.length > 0 && (
          <section className="art-related">
            <div className="art-related-inner">
              <div className="art-related-eyebrow art-reveal">
                <div className="art-related-line" />
                <span className="art-related-label">Keep Reading</span>
                <div className="art-related-divider" />
              </div>

              <div className="art-related-grid">
                {relatedBlogs.map((rel, i) => (
                  <div
                    key={rel.id}
                    className="art-rel-card art-reveal"
                    style={{ animationDelay: `${i * 0.07}s` }}
                    onClick={() => { navigate(`/blogs/${rel.id}`); window.scrollTo({ top: 0 }); }}
                  >
                    <div className="art-rel-img-wrap">
                      <img
                        src={rel.image} alt={rel.title}
                        className="art-rel-img"
                        onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
                        loading="lazy"
                      />
                      <span className="art-rel-img-tag">{rel.category}</span>
                    </div>
                    <div className="art-rel-body">
                      <div className="art-rel-cat">{rel.category}</div>
                      <h3 className="art-rel-title">{rel.title}</h3>
                      <p className="art-rel-excerpt">{rel.excerpt}</p>
                      <div className="art-rel-meta">
                        <img
                          src={rel.author_image} alt={rel.author}
                          className="art-rel-author-img"
                          onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
                        />
                        <span>{rel.author}</span>
                        <span>·</span>
                        <span>{rel.read_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────────────────────────
            4. LIGHTBOX
        ─────────────────────────────────────────────────────────────── */}
        {lightboxImg && (
          <div className="art-lightbox" onClick={() => setLightboxImg(null)}>
            <img src={lightboxImg} alt="Enlarged view" onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)} />
          </div>
        )}
      </div>
    </Layout>
  );
}

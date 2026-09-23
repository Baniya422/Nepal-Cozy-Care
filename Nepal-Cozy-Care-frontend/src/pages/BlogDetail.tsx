import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Clock,
  Share2,
  Check,
  Stethoscope,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { CURATED_BLOGS, type CuratedBlog } from "../features/blogs/curatedBlogs";
import { resolveImageUrl, handleImageError, DEFAULT_BLOG_IMAGE } from "../utils/imageUrl";
import SEO from "../components/common/SEO";
import "../styles/blogDetail.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type RelatedBlogApi = {
  id: number;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  author?: string | null;
  category?: string | null;
  views?: number | null;
  published_at?: string | null;
};

const renderInlineFormatting = (text: string): ReactNode[] =>
  text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
      }

      return part;
    });

export default function BlogDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [blog, setBlog] = useState<CuratedBlog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<CuratedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Scroll reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setScrollPercent(percent);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch article data
  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchArticle = async () => {
      setLoading(true);

      // Check if it's one of our curated articles first
      const numericId = Number(id);
      const foundCurated = CURATED_BLOGS.find((b) => b.id === numericId);

      try {
        const res = await fetch(`${API}/api/blogs/${id}`);
        if (res.ok) {
          const data = await res.json();
          const apiBlog = data.data?.blog;
          if (apiBlog) {
            setBlog({
              id: apiBlog.id,
              title: apiBlog.title,
              excerpt: apiBlog.excerpt || "",
              content: apiBlog.content || "",
              image: resolveImageUrl(
                apiBlog.image || foundCurated?.image,
                DEFAULT_BLOG_IMAGE
              ),
              author: apiBlog.author || foundCurated?.author || "Sarah Johnson",
              author_role: foundCurated?.author_role || "Senior Botanist",
              author_image: resolveImageUrl(
                foundCurated?.author_image,
                "/images/team-sarah.jpg"
              ),
              category: apiBlog.category || foundCurated?.category || "Indoor Plants",
              read_time: foundCurated?.read_time || "5 min read",
              views: apiBlog.views || foundCurated?.views || 1840,
              published_at: apiBlog.published_at || apiBlog.created_at || "2026-09-08",
              tags: foundCurated?.tags || ["PlantCare", "Kathmandu", apiBlog.category || "Houseplants"],
              tips: foundCurated?.tips || [
                "Always check root moisture before watering.",
                "Provide bright, gentle indirect sunlight.",
              ],
              takeaways: foundCurated?.takeaways || [
                "Consistency in care yields thriving plants.",
                "Aerated soil prevents root decay.",
              ],
            });

            // Related blogs
            const apiRelated = data.data?.related_blogs || [];
            if (apiRelated.length > 0) {
              setRelatedBlogs(
                apiRelated.map((rb: RelatedBlogApi) => ({
                  id: rb.id,
                  title: rb.title,
                  excerpt: rb.excerpt || "",
                  content: rb.content || "",
                  image: resolveImageUrl(rb.image, "/images/blog-leaf-macro.jpg"),
                  author: rb.author || "Cozy Care Team",
                  author_role: "Care Specialist",
                  author_image: "/images/team-emily.jpg",
                  category: rb.category || "Care Tips",
                  read_time: "4 min read",
                  views: rb.views || 920,
                  published_at: rb.published_at || "2026-09-01",
                  tags: ["IndoorPlants"],
                }))
              );
            } else {
              setRelatedBlogs(CURATED_BLOGS.filter((b) => b.id !== numericId).slice(0, 3));
            }
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Using curated fallback article:", err);
      }

      // If not from API or API failed, use curated
      if (foundCurated) {
        setBlog(foundCurated);
        setRelatedBlogs(CURATED_BLOGS.filter((b) => b.id !== numericId).slice(0, 3));
      } else {
        // Default to first curated blog if ID unknown
        setBlog(CURATED_BLOGS[0]);
        setRelatedBlogs(CURATED_BLOGS.slice(1, 4));
      }
      setLoading(false);
    };

    void fetchArticle();
  }, [id]);

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#64748b" }}>
            <Sparkles size={32} color="#1b4e54" style={{ animation: "spin 2s linear infinite" }} />
            <p style={{ marginTop: "1rem", fontSize: "1rem", fontWeight: 600 }}>Loading Botanical Article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div style={{ padding: "6rem 2rem", textAlign: "center" }}>
          <BookOpen size={48} color="#94a3b8" />
          <h2 style={{ margin: "1rem 0 0.5rem" }}>Article Not Found</h2>
          <p style={{ color: "#64748b" }}>We couldn't locate this publication in the library.</p>
          <button
            type="button"
            className="cozy-spotlight-read-btn"
            onClick={() => navigate("/blogs")}
            style={{ marginTop: "1.5rem" }}
          >
            Return to Botanical Journal
          </button>
        </div>
      </Layout>
    );
  }

  // Split content paragraphs for rich editorial presentation
  const paragraphs = blog.content
    ? blog.content.split("\n\n").filter((p) => p.trim().length > 0)
    : [];

  return (
    <Layout>
      <SEO
        title={blog.title}
        description={blog.excerpt || (blog.content ? blog.content.slice(0, 160) : undefined)}
        canonicalPath={`/blogs/${blog.id}`}
        image={blog.image || undefined}
        type="article"
      />
      {/* Pinned Scroll Reading Progress Bar */}
      <div className="cozy-read-progress-bar" style={{ width: `${scrollPercent}%` }} />

      <div className="cozy-article-page">
        {/* =====================================================================
            1. ARTICLE HERO HEADER WITH ATMOSPHERIC BACKGROUND
            ===================================================================== */}
        <header className="cozy-article-hero">
          <div
            className="cozy-article-hero-bg"
            style={{ backgroundImage: `url(${blog.image})` }}
          />
          <div className="cozy-article-hero-content">
            <button type="button" className="cozy-article-back-link" onClick={() => navigate("/blogs")}>
              <ArrowLeft size={16} /> Back to Botanical Journal
            </button>

            <div className="cozy-article-badges-row">
              <span className="cozy-article-category-chip">{blog.category}</span>
              <span className="cozy-article-read-time">
                <Clock size={14} /> {blog.read_time}
              </span>
              <span className="cozy-article-read-time">
                <Eye size={14} /> {blog.views.toLocaleString()} reads
              </span>
            </div>

            <h1 className="cozy-article-headline">{blog.title}</h1>
            <p className="cozy-article-lead-excerpt">{blog.excerpt}</p>

            <div className="cozy-article-author-meta">
              <div className="cozy-author-cluster">
                <img
                  src={blog.author_image}
                  alt={blog.author}
                  className="cozy-article-author-img"
                  onError={(e) => handleImageError(e, "/images/team-sarah.jpg")}
                />
                <div className="cozy-author-text">
                  <h4>{blog.author}</h4>
                  <span>
                    {blog.author_role} •{" "}
                    {new Date(blog.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="cozy-article-share-btns">
                <button
                  type="button"
                  className="cozy-share-icon-btn"
                  onClick={handleCopyShare}
                  title="Copy link to clipboard"
                >
                  {copied ? <Check size={16} color="#34d399" /> : <Share2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================================
            2. ARTICLE BODY CONTENT CARD
            ===================================================================== */}
        <div className="cozy-article-shell">
          <article className="cozy-article-main-card">
            {/* Primary High-Resolution Picture with Zoom Lightbox */}
            <figure className="cozy-article-feature-image-box">
              <button
                type="button"
                className="cozy-article-image-button"
                onClick={() => setLightboxImg(blog.image)}
                aria-label={`Expand image: ${blog.title}`}
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
                />
              </button>
              <figcaption className="cozy-article-img-caption">
                {blog.title} — select the image to view it full size
              </figcaption>
            </figure>

            {/* Editorial Prose Body */}
            <div className="cozy-article-prose">
              {paragraphs.map((pText, pIdx) => {
                const lines = pText.split("\n").map((line) => line.trim()).filter(Boolean);

                // Check if it's a heading
                if (pText.startsWith("### ")) {
                  return <h2 key={pIdx}>{pText.replace("### ", "")}</h2>;
                }
                if (pText.startsWith("## ")) {
                  return <h2 key={pIdx}>{pText.replace("## ", "")}</h2>;
                }
                // Check if it's a blockquote
                if (pText.startsWith("> ")) {
                  return (
                    <blockquote key={pIdx} className="cozy-pullquote">
                      {renderInlineFormatting(pText.replace("> ", "").replace(/"/g, ""))}
                    </blockquote>
                  );
                }

                if (lines.length > 0 && lines.every((line) => /^\d+\.\s/.test(line))) {
                  return (
                    <ol key={pIdx} className="cozy-article-list cozy-article-numbered-list">
                      {lines.map((line, lineIdx) => (
                        <li key={lineIdx}>
                          {renderInlineFormatting(line.replace(/^\d+\.\s*/, ""))}
                        </li>
                      ))}
                    </ol>
                  );
                }

                if (lines.length > 0 && lines.every((line) => /^[-*]\s/.test(line))) {
                  return (
                    <ul key={pIdx} className="cozy-article-list">
                      {lines.map((line, lineIdx) => (
                        <li key={lineIdx}>
                          {renderInlineFormatting(line.replace(/^[-*]\s*/, ""))}
                        </li>
                      ))}
                    </ul>
                  );
                }

                // First paragraph gets the prestigious drop cap!
                const isFirst = pIdx === 0;
                return (
                  <p key={pIdx} className={isFirst ? "cozy-drop-cap" : ""}>
                    {renderInlineFormatting(pText)}
                  </p>
                );
              })}

              {/* Plant Doctor Callout Tip Box */}
              {blog.tips && blog.tips.length > 0 && (
                <div className="cozy-tip-callout">
                  <div className="cozy-tip-callout-icon">
                    <Stethoscope size={24} />
                  </div>
                  <div className="cozy-tip-callout-content">
                    <h4>Plant Doctor Pro Care Rule</h4>
                    <p>{blog.tips[0]}</p>
                    {blog.tips[1] && <p style={{ marginTop: "0.5rem" }}>{blog.tips[1]}</p>}
                  </div>
                </div>
              )}

              {/* Key Takeaways Summary Card */}
              {blog.takeaways && blog.takeaways.length > 0 && (
                <div className="cozy-takeaways-card">
                  <h4 className="cozy-takeaways-title">
                    <Sparkles size={18} /> Key Takeaways for Kathmandu Gardeners
                  </h4>
                  <ul className="cozy-takeaways-list">
                    {blog.takeaways.map((takeaway, tIdx) => (
                      <li key={tIdx}>{takeaway}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Author Signature Card */}
            <div className="cozy-article-author-box">
              <img src={blog.author_image} alt={blog.author} className="cozy-author-box-img" />
              <div className="cozy-author-box-info">
                <h3>Written by {blog.author}</h3>
                <p>
                  {blog.author} is a certified horticulturist and indoor greenery specialist at Nepal Cozy
                  Care. Dedicated to sustainable propagation, soil science, and bringing thriving nature
                  into urban homes across Nepal.
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* =====================================================================
            3. RELATED BOTANICAL ARTICLES
            ===================================================================== */}
        {relatedBlogs.length > 0 && (
          <section className="cozy-related-section">
            <h3 className="cozy-related-title">Continue Exploring Care Stories</h3>
            <div className="cozy-blog-grid">
              {relatedBlogs.map((rel) => (
                <article
                  key={rel.id}
                  className="cozy-article-card"
                  onClick={() => navigate(`/blogs/${rel.id}`)}
                >
                  <div className="cozy-card-media">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="cozy-card-img"
                      onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
                    />
                    <span className="cozy-card-category">{rel.category}</span>
                  </div>
                  <div className="cozy-card-body">
                    <div className="cozy-card-meta">
                      <span>{rel.read_time}</span>
                      <span>•</span>
                      <span>{rel.views.toLocaleString()} reads</span>
                    </div>
                    <h3 className="cozy-card-title">{rel.title}</h3>
                    <p className="cozy-card-excerpt">{rel.excerpt}</p>
                    <div className="cozy-card-footer">
                      <span className="cozy-card-read-link">
                        Read Story <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            4. LIGHTBOX IMAGE ZOOM MODAL
            ===================================================================== */}
        {lightboxImg && (
          <div className="cozy-image-lightbox" onClick={() => setLightboxImg(null)}>
            <img
              src={lightboxImg}
              alt="Enlarged botanical preview"
              className="cozy-lightbox-img"
              onError={(e) => handleImageError(e, DEFAULT_BLOG_IMAGE)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

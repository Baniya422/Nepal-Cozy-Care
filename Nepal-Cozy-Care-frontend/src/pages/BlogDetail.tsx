import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Eye, Tag, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../styles/blogDetail.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Blog = {
  id: number;
  title: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  author?: string | null;
  category?: string | null;
  views?: number;
  created_at: string;
  published_at?: string | null;
};

export default function BlogDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API}/api/blogs/${id}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load this blog article.");
      }

      setBlog((data.data?.blog ?? null) as Blog | null);
      setRelatedBlogs((data.data?.related_blogs ?? []) as Blog[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load this blog article.");
    } finally {
      setLoading(false);
    }
  };

  const displayDate = blog?.published_at || blog?.created_at;

  return (
    <Layout>
      <div className="blog-detail-page">
        <div className="blog-detail-shell">
          <button type="button" className="blog-detail-back" onClick={() => navigate("/blogs")}>
            <ArrowLeft size={16} />
            Back to Blogs
          </button>

          {loading ? (
            <div className="blog-detail-empty">Loading article...</div>
          ) : error || !blog ? (
            <div className="blog-detail-empty">
              <BookOpen size={28} />
              <h2>Blog not found</h2>
              <p>{error || "We could not find that article."}</p>
            </div>
          ) : (
            <>
              <section className="blog-detail-hero">
                <div className="blog-detail-copy">
                  <span className="blog-detail-kicker">Plant Stories</span>
                  <h1>{blog.title}</h1>
                  <p>{blog.excerpt || "A longer read from the Cozy Care content library."}</p>

                  <div className="blog-detail-meta">
                    <span>
                      <User size={15} />
                      {blog.author || "Cozy Care Team"}
                    </span>
                    <span>
                      <Tag size={15} />
                      {blog.category || "General"}
                    </span>
                    <span>
                      <Eye size={15} />
                      {(blog.views ?? 0).toLocaleString()} views
                    </span>
                    <span>{displayDate ? new Date(displayDate).toLocaleDateString("en-NP") : "Today"}</span>
                  </div>
                </div>

                <div className="blog-detail-media">
                  <img
                    src={
                      blog.image
                        ? `${API}/storage/${blog.image}`
                        : "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=900&h=700&fit=crop"
                    }
                    alt={blog.title}
                  />
                </div>
              </section>

              <section className="blog-detail-content-wrap">
                <article className="blog-detail-content">
                  {blog.content
                    .split(/\n{2,}/)
                    .filter((block) => block.trim().length > 0)
                    .map((block, index) => (
                      <p key={`${blog.id}-${index}`}>{block.trim()}</p>
                    ))}
                </article>

                <aside className="blog-detail-sidebar">
                  <div className="blog-detail-sidebar-card">
                    <h3>Why this article matters</h3>
                    <p>
                      This content helps users care for plants after purchase, so the project is not only an e-commerce platform but also a learning platform.
                    </p>
                  </div>

                  <div className="blog-detail-sidebar-card">
                    <h3>Continue exploring</h3>
                    <button type="button" className="blog-detail-link-btn" onClick={() => navigate("/care-tips")}>
                      Open Care Tips
                    </button>
                    <button
                      type="button"
                      className="blog-detail-link-btn"
                      onClick={() => navigate("/plant-health-checker")}
                    >
                      Plant Health Checker
                    </button>
                  </div>
                </aside>
              </section>

              {relatedBlogs.length > 0 ? (
                <section className="blog-detail-related">
                  <div className="blog-detail-related-head">
                    <h2>Related Articles</h2>
                    <p>More stories from the same topic area.</p>
                  </div>
                  <div className="blog-detail-related-grid">
                    {relatedBlogs.map((relatedBlog) => (
                      <article
                        key={relatedBlog.id}
                        className="blog-detail-related-card"
                        onClick={() => navigate(`/blogs/${relatedBlog.id}`)}
                      >
                        <img
                          src={
                            relatedBlog.image
                              ? `${API}/storage/${relatedBlog.image}`
                              : "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=420&fit=crop"
                          }
                          alt={relatedBlog.title}
                        />
                        <div>
                          <span>{relatedBlog.category || "General"}</span>
                          <h3>{relatedBlog.title}</h3>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

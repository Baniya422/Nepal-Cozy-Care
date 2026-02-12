import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../styles/blogs.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Blog = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  author?: string;
  created_at: string;
};

export default function Blogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editorPicks, setEditorPicks] = useState<Blog[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API}/api/blogs`);
      const data = await response.json();
      const allBlogs = data.data || [];
      
      // First 3 as featured, next 4 as editor picks
      setBlogs(allBlogs.slice(0, 3));
      setEditorPicks(allBlogs.slice(3, 7));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
    alert("Thank you for subscribing!");
  };

  const handleReadMore = (blogId: number) => {
    navigate(`/blogs/${blogId}`);
  };

  return (
    <Layout>
      <div className="blogs-page">
        {/* Sidebar */}
        <aside className="blogs-sidebar">
          {/* Top Trends */}
          <div className="blogs-sidebar-section">
            <h3 className="blogs-sidebar-title">Top trends</h3>
            <div className="blogs-trends-list">
              <div className="blogs-trend-item">
                <img src="/images/trend1.jpg" alt="Trend" className="blogs-trend-image" />
                <p className="blogs-trend-text">Best Indoor Plants for Beginners: Easy Care Tips</p>
              </div>
              <div className="blogs-trend-item">
                <img src="/images/trend2.jpg" alt="Trend" className="blogs-trend-image" />
                <p className="blogs-trend-text">Best Indoor Plants for Small Spaces and Low Light</p>
              </div>
              <div className="blogs-trend-item">
                <img src="/images/trend3.jpg" alt="Trend" className="blogs-trend-image" />
                <p className="blogs-trend-text">Best Plants for The Great Outdoors: Your Guide</p>
              </div>
              <div className="blogs-trend-item">
                <img src="/images/trend4.jpg" alt="Trend" className="blogs-trend-image" />
                <p className="blogs-trend-text">Discover the Health and Wellness Benefits of House Plants</p>
              </div>
              <div className="blogs-trend-item">
                <img src="/images/trend5.jpg" alt="Trend" className="blogs-trend-image" />
                <p className="blogs-trend-text">How to Keep Your Indoor Plants Healthy Year Round</p>
              </div>
            </div>
          </div>

          {/* Top Stories */}
          <div className="blogs-sidebar-section">
            <h3 className="blogs-sidebar-title">Top stories</h3>
            <div className="blogs-stories-list">
              <p className="blogs-story-item">Watering Schedule for Different Plant Types</p>
              <p className="blogs-story-item">Common Mistakes to Avoid When Caring for Indoor Plants</p>
              <p className="blogs-story-item">How to Repot Your Plant: Step-by-Step Guide</p>
              <p className="blogs-story-item">Understanding Plant Nutrients and Fertilizers</p>
              <p className="blogs-story-item">Best Low-Maintenance Plants for Busy People</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="blogs-newsletter">
            <h3 className="blogs-newsletter-title">Daily Newsletter</h3>
            <p className="blogs-newsletter-text">Get all the latest news and tips delivered to your inbox</p>
            <form onSubmit={handleNewsletterSubmit} className="blogs-newsletter-form">
              <input
                type="email"
                placeholder="Name"
                className="blogs-newsletter-input"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="blogs-newsletter-input"
                required
              />
              <button type="submit" className="blogs-newsletter-btn">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="blogs-main">
          <h1 className="blogs-page-title">Blogs</h1>

          {/* Featured Blogs */}
          <div className="blogs-featured-grid">
            {blogs.map((blog) => (
              <article key={blog.id} className="blogs-card">
                <div className="blogs-card-image-wrapper">
                  <img
                    src={blog.image ? `${API}/storage/${blog.image}` : "/images/blog-placeholder.jpg"}
                    alt={blog.title}
                    className="blogs-card-image"
                  />
                </div>
                <div className="blogs-card-content">
                  <h2 className="blogs-card-title">{blog.title}</h2>
                  <p className="blogs-card-excerpt">
                    {blog.excerpt || blog.content.substring(0, 150) + "..."}
                  </p>
                  <div className="blogs-card-footer">
                    <div className="blogs-card-author">
                      <img src="/images/author-avatar.jpg" alt="Author" className="blogs-author-avatar" />
                      <span className="blogs-author-name">{blog.author || "Cozy Care"}</span>
                    </div>
                    <button 
                      className="blogs-read-more-btn"
                      onClick={() => handleReadMore(blog.id)}
                    >
                      Read more
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Welcome Section */}
          <section className="blogs-welcome">
            <h2 className="blogs-welcome-title">Welcome</h2>
            <p className="blogs-welcome-text">
              Cozy Care is a smart plant care app and e-commerce platform designed to help people grow 
              healthy plants at home. Whether you're a beginner or already love gardening, Cozy Care 
              gives you clear guidance, plant advice, and easy access to plants and accessories, all in 
              one place.
            </p>
          </section>

          {/* Editor Picks */}
          <section className="blogs-editor-picks">
            <h2 className="blogs-section-title">Editor Picks</h2>
            <div className="blogs-editor-grid">
              {editorPicks.map((blog) => (
                <article 
                  key={blog.id} 
                  className="blogs-editor-card"
                  onClick={() => handleReadMore(blog.id)}
                >
                  <div className="blogs-editor-image-wrapper">
                    <img
                      src={blog.image ? `${API}/storage/${blog.image}` : "/images/blog-placeholder.jpg"}
                      alt={blog.title}
                      className="blogs-editor-image"
                    />
                  </div>
                  <div className="blogs-editor-content">
                    <h3 className="blogs-editor-title">{blog.title}</h3>
                    <p className="blogs-editor-date">
                      {new Date(blog.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}

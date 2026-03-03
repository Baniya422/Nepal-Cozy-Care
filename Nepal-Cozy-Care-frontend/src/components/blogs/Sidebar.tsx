import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Blog = {
  id: number;
  title: string;
  image?: string;
  author?: string;
  category?: string;
};

interface SidebarProps {
  topTrends: Blog[];
  topStories: Blog[];
  loading: boolean;
}

export default function Sidebar({ topTrends, topStories, loading }: SidebarProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
    alert("Thank you for subscribing!");
  };

  return (
    <aside className="blogs-sidebar">
      {/* Top Trends */}
      <div className="blogs-sidebar-section">
        <h3 className="blogs-sidebar-title">Top trends</h3>
        <div className="blogs-trends-list">
          {loading ? (
            <div className="blogs-sidebar-loading">Loading...</div>
          ) : topTrends.length > 0 ? (
            topTrends.map((blog) => (
              <div
                key={blog.id}
                className="blogs-trend-item"
                onClick={() => navigate(`/blogs/${blog.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img 
                  src={blog.image ? `${API}/storage/${blog.image}` : "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=100"} 
                  alt={blog.title} 
                  className="blogs-trend-image" 
                />
                <p className="blogs-trend-text">{blog.title}</p>
              </div>
            ))
          ) : (
            <p className="blogs-sidebar-empty">No trends available</p>
          )}
        </div>
      </div>

      {/* Top Stories */}
      <div className="blogs-sidebar-section">
        <h3 className="blogs-sidebar-title">Top stories</h3>
        <div className="blogs-stories-list">
          {loading ? (
            <div className="blogs-sidebar-loading">Loading...</div>
          ) : topStories.length > 0 ? (
            topStories.map((blog) => (
              <p
                key={blog.id}
                className="blogs-story-item"
                onClick={() => navigate(`/blogs/${blog.id}`)}
                style={{ cursor: "pointer" }}
              >
                {blog.title}
              </p>
            ))
          ) : (
            <p className="blogs-sidebar-empty">No stories available</p>
          )}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="blogs-newsletter">
        <h3 className="blogs-newsletter-title">Daily Newsletter</h3>
        <p className="blogs-newsletter-text">Get all the latest news and tips delivered to your inbox</p>
        <form onSubmit={handleNewsletterSubmit} className="blogs-newsletter-form">
          <input
            type="text"
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
  );
}

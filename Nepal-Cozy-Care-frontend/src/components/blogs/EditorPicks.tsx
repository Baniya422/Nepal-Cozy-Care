import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Blog = {
  id: number;
  title: string;
  image?: string;
  created_at: string;
};

interface EditorPicksProps {
  blogs: Blog[];
  loading: boolean;
}

export default function EditorPicks({ blogs, loading }: EditorPicksProps) {
  const navigate = useNavigate();

  const handleReadMore = (blogId: number) => {
    navigate(`/blogs/${blogId}`);
  };

  if (loading) {
    return (
      <section className="blogs-editor-picks">
        <h2 className="blogs-section-title">Editor Picks</h2>
        <div className="blogs-editor-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="blogs-editor-card skeleton-card">
              <div className="blogs-editor-image-wrapper skeleton-image">
                <div className="skeleton-shimmer"></div>
              </div>
              <div className="blogs-editor-content">
                <div className="skeleton-text skeleton-editor-title"></div>
                <div className="skeleton-text skeleton-editor-date"></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="blogs-editor-picks">
      <h2 className="blogs-section-title">Editor Picks</h2>
      <div className="blogs-editor-grid">
        {blogs.map((blog) => (
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
  );
}

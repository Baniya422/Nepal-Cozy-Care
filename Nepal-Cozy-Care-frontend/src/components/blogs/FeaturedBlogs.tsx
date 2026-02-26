import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Blog = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  author?: string;
};

interface FeaturedBlogsProps {
  blogs: Blog[];
  loading: boolean;
}

export default function FeaturedBlogs({ blogs, loading }: FeaturedBlogsProps) {
  const navigate = useNavigate();

  const handleReadMore = (blogId: number) => {
    navigate(`/blogs/${blogId}`);
  };

  if (loading) {
    return (
      <div className="blogs-featured-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={index} className="blogs-card skeleton-card">
            <div className="blogs-card-image-wrapper skeleton-image">
              <div className="skeleton-shimmer"></div>
            </div>
            <div className="blogs-card-content">
              <div className="skeleton-text skeleton-blog-title"></div>
              <div className="skeleton-text skeleton-blog-excerpt"></div>
              <div className="skeleton-text skeleton-blog-excerpt short"></div>
              <div className="blogs-card-footer">
                <div className="skeleton-text skeleton-blog-author"></div>
                <div className="skeleton-text skeleton-blog-button"></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
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
  );
}

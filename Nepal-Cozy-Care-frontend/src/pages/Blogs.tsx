import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/blogs/Sidebar";
import FeaturedBlogs from "../components/blogs/FeaturedBlogs";
import Welcome from "../components/blogs/Welcome";
import EditorPicks from "../components/blogs/EditorPicks";
import "../styles/blogs.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Blog = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  author?: string;
  category?: string;
  views?: number;
  created_at: string;
};

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [topTrends, setTopTrends] = useState<Blog[]>([]);
  const [topStories, setTopStories] = useState<Blog[]>([]);
  const [editorPicks, setEditorPicks] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/blogs?per_page=20`);
      const data = await response.json();
      const allBlogs = data.data?.blogs || data.data || [];
      
      // First 3 as featured blogs (main cards)
      setBlogs(allBlogs.slice(0, 3));
      
      // Next 5 as top trends (sidebar with images)
      setTopTrends(allBlogs.slice(3, 8));
      
      // Next 5 as top stories (sidebar text only)
      setTopStories(allBlogs.slice(8, 13));
      
      // Next 4 as editor picks (below welcome)
      setEditorPicks(allBlogs.slice(13, 17));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="blogs-page">
        <Sidebar topTrends={topTrends} topStories={topStories} loading={loading} />

        <main className="blogs-main">
          <h1 className="blogs-page-title">Blogs</h1>
          <FeaturedBlogs blogs={blogs} loading={loading} />
          <Welcome />
          <EditorPicks blogs={editorPicks} loading={loading} />
        </main>
      </div>
    </Layout>
  );
}

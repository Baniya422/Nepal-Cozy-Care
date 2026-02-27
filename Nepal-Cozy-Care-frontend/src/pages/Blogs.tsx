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
      // Fetch featured blogs
      const blogsRes = await fetch(`${API}/api/blogs?per_page=3`);
      const blogsData = await blogsRes.json();
      setBlogs(blogsData.data?.blogs || blogsData.data || []);
      
      // Fetch top trends
      const trendsRes = await fetch(`${API}/api/top-trends?limit=5`);
      const trendsData = await trendsRes.json();
      setTopTrends(trendsData.data?.blogs || trendsData.data || []);
      
      // Fetch top stories
      const storiesRes = await fetch(`${API}/api/top-stories?limit=5`);
      const storiesData = await storiesRes.json();
      setTopStories(storiesData.data?.blogs || storiesData.data || []);
      
      // Fetch editor picks
      const picksRes = await fetch(`${API}/api/blogs?per_page=20&page=2`);
      const picksData = await picksRes.json();
      setEditorPicks(picksData.data?.blogs?.slice(0, 4) || picksData.data?.slice(0, 4) || []);
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

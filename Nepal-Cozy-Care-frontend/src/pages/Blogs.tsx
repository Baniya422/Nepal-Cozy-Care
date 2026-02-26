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
  created_at: string;
};

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editorPicks, setEditorPicks] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/blogs`);
      const data = await response.json();
      const allBlogs = data.data || [];
      
      // First 3 as featured, next 4 as editor picks
      setBlogs(allBlogs.slice(0, 3));
      setEditorPicks(allBlogs.slice(3, 7));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="blogs-page">
        <Sidebar />

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

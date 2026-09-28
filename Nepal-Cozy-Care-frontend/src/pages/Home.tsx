import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Storefront from "../components/home/Storefront";
import {
  defaultHomepageContent,
  normalizeHomepageContent,
  type HomepageContent,
} from "../features/homepage/content";
import SEO from "../components/common/SEO";
import "../components/home/home.css";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
export default function Home() {
  const [content, setContent] = useState<HomepageContent>(() => {
    try {
      const cached = localStorage.getItem("cozycare_cache_homepage_content");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") return normalizeHomepageContent(parsed);
      }
    } catch {
      // ignore
    }
    return defaultHomepageContent;
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const fetchContent = async () => {
      try {
        const response = await fetch(`${API}/api/homepage/content`, { signal: controller.signal });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.data?.payload) {
          setContent(normalizeHomepageContent(data.data.payload));
          try {
            localStorage.setItem("cozycare_cache_homepage_content", JSON.stringify(data.data.payload));
          } catch {
            // ignore
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.warn("Could not background-refresh homepage content:", error);
      } finally {
        clearTimeout(timeout);
      }
    };
    void fetchContent();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return (
    <Layout>
      <SEO
        title="Nepal Cozy Care - Premium Indoor Plants & Plant Care in Nepal"
        description="Discover healthy indoor plants, designer ceramic pots, smart plant health checker, and watering guides with fast doorstep delivery across Nepal."
        canonicalPath="/"
      />
      <Storefront content={content} />
    </Layout>
  );
}

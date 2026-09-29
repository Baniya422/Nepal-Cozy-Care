import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Storefront from "../components/home/Storefront";
import {
  defaultHomepageContent,
  normalizeHomepageContent,
  type HomepageContent,
} from "../features/homepage/content";
import SEO from "../components/common/SEO";
import { absoluteSiteUrl, SITE_NAME } from "../utils/siteUrl";
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
        title="Buy Plants Online in Nepal"
        description="Buy indoor plants, pots and garden seeds online in Nepal. Compare prices and care needs, check availability, and find delivery information before you order."
        canonicalPath="/"
        structuredData={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${absoluteSiteUrl("/")}#organization`, name: SITE_NAME, url: absoluteSiteUrl("/") }}
      />
      <Storefront content={content} />
    </Layout>
  );
}

import { useEffect } from "react";
import { SITE_NAME, absoluteSiteUrl } from "../../utils/siteUrl";
import { resolveImageUrl } from "../../utils/imageUrl";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}
const DEFAULT_TITLE = "Buy Plants Online in Nepal";
const DEFAULT_DESCRIPTION = "Shop indoor plants, pots and garden seeds in Nepal. Compare prices, availability and plant care needs before you order.";

export default function SEO({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, canonicalPath,
  image, type = "website", noindex = false, structuredData }: SEOProps) {
  const schema = structuredData ? JSON.stringify(structuredData).replace(/</g, "\\u003c") : "";
  useEffect(() => {
    const cleanTitle = title.replace(/\s*[|–-]\s*Nepal Cozy Care\s*$/i, "");
    const formattedTitle = `${cleanTitle} | ${SITE_NAME}`;
    document.title = formattedTitle;
    const elements: Element[] = [];
    const meta = (attribute: "name" | "property", key: string, content: string) => {
      const element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`) || document.createElement("meta");
      element.setAttribute(attribute, key);
      element.content = content;
      document.head.appendChild(element);
      elements.push(element);
    };
    const canonical = absoluteSiteUrl(canonicalPath ?? window.location.pathname);
    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') || document.createElement("link");
    link.rel = "canonical";
    link.href = canonical;
    document.head.appendChild(link);
    elements.push(link);
    meta("name", "description", description);
    meta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    meta("property", "og:title", formattedTitle);
    meta("property", "og:description", description);
    meta("property", "og:url", canonical);
    meta("property", "og:type", type === "product" ? "website" : type);
    meta("property", "og:site_name", SITE_NAME);
    meta("name", "twitter:card", image ? "summary_large_image" : "summary");
    meta("name", "twitter:title", formattedTitle);
    meta("name", "twitter:description", description);
    if (image) {
      const resolved = absoluteSiteUrl(resolveImageUrl(image));
      meta("property", "og:image", resolved);
      meta("name", "twitter:image", resolved);
    }
    if (schema) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = schema;
      document.head.appendChild(script);
      elements.push(script);
    }
    return () => {
      elements.forEach(element => element.remove());
      document.title = `${DEFAULT_TITLE} | ${SITE_NAME}`;
    };
  }, [title, description, canonicalPath, image, type, noindex, schema]);
  return null;
}

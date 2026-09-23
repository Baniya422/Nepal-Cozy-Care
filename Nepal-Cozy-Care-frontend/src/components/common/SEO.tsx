import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}

const DEFAULT_TITLE = "Nepal Cozy Care - Premium Indoor Plants & Plant Care in Nepal";
const DEFAULT_DESCRIPTION =
  "Discover premium indoor plants, pots, tools, and expert plant health care guides across Nepal. Fast delivery and healthy plants guaranteed.";
const DEFAULT_IMAGE = "/logo.png";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = "",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? `${title} | Nepal Cozy Care`
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attribute: "name" | "property", value: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Meta description
    setMetaTag("name", "description", description);

    // 3. Robots
    if (noindex) {
      setMetaTag("name", "robots", "noindex, nofollow");
    } else {
      setMetaTag("name", "robots", "index, follow, max-image-preview:large");
    }

    // 4. Canonical link
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nepal-cozy-care.onrender.com";
    const fullCanonicalUrl = `${origin}${canonicalPath ? (canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`) : window.location.pathname}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullCanonicalUrl);

    // 5. Open Graph
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", fullCanonicalUrl);
    setMetaTag("property", "og:type", type);
    const resolvedImage = image.startsWith("http") ? image : `${origin}${image.startsWith("/") ? image : `/${image}`}`;
    setMetaTag("property", "og:image", resolvedImage);
    setMetaTag("property", "og:site_name", "Nepal Cozy Care");

    // 6. Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", resolvedImage);

  }, [title, description, canonicalPath, image, type, noindex]);

  return null;
}

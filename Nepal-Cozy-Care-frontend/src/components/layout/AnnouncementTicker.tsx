import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowRight } from "lucide-react";
import { defaultStorefront } from "../../features/homepage/storefront";
import "./announcement-ticker.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function AnnouncementTicker() {
  const [announcement, setAnnouncement] = useState<string>(() => {
    try {
      const cached = localStorage.getItem("cozycare_cache_homepage_content");
      if (cached) {
        const parsed = JSON.parse(cached);
        const text = parsed?.storefront?.announcement;
        if (text && typeof text === "string") return text;
      }
    } catch {
      // ignore
    }
    return defaultStorefront.announcement || "🌿 Free Valley Delivery on orders over Rs. 999 | 🌸 Code: GREEN10 for 10% Off | 🩺 Free WhatsApp Plant Doctor Support";
  });

  const [announcementPath, setAnnouncementPath] = useState<string>(() => {
    try {
      const cached = localStorage.getItem("cozycare_cache_homepage_content");
      if (cached) {
        const parsed = JSON.parse(cached);
        const path = parsed?.storefront?.announcement_path;
        if (path && typeof path === "string") return path;
      }
    } catch {
      // ignore
    }
    return defaultStorefront.announcement_path || "/plants";
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem("cozycare_cache_homepage_content");
        if (cached) {
          const parsed = JSON.parse(cached);
          const text = parsed?.storefront?.announcement;
          const path = parsed?.storefront?.announcement_path;
          if (text) setAnnouncement(text);
          if (path) setAnnouncementPath(path);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("cozycare:homepage-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // If cache not present or first visit, fetch from API once (skipped during tests)
    if (import.meta.env.MODE !== "test" && !localStorage.getItem("cozycare_cache_homepage_content")) {
      fetch(`${API}/api/homepage/content`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const payload = data?.data?.payload;
          if (payload?.storefront?.announcement) {
            setAnnouncement(payload.storefront.announcement);
            if (payload.storefront.announcement_path) {
              setAnnouncementPath(payload.storefront.announcement_path);
            }
            try {
              localStorage.setItem("cozycare_cache_homepage_content", JSON.stringify(payload));
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("cozycare:homepage-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  if (!announcement) return null;

  return (
    <Link
      className="sf-announcement-bar"
      to={announcementPath || "/plants"}
      title="Click to explore offers"
    >
      <div className="sf-announcement-track">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="sf-announcement-item">
            <span className="sf-announcement-pulse" />
            <Leaf size={14} className="sf-announcement-leaf" />
            <span>{announcement}</span>
            <span className="sf-announcement-dot" />
            <ArrowRight size={13} className="sf-announcement-arrow" />
          </div>
        ))}
      </div>
    </Link>
  );
}

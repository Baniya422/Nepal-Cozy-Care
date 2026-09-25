import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./category-bubbles.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface CategoryBubbleItem {
  id?: string;
  label: string;
  path: string;
  image: string;
  is_active?: boolean;
}

export const defaultCategoryBubbles: CategoryBubbleItem[] = [
  { id: "plants", label: "Plants", path: "/plants", image: "plants", is_active: true },
  { id: "pots", label: "Pots & Planters", path: "/pots", image: "pots", is_active: true },
  { id: "soil", label: "Soil & Media", path: "/pots?category=soil", image: "soil", is_active: true },
  { id: "fertiliser", label: "Fertilisers", path: "/pots?category=fertilizer", image: "fertiliser", is_active: true },
  { id: "seeds", label: "Seeds", path: "/pots?category=seeds", image: "seeds", is_active: true },
  { id: "tools", label: "Garden Tools", path: "/pots?category=tools", image: "tools", is_active: true },
  { id: "watering", label: "Watering", path: "/pots?category=watering", image: "watering", is_active: true },
  { id: "care", label: "Care Tips", path: "/care-tips", image: "care", is_active: true },
  { id: "decor", label: "Gardening Decor", path: "/pots?category=decor", image: "decor", is_active: true },
];

export const resolveCategoryBubbleImage = (img: string): string => {
  if (!img) return "/images/categories/plants.webp";
  if (
    img.startsWith("http://") ||
    img.startsWith("https://") ||
    img.startsWith("/storage/") ||
    img.startsWith("data:") ||
    img.startsWith("/")
  ) {
    return img;
  }
  return `/images/categories/${img}.webp`;
};

export default function CategoryBubbles() {
  const location = useLocation();
  const [categories, setCategories] = useState<CategoryBubbleItem[]>(() => {
    try {
      const cached = localStorage.getItem("cozycare_cache_category_bubbles");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return defaultCategoryBubbles;
  });

  const fetchBubbles = async () => {
    try {
      const res = await fetch(`${API}/api/category-bubbles`);
      if (res.ok) {
        const json = await res.json();
        const payload = json?.data?.payload;
        const cats = payload?.categories;
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          localStorage.setItem("cozycare_cache_category_bubbles", JSON.stringify(cats));
        }
        if (payload?.title || payload?.subtitle) {
          localStorage.setItem(
            "cozycare_cache_category_bubbles_meta",
            JSON.stringify({
              title: payload.title || "Plants",
              subtitle:
                payload.subtitle ||
                "Transform your living spaces with hand-nurtured houseplants and outdoor flora",
            })
          );
        }
      }
    } catch {
      // fallback to cached/defaults
    }
  };

  useEffect(() => {
    fetchBubbles();
    const handleUpdated = () => fetchBubbles();
    window.addEventListener("cozycare:content-updated", handleUpdated);
    return () => {
      window.removeEventListener("cozycare:content-updated", handleUpdated);
    };
  }, []);

  const activeCategories = categories.filter((c) => c.is_active !== false);

  return (
    <nav className="category-bubbles-container" aria-label="Product categories">
      <div className="category-bubbles-track">
        {activeCategories.map((cat, idx) => {
          const [pathname, query = ""] = cat.path.split("?");
          const currentCategoryParam = new URLSearchParams(location.search).get("category");
          const targetCategoryParam = new URLSearchParams(query).get("category");

          const isActive =
            location.pathname === pathname &&
            (targetCategoryParam ? currentCategoryParam === targetCategoryParam : !currentCategoryParam);

          return (
            <Link
              key={cat.id || `${cat.label}-${idx}`}
              to={cat.path}
              aria-current={isActive ? "page" : undefined}
              className={`category-bubble-item ${isActive ? "active" : ""}`}
            >
              <div className="category-bubble-circle">
                <img
                  src={resolveCategoryBubbleImage(cat.image)}
                  alt={cat.label}
                  width={136}
                  height={136}
                  decoding="async"
                  className="category-bubble-image"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/categories/plants.webp";
                  }}
                />
              </div>
              <span className="category-bubble-label">{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link, useLocation } from "react-router-dom";
import "./category-bubbles.css";

const CATEGORIES = [
  { label: "Plants", path: "/plants", image: "plants" },
  { label: "Pots & Planters", path: "/pots", image: "pots" },
  { label: "Best Sellers", path: "/best-sellers", image: "plants" },
  { label: "Popular Items", path: "/popular-items", image: "pots" },
  { label: "Soil & Media", path: "/pots?category=soil", image: "soil" },
  { label: "Fertilisers", path: "/pots?category=fertilizer", image: "fertiliser" },
  { label: "Garden Tools", path: "/pots?category=tools", image: "tools" },
  { label: "Watering", path: "/pots?category=watering", image: "watering" },
  { label: "Plant Care", path: "/care-tips", image: "care" },
];

export default function CategoryBubbles() {
  const location = useLocation();
  return (
    <nav className="category-bubbles-container" aria-label="Product categories">
      <div className="category-bubbles-track">
        {CATEGORIES.map((cat) => {
          const [pathname, query = ""] = cat.path.split("?");
          const isActive = location.pathname === pathname &&
            new URLSearchParams(location.search).get("category") ===
              new URLSearchParams(query).get("category");
          return (
            <Link key={cat.label} to={cat.path}
              aria-current={isActive ? "page" : undefined}
              className={`category-bubble-item ${isActive ? "active" : ""}`}>
              <div className="category-bubble-circle">
                <img src={`/images/categories/${cat.image}.webp`} alt=""
                  width={136} height={136} decoding="async"
                  className="category-bubble-image" />
              </div>
              <span className="category-bubble-label">{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

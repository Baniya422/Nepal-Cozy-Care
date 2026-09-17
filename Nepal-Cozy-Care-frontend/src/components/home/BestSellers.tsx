import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useWishlist } from "../../hooks/useWishlist";
import type { ProductSectionContent } from "../../features/homepage/content";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
};
export default function BestSellers({ content }: { content: ProductSectionContent }) {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlistIds, wishlistBusyId, toggleWishlist } = useWishlist({ apiBaseUrl: API });
  const { cartBusyId, addToCart } = useAddToCart(API);
  useEffect(() => {
    fetch(`${API}/api/homepage/best-sellers?per_page=4`)
      .then(res => res.json())
      .then(json => {
        setPlants(json.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setPlants([]);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return (
      <section className="product-section">
        <h2 className="section-title">{content.title}</h2>
        <div className="product-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="product-card" style={{ opacity: 0.6 }}>
              <div className="product-image-wrapper" style={{ background: "#e2e8f0", minHeight: "200px" }} />
              <div className="product-info">
                <div style={{ height: "1rem", background: "#e2e8f0", borderRadius: "4px", marginBottom: "0.5rem" }} />
                <div style={{ height: "1rem", background: "#e2e8f0", borderRadius: "4px", width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (plants.length === 0) {
    return (
      <section className="product-section">
        <h2 className="section-title">{content.title}</h2>
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
          <p>{content.empty_message}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="product-section">
      <h2 className="section-title">{content.title}</h2>
      <div className="product-grid">
        {plants.map(plant => (
          <div className="product-card" key={plant.id}>
            <div className="product-image-wrapper">
              <img
                className="product-image"
                src={resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE)}
                alt={plant.name}
                onClick={() => navigate(`/plants/${plant.id}`)}
                onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
              />
              <button
                type="button"
                className={`wishlist-btn ${wishlistIds.includes(plant.id) ? "active" : ""}`}
                onClick={() => void toggleWishlist(plant.id)}
                aria-label={
                  wishlistIds.includes(plant.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={wishlistIds.includes(plant.id)}
                disabled={wishlistBusyId === plant.id}
              >
                <Heart
                  size={20}
                  fill={wishlistIds.includes(plant.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="product-info">
              <h3 className="product-name" title={plant.name}>{plant.name}</h3>
              <div className="product-price-row">
                <span className="product-price">Rs. {Number(plant.price).toLocaleString()}</span>
                <span className="product-compare-price">
                  Rs. {Math.round(Number(plant.price) * 1.25).toLocaleString()}
                </span>
              </div>
              <div className="product-rating">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    className={i < Math.floor(plant.avg_rating || 5) ? "star-filled" : "star-empty"}
                    fill="currentColor"
                  />
                ))}
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => void addToCart({ id: plant.id, name: plant.name })}
                disabled={cartBusyId === plant.id}
              >
                {cartBusyId === plant.id ? "ADDING..." : "ADD TO CART"}
              </button>
              <button
                type="button"
                className="mobile-cart-circle-btn"
                onClick={() => void addToCart({ id: plant.id, name: plant.name })}
                disabled={cartBusyId === plant.id}
                aria-label={`Add ${plant.name} to cart`}
              >
                <ShoppingBag size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mobile-carousel-dots" aria-hidden="true">
        {plants.map((p, idx) => (
          <span key={p.id} className={`carousel-dot ${idx === 0 ? "active" : ""}`} />
        ))}
      </div>
      <div className="section-action">
        <button className="view-all-btn" onClick={() => navigate(content.button_path)}>
          {content.button_label}
        </button>
      </div>
    </section>
  );
}

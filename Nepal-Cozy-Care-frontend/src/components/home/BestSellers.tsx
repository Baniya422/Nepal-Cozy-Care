import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
};

export default function BestSellers() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    fetch(`${API}/api/homepage/best-sellers?per_page=4`)
      .then(res => res.json())
      .then(json => setPlants(json.data.data || []))
      .catch(() => setPlants([]));
  }, []);

  return (
    <section className="product-section">
      <h2 className="section-title">Best Sellers</h2>
      <div className="product-grid">
        {plants.map(plant => (
          <div className="product-card" key={plant.id}>
            <div className="product-image-wrapper">
              <img
                className="product-image"
                src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                alt={plant.name}
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).src = "/images/placeholder-plant.jpg";
                }}
              />
              <button className="wishlist-btn">
                <Heart size={20} />
              </button>
            </div>
            <div className="product-info">
              <h3 className="product-name">{plant.name}</h3>
              <p className="product-price">${plant.price.toFixed(2)}</p>
              <div className="product-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(plant.avg_rating || 5) ? "star-filled" : "star-empty"} fill="currentColor" />
                ))}
              </div>
              <button className="add-to-cart-btn" onClick={() => navigate(`/plants/${plant.id}`)}>
                ADD TO CART
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="section-action">
        <button className="view-all-btn" onClick={() => navigate("/plants")}>
          VIEW ALL
        </button>
      </div>
    </section>
  );
}

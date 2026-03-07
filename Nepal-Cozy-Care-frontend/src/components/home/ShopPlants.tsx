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

export default function ShopPlants() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/homepage/shop-plants?per_page=4`)
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
        <h2 className="section-title">Shop Plants</h2>
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
        <h2 className="section-title">Shop Plants</h2>
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
          <p>No shop plants available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-section">
      <h2 className="section-title">Shop Plants</h2>
      <div className="product-grid">
        {plants.map(plant => (
          <div className="product-card" key={plant.id}>
            <div className="product-image-wrapper">
              <img
                className="product-image"
                src={plant.image ? `${API}/storage/${plant.image}` : "public/images/HomeBackground.jpg"}
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
              <p className="product-price">${Number(plant.price).toFixed(2)}</p>
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

import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
  category?: string;
};

interface ProductGridProps {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  fetchPlants: () => void;
  wishlistIds: number[];
  wishlistBusyId: number | null;
  onToggleWishlist: (plantId: number) => void;
}

export default function ProductGrid({
  plants,
  loading,
  error,
  fetchPlants,
  wishlistIds,
  wishlistBusyId,
  onToggleWishlist,
}: ProductGridProps) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="plants-error" style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        background: '#fee2e2', 
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={fetchPlants}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (plants.length === 0 && !loading) {
    return (
      <div className="plants-no-results" style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p>No plants found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="plants-grid">
      {loading ? (
        // Loading skeleton
        Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="plants-card skeleton-card">
            <div className="plants-card-image-wrapper skeleton-image">
              <div className="skeleton-shimmer"></div>
            </div>
            <div className="plants-card-content">
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-category"></div>
              <div className="skeleton-text skeleton-price"></div>
              <div className="skeleton-text skeleton-rating"></div>
              <div className="skeleton-text skeleton-button"></div>
            </div>
          </div>
        ))
      ) : (
        plants.map((plant) => (
          <div key={plant.id} className="plants-card">
            <div className="plants-card-image-wrapper">
              <img
                src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                alt={plant.name}
                className="plants-card-image"
                onClick={() => navigate(`/plants/${plant.id}`)}
              />
              <button
                type="button"
                className={`plants-wishlist-btn ${
                  wishlistIds.includes(plant.id) ? "active" : ""
                }`}
                onClick={() => onToggleWishlist(plant.id)}
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
            <div className="plants-card-content">
              <h3 className="plants-card-name">{plant.name}</h3>
              <p className="plants-card-category">{plant.category || "Indoor Plant"}</p>
              <p className="plants-card-price">RS {Number(plant.price).toFixed(2)}</p>
              <div className="plants-card-rating">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(plant.avg_rating || 5) ? "star-filled" : "star-empty"}
                  >
                    ★
                  </span>
                ))}
                <span className="plants-rating-count">({plant.avg_rating || 5})</span>
              </div>
              <button 
                className="plants-view-btn"
                onClick={() => navigate(`/plants/${plant.id}`)}
              >
                View All
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

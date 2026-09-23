import { useNavigate, Link } from "react-router-dom";
import { Heart, Star, Store, ShieldCheck } from "lucide-react";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";
import type { Plant } from "../../types/plant";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";

interface ProductGridProps {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  fetchPlants: () => void;
  wishlistIds: number[];
  wishlistBusyId: number | null;
  onToggleWishlist: (plantId: number) => void;
  emptyMessage?: string;
  badgeLabel?: (plant: Plant, index: number) => string | null;
  showSoldCount?: boolean;
}
export default function ProductGrid({
  plants,
  loading,
  error,
  fetchPlants,
  wishlistIds,
  wishlistBusyId,
  onToggleWishlist,
  emptyMessage = "No plants found matching your filters.",
  badgeLabel,
  showSoldCount = false,
}: ProductGridProps) {
  const navigate = useNavigate();
  const { vendor_marketplace_enabled } = useFeatureFlags();
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
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="plants-grid">
      {loading ? (
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
        plants.map((plant, index) => {
          const rating = Math.max(0, Math.min(5, Number(plant.avg_rating ?? 0)));
          const badge = badgeLabel?.(plant, index) ?? null;

          return (
            <div key={plant.id} className="plants-card">
              <div className="plants-card-image-wrapper">
                {badge ? <span className="plants-card-badge">{badge}</span> : null}
                <img
                  src={resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE)}
                  alt={plant.name}
                  className="plants-card-image"
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
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
                {vendor_marketplace_enabled && plant.shop && (
                  <Link
                    to={`/shops/${plant.shop.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 transition mb-1"
                  >
                    <Store size={12} className="text-emerald-600" />
                    <span>Sold by {plant.shop.name}</span>
                    {plant.shop.is_verified && (
                      <ShieldCheck size={11} className="text-emerald-600" />
                    )}
                  </Link>
                )}
                <p className="plants-card-price">Rs {Number(plant.price).toFixed(2)}</p>
                <div className="plants-card-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i < Math.round(rating) ? "currentColor" : "none"}
                      className={i < Math.round(rating) ? "star-filled" : "star-empty"}
                    />
                  ))}
                  <span className="plants-rating-count">({plant.review_count ?? 0})</span>
                </div>
                {showSoldCount ? (
                  <p className="plants-card-sales">Sold: {plant.total_sold ?? 0} units</p>
                ) : null}
                <button
                  className="plants-view-btn"
                  onClick={() => navigate(`/plants/${plant.id}`)}
                >
                  View All
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

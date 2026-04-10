import { Heart, Star } from "lucide-react";
import type { CatalogPlant } from "../types";

type CatalogGridProps = {
  apiBaseUrl: string;
  plants: CatalogPlant[];
  loading: boolean;
  emptyMessage: string;
  onPlantClick: (id: number) => void;
  onToggleWishlist?: (id: number) => void;
  wishlistIds?: number[];
  wishlistBusyId?: number | null;
  showWishlistButton?: boolean;
  showSalesBadge?: boolean;
  salesBadgeLabel?: (index: number, plant: CatalogPlant) => string;
};

export default function CatalogGrid({
  apiBaseUrl,
  plants,
  loading,
  emptyMessage,
  onPlantClick,
  onToggleWishlist,
  wishlistIds = [],
  wishlistBusyId = null,
  showWishlistButton = false,
  showSalesBadge = false,
  salesBadgeLabel,
}: CatalogGridProps) {
  if (loading) {
    return (
      <div className="popular-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <article key={index} className="popular-card skeleton-card">
            <div className="popular-card-image-wrapper skeleton-image">
              <div className="skeleton-shimmer" />
            </div>
            <div className="popular-card-body">
              <div className="skeleton-text skeleton-popular-name" />
              <div className="skeleton-text skeleton-popular-rating" />
              <div className="popular-card-footer">
                <div className="skeleton-text skeleton-popular-price" />
                <div className="skeleton-text skeleton-popular-button" />
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return <div className="popular-empty">{emptyMessage}</div>;
  }

  return (
    <div className="popular-grid">
      {plants.map((plant, index) => {
        const roundedRating = Math.max(
          0,
          Math.min(5, Math.round(plant.avg_rating ?? 5))
        );
        const isWishlisted = wishlistIds.includes(plant.id);

        return (
          <article key={plant.id} className="popular-card">
          <div className="popular-card-image-wrapper">
            {showSalesBadge && salesBadgeLabel ? (
              <div className="seller-badge">{salesBadgeLabel(index, plant)}</div>
            ) : null}

            <img
              src={
                plant.image
                  ? `${apiBaseUrl}/storage/${plant.image}`
                  : "/images/placeholder-plant.jpg"
              }
              alt={plant.name}
              className="popular-card-image"
              onError={(event) => {
                (event.target as HTMLImageElement).src =
                  "/images/placeholder-plant.jpg";
              }}
              onClick={() => onPlantClick(plant.id)}
            />

            {showWishlistButton ? (
              <button
                className={`popular-heart-btn ${isWishlisted ? "active" : ""}`}
                type="button"
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                aria-pressed={isWishlisted}
                disabled={wishlistBusyId === plant.id}
                onClick={() => onToggleWishlist?.(plant.id)}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            ) : null}
          </div>

          <div className="popular-card-body">
            <h3 className="popular-card-name">{plant.name}</h3>
            <p className="popular-card-category">{plant.category || "Indoor"}</p>
            <div className="popular-card-rating">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star
                  key={starIndex}
                  size={14}
                  className={
                    starIndex < roundedRating
                      ? "popular-star-filled"
                      : "popular-star-empty"
                  }
                />
              ))}
              <span className="popular-rating-text">({roundedRating})</span>
            </div>

            {showSalesBadge ? (
              <div className="popular-card-rating">
                <span className="popular-rating-text">
                  Sold: {plant.total_sold ?? 0} units
                </span>
              </div>
            ) : null}

            <div className="popular-card-footer">
              <span className="popular-card-price">
                Rs {Number(plant.price).toFixed(2)}
              </span>
              <button
                className="popular-add-btn"
                type="button"
                onClick={() => onPlantClick(plant.id)}
              >
                View all
              </button>
            </div>
          </div>
          </article>
        );
      })}
    </div>
  );
}

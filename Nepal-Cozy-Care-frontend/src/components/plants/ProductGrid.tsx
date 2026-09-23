import type { Plant } from "../../types/plant";
import { useAddToCart } from "../../hooks/useAddToCart";
import ProductCard from "../common/ProductCard";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

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
  const { cartBusyId, addToCart } = useAddToCart(API);

  if (error) {
    return (
      <div
        className="plants-error"
        style={{
          padding: "2rem",
          textAlign: "center",
          background: "#fee2e2",
          borderRadius: "8px",
          margin: "2rem 0",
        }}
      >
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
        <button
          onClick={fetchPlants}
          style={{
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (plants.length === 0 && !loading) {
    return (
      <div
        className="plants-no-results"
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="plants-grid">
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="product-card skeleton-card">
              <div className="product-image-wrapper skeleton-box" />
              <div className="product-info">
                <div className="skeleton-line" style={{ width: "70%", height: "1.2rem" }} />
                <div className="skeleton-line" style={{ width: "50%", height: "0.9rem" }} />
                <div
                  className="skeleton-line"
                  style={{ width: "40%", height: "1.1rem", marginTop: "0.5rem" }}
                />
              </div>
            </div>
          ))
        : plants.map((plant, index) => {
            return (
              <ProductCard
                key={plant.id}
                product={plant}
                index={index}
                badge={badgeLabel ? badgeLabel(plant, index) : undefined}
                isWishlisted={wishlistIds.includes(plant.id)}
                isWishlistBusy={wishlistBusyId === plant.id}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={(_id, name) => void addToCart({ id: plant.id, name })}
                isCartBusy={cartBusyId === plant.id}
                showSoldCount={showSoldCount}
              />
            );
          })}
    </div>
  );
}

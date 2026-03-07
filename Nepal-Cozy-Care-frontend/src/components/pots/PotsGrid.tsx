import { Heart, ShoppingCart } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Pot = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  is_active?: boolean;
};

interface PotsGridProps {
  filteredPots: Pot[];
  pots: Pot[];
  loading: boolean;
  wishlistIds: number[];
  toggleWishlist: (potId: number) => void;
  handleAddToCart: (pot: Pot) => void;
}

export default function PotsGrid({
  filteredPots,
  pots,
  loading,
  wishlistIds,
  toggleWishlist,
  handleAddToCart,
}: PotsGridProps) {
  if (loading) {
    return (
      <main className="pots-main">
        <div className="pots-loading">Loading pots...</div>
      </main>
    );
  }

  return (
    <main className="pots-main">
      <div className="pots-info">
        <p>
          Showing {filteredPots.length} of {pots.length} pots
        </p>
      </div>

      {filteredPots.length === 0 ? (
        <div className="pots-empty">
          <p>No pots found matching your criteria.</p>
        </div>
      ) : (
        <div className="pots-grid">
          {filteredPots.map((pot) => (
            <div key={pot.id} className="pot-card">
              <div className="pot-image-container">
                <div className="pot-image-placeholder">
                  {pot.image ? (
                    <img
                      src={`${API}/storage/${pot.image}`}
                      alt={pot.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/placeholder-pot.jpg";
                      }}
                    />
                  ) : (
                    <div className="placeholder-text">No Image</div>
                  )}
                </div>
                <button
                  className={`wishlist-btn ${
                    wishlistIds.includes(pot.id) ? "active" : ""
                  }`}
                  onClick={() => toggleWishlist(pot.id)}
                  title="Add to wishlist"
                >
                  <Heart
                    size={20}
                    fill={wishlistIds.includes(pot.id) ? "currentColor" : "none"}
                  />
                </button>
                {pot.stock <= 10 && pot.stock > 0 && (
                  <div className="stock-warning">Low Stock</div>
                )}
                {pot.stock === 0 && <div className="out-of-stock">Out of Stock</div>}
              </div>

              <div className="pot-info">
                <h3 className="pot-name">{pot.name}</h3>
                <p className="pot-category">{pot.category}</p>
                <p className="pot-stock">
                  {pot.stock > 0 ? `In stock: ${pot.stock}` : "Out of stock"}
                </p>

                <div className="pot-footer">
                  <span className="pot-price">Rs. {Number(pot.price).toFixed(2)}</span>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(pot)}
                    disabled={pot.stock === 0}
                    title={pot.stock === 0 ? "Out of stock" : "Add to cart"}
                  >
                    <ShoppingCart size={18} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

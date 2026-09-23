import ProductCard from "../common/ProductCard";

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
        <div className="pots-loading">Loading accessories & pots...</div>
      </main>
    );
  }

  return (
    <main className="pots-main">
      <div className="pots-info">
        <p>
          Showing {filteredPots.length} of {pots.length} items
        </p>
      </div>

      {filteredPots.length === 0 ? (
        <div className="pots-empty">
          <p>No pots or accessories found matching your criteria.</p>
        </div>
      ) : (
        <div className="plants-grid">
          {filteredPots.map((pot, index) => (
            <ProductCard
              key={pot.id}
              product={pot}
              index={index}
              isWishlisted={wishlistIds.includes(pot.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={() => handleAddToCart(pot)}
              defaultFallbackImage="/images/pot1.jpg"
            />
          ))}
        </div>
      )}
    </main>
  );
}

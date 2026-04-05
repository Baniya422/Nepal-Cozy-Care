import { Heart, Trash2 } from "lucide-react";
import type { WishlistEntry } from "../types";

type AccountWishlistSectionProps = {
  wishlist: WishlistEntry[];
  wishlistBusyPlantId: number | null;
  onExplorePlants: () => void;
  onOpenProduct: (plantId: number) => void;
  onRemoveWishlistItem: (plantId: number) => void;
  buildImageUrl: (image?: string | null) => string;
  formatCurrency: (amount?: number | null) => string;
};

export default function AccountWishlistSection({
  wishlist,
  wishlistBusyPlantId,
  onExplorePlants,
  onOpenProduct,
  onRemoveWishlistItem,
  buildImageUrl,
  formatCurrency,
}: AccountWishlistSectionProps) {
  return (
    <div className="account-section-stack">
      {wishlist.length === 0 ? (
        <div className="account-empty-state account-card">
          <Heart size={28} />
          <h3>Your wishlist is empty</h3>
          <p>Save plants while browsing to compare them later.</p>
          <button type="button" className="account-primary-btn" onClick={onExplorePlants}>
            Explore Plants
          </button>
        </div>
      ) : (
        <div className="account-wishlist-grid">
          {wishlist.map((entry) => {
            const plant = entry.plant;
            const plantId = plant?.id ?? entry.plant_id;

            return (
              <article key={entry.id} className="account-card account-wishlist-card">
                <img src={buildImageUrl(plant?.image)} alt={plant?.name || "Plant"} />
                <div className="account-wishlist-card-body">
                  <h3>{plant?.name || "Saved plant"}</h3>
                  <p>{formatCurrency(plant?.price)}</p>
                  <span>
                    {[plant?.room, plant?.size].filter(Boolean).join(" | ") || "Saved for later"}
                  </span>
                </div>
                <div className="account-wishlist-actions">
                  <button type="button" className="account-primary-btn" onClick={() => onOpenProduct(plantId)}>
                    View Product
                  </button>
                  <button
                    type="button"
                    className="account-icon-btn"
                    onClick={() => onRemoveWishlistItem(plantId)}
                    disabled={wishlistBusyPlantId === plantId}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

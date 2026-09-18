import { Link } from "react-router-dom";
import { Minus, Plus, X, Store, ShieldCheck } from "lucide-react";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";

type CartItem = {
  id: number;
  plant_id: number;
  quantity: number;
  plant: {
    id: number;
    name: string;
    price: number;
    image?: string;
    shop?: {
      id: number;
      name: string;
      slug: string;
      logo?: string | null;
      is_verified?: boolean;
    };
  };
};

interface CartItemsProps {
  cartItems: CartItem[];
  updating: number | null;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  removeItem: (itemId: number) => void;
}

export default function CartItems({
  cartItems,
  updating,
  updateQuantity,
  removeItem,
}: CartItemsProps) {
  // Group cart items by shop
  const groupedItems = cartItems.reduce<
    Record<string, { shopName: string; shopSlug: string; isVerified: boolean; items: CartItem[] }>
  >((acc, item) => {
    const shop = item.plant?.shop;
    const shopKey = shop?.slug || "nepal-cozy-care";
    const shopName = shop?.name || "Nepal Cozy Care";
    const isVerified = shop?.is_verified ?? true;

    if (!acc[shopKey]) {
      acc[shopKey] = { shopName, shopSlug: shopKey, isVerified, items: [] };
    }
    acc[shopKey].items.push(item);
    return acc;
  }, {});

  return (
    <div className="cart-items-section">
      <div className="cart-table-header">
        <span className="cart-header-item">Item</span>
        <span className="cart-header-price">Price</span>
        <span className="cart-header-quantity">Quantity</span>
        <span className="cart-header-total">Total</span>
      </div>

      <div className="cart-items-list space-y-6">
        {Object.entries(groupedItems).map(([shopKey, group]) => {
          const shopSubtotal = group.items.reduce(
            (sum, item) => sum + item.plant.price * item.quantity,
            0
          );

          return (
            <div
              key={shopKey}
              className="cart-shop-group"
            >
              {/* Shop Group Header */}
              <div className="cart-shop-header">
                <div className="cart-shop-info">
                  <Store size={16} className="cart-shop-icon" />
                  <span className="cart-shop-label">Sold & Shipped by:</span>
                  <Link
                    to={`/shops/${group.shopSlug}`}
                    className="cart-shop-name-link"
                  >
                    {group.shopName}
                  </Link>
                  {group.isVerified && (
                    <span className="cart-shop-verified-badge" title="Verified Partner Nursery">
                      <ShieldCheck size={14} />
                    </span>
                  )}
                </div>
                <span className="cart-shop-subtotal-badge">
                  Shop Subtotal: Rs. {shopSubtotal.toFixed(2)}
                </span>
              </div>

              {/* Items from this shop */}
              <div className="cart-shop-items">
                {group.items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <img
                        src={resolveImageUrl(item.plant.image, DEFAULT_PLANT_IMAGE)}
                        alt={item.plant.name}
                        className="cart-item-image"
                        onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
                      />
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.plant.name}</h3>
                        <Link
                          to={`/shops/${group.shopSlug}`}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:underline mb-1"
                        >
                          <Store size={11} className="text-emerald-600" />
                          <span>{group.shopName}</span>
                        </Link>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          <X size={14} />
                          Remove Item
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      Rs {Number(item.plant.price).toFixed(2)}
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="cart-item-total">
                      Rs {(item.plant.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Link to="/plants" className="cart-continue-link">
        ← Continue Shopping
      </Link>
    </div>
  );
}

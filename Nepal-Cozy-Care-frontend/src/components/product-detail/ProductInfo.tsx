import { Link } from "react-router-dom";
import { Star, ShoppingCart, Store, ShieldCheck } from "lucide-react";

interface ProductInfoProps {
  name: string;
  price: number;
  size?: string;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  shop?: {
    id: number;
    name: string;
    slug: string;
    is_verified?: boolean;
    logo?: string | null;
  };
}

export default function ProductInfo({
  name,
  price,
  size,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  shop,
}: ProductInfoProps) {
  const totalPrice = price * quantity;

  return (
    <div className="product-info-section">
      <h1 className="product-title">{name}</h1>

      {shop && (
        <div style={{ marginTop: '0.35rem', marginBottom: '0.65rem' }}>
          <Link
            to={`/shops/${shop.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#065f46',
              textDecoration: 'none',
              background: '#ecfdf5',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid #a7f3d0'
            }}
          >
            <Store size={14} color="#059669" />
            <span>Sold by {shop.name}</span>
            {shop.is_verified && (
              <ShieldCheck size={14} color="#059669" />
            )}
          </Link>
        </div>
      )}
      {}
      <div className="product-rating">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
        ))}
      </div>
      {}
      <div className="product-price">
        <span className="sale-label">Sale price</span>
        <span className="price">Rs {price.toFixed(0)}</span>
      </div>
      {}
      <div className="size-options">
        <span className="option-label">Size Options</span>
        <div className="size-buttons">
          <button className={size === 'Small' ? 'active' : ''}>Small Rs 222</button>
          <button className={size === 'Medium' ? 'active' : ''}>Medium Rs 132</button>
          <button className={size === 'Large' ? 'active' : ''}>Large Rs 999</button>
        </div>
      </div>
      {}
      <div className="purchase-section">
        <div className="total-price">
          <span>Total Price</span>
          <strong>Rs {totalPrice.toFixed(0)}</strong>
        </div>
        <div className="quantity-selector">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
      </div>
      {}
      <div className="action-buttons">
        <button className="btn-add-cart" onClick={onAddToCart}>
          <ShoppingCart size={18} />
          Add To Cart
        </button>
        <button className="btn-buy-now" onClick={onBuyNow}>
          Buy It Now
        </button>
      </div>
    </div>
  );
}

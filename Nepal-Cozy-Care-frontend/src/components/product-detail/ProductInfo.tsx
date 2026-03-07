
import { Star, ShoppingCart } from "lucide-react";

interface ProductInfoProps {
  name: string;
  price: number;
  size?: string;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductInfo({
  name,
  price,
  size,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const totalPrice = price * quantity;

  return (
    <div className="product-info-section">
      <h1 className="product-title">{name}</h1>
      
      {/* Rating */}
      <div className="product-rating">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
        ))}
      </div>

      {/* Price */}
      <div className="product-price">
        <span className="sale-label">Sale price</span>
        <span className="price">Rs {price.toFixed(0)}</span>
      </div>

      {/* Size Options */}
      <div className="size-options">
        <span className="option-label">Size Options</span>
        <div className="size-buttons">
          <button className={size === 'Small' ? 'active' : ''}>Small Rs 222</button>
          <button className={size === 'Medium' ? 'active' : ''}>Medium Rs 132</button>
          <button className={size === 'Large' ? 'active' : ''}>Large Rs 999</button>
        </div>
      </div>

      {/* Total & Quantity */}
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

      {/* Action Buttons */}
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

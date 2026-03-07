import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type CartItem = {
  id: number;
  plant_id: number;
  quantity: number;
  plant: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
};

interface CartItemsProps {
  cartItems: CartItem[];
  updating: number | null;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  removeItem: (itemId: number) => void;
}

export default function CartItems({ cartItems, updating, updateQuantity, removeItem }: CartItemsProps) {
  return (
    <div className="cart-items-section">
      <div className="cart-table-header">
        <span className="cart-header-item">Item</span>
        <span className="cart-header-price">Price</span>
        <span className="cart-header-quantity">Quantity</span>
        <span className="cart-header-total">Total</span>
      </div>

      <div className="cart-items-list">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <img
                src={
                  item.plant.image
                    ? `${API}/storage/${item.plant.image}`
                    : "/images/plant-placeholder.jpg"
                }
                alt={item.plant.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.plant.name}</h3>
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
              ${Number(item.plant.price).toFixed(2)}
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
              ${(item.plant.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <Link to="/plants" className="cart-continue-link">
        ← Continue Shopping
      </Link>
    </div>
  );
}

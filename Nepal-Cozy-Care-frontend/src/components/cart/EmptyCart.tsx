import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="cart-empty">
      <ShoppingBag size={64} className="cart-empty-icon" />
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added any plants yet.</p>
      <button
        className="cart-continue-btn"
        onClick={() => navigate("/plants")}
      >
        Continue Shopping
      </button>
    </div>
  );
}

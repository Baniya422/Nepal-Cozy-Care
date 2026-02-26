import { useNavigate } from "react-router-dom";

interface CartSummaryProps {
  subtotal: number;
  vat: number;
  total: number;
}

export default function CartSummary({ subtotal, vat, total }: CartSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="cart-summary">
      <h2 className="cart-summary-title">Summary / Items</h2>

      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      <div className="cart-summary-row">
        <span>Delivery</span>
        <span className="cart-free">FREE</span>
      </div>

      <div className="cart-summary-row">
        <span>VAT / Taxes</span>
        <span>${vat.toFixed(1)}</span>
      </div>

      <div className="cart-summary-divider"></div>

      <div className="cart-summary-row cart-summary-total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        className="cart-checkout-btn"
        onClick={() => navigate("/checkout")}
      >
        Checkout
      </button>
    </div>
  );
}

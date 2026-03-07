import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { ChevronDown, Truck, CreditCard, MapPin } from "lucide-react";
import "../styles/checkout.css";

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

type FormData = {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  payment_method: string;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const [formData, setFormData] = useState<FormData>({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    payment_method: "credit-card",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data?.cart || []);
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load cart items");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Error loading cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      payment_method: method,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.shipping_name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!formData.shipping_phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!formData.shipping_address.trim()) {
      setError("Please enter your shipping address");
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_name: formData.shipping_name,
          shipping_phone: formData.shipping_phone,
          shipping_address: formData.shipping_address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Order placed successfully
        navigate("/track-order", {
          state: {
            success: true,
            orderNumber: data.data?.order?.id,
            message: "Order placed successfully!",
          },
        });
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Error placing order. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = 0;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="checkout-page">
          <div className="checkout-loading">Loading checkout...</div>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="checkout-page">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before checking out.</p>
            <button className="checkout-continue-btn" onClick={() => navigate("/plants")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-page">
        <div className="checkout-container">
          <h1 className="checkout-title">Checkout</h1>

          {error && <div className="checkout-error">{error}</div>}

          <div className="checkout-content">
            {/* Left Column: Review Items & Shipping */}
            <div className="checkout-left">
              {/* Order Review */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">
                  <span className="checkout-icon">📦</span>
                  Order Review
                </h2>
                <div className="checkout-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item">
                      <div
                        className="checkout-item-header"
                        onClick={() => toggleItemExpansion(item.id)}
                      >
                        <div className="checkout-item-main">
                          {item.plant.image && (
                            <img
                              src={`${API}/storage/${item.plant.image}`}
                              alt={item.plant.name}
                              className="checkout-item-image"
                            />
                          )}
                          <div className="checkout-item-details">
                            <h3>{item.plant.name}</h3>
                            <p className="checkout-item-qty">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="checkout-item-price">
                          <span className="checkout-price">
                            Rs {(item.plant.price * item.quantity).toFixed(2)}
                          </span>
                          <ChevronDown
                            size={20}
                            className={`checkout-expand-icon ${
                              expandedItems[item.id] ? "expanded" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {expandedItems[item.id] && (
                        <div className="checkout-item-expanded">
                          <div className="checkout-item-row">
                            <span>Unit Price:</span>
                            <span>Rs {Number(item.plant.price).toFixed(2)}</span>
                          </div>
                          <div className="checkout-item-row">
                            <span>Quantity:</span>
                            <span>{item.quantity}</span>
                          </div>
                          <div className="checkout-item-row checkout-item-total">
                            <span>Subtotal:</span>
                            <span>Rs {(item.plant.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">
                  <MapPin size={20} />
                  Shipping Details
                </h2>
                <div className="checkout-form">
                  <div className="checkout-form-group">
                    <label htmlFor="shipping_name">Full Name *</label>
                    <input
                      type="text"
                      id="shipping_name"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="shipping_phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="shipping_phone"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="shipping_address">Shipping Address *</label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete shipping address"
                      className="checkout-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">
                  <CreditCard size={20} />
                  Payment Method
                </h2>
                <div className="checkout-payment-options">
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="credit-card"
                      checked={formData.payment_method === "credit-card"}
                      onChange={() => handlePaymentChange("credit-card")}
                    />
                    <span className="checkout-payment-label">
                      <span className="checkout-payment-icon">💳</span>
                      Credit / Debit Card
                    </span>
                  </label>

                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="esewa"
                      checked={formData.payment_method === "esewa"}
                      onChange={() => handlePaymentChange("esewa")}
                    />
                    <span className="checkout-payment-label">
                      <span className="checkout-payment-icon">🏦</span>
                      eSewa
                    </span>
                  </label>

                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="khalti"
                      checked={formData.payment_method === "khalti"}
                      onChange={() => handlePaymentChange("khalti")}
                    />
                    <span className="checkout-payment-label">
                      <span className="checkout-payment-icon">📱</span>
                      Khalti
                    </span>
                  </label>

                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === "cod"}
                      onChange={() => handlePaymentChange("cod")}
                    />
                    <span className="checkout-payment-label">
                      <span className="checkout-payment-icon">🚚</span>
                      Cash on Delivery
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="checkout-right">
              <div className="checkout-summary">
                <h2 className="checkout-summary-title">Order Summary</h2>

                <div className="checkout-summary-section">
                  <h3 className="checkout-summary-subtitle">Items ({cartItems.length})</h3>
                  <div className="checkout-summary-items">
                    {cartItems.map((item) => (
                      <div key={item.id} className="checkout-summary-item">
                        <span className="checkout-summary-item-name">
                          {item.plant.name} x {item.quantity}
                        </span>
                        <span className="checkout-summary-item-price">
                          Rs {(item.plant.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="checkout-summary-divider"></div>

                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>

                <div className="checkout-summary-row">
                  <span>
                    <Truck size={16} />
                    Delivery
                  </span>
                  <span className="checkout-free">FREE</span>
                </div>

                <div className="checkout-summary-row">
                  <span>Tax (10%)</span>
                  <span>Rs {tax.toFixed(2)}</span>
                </div>

                <div className="checkout-summary-divider"></div>

                <div className="checkout-summary-row checkout-summary-total">
                  <span>Total Amount</span>
                  <span>Rs {total.toFixed(2)}</span>
                </div>

                <button
                  className="checkout-place-order-btn"
                  onClick={placeOrder}
                  disabled={submitting}
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>

                <button
                  className="checkout-continue-shopping-btn"
                  onClick={() => navigate("/cart")}
                  disabled={submitting}
                >
                  Back to Cart
                </button>
              </div>

              {/* Delivery Info */}
              <div className="checkout-info-card">
                <h3 className="checkout-info-title">📦 Delivery Information</h3>
                <ul className="checkout-info-list">
                  <li>Free delivery on all orders across Nepal</li>
                  <li>Delivery typically takes 3-5 business days</li>
                  <li>Track your order after placement</li>
                  <li>Secure and encrypted payment processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

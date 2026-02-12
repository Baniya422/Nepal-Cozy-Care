import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/cart.css";

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

type RecommendedPlant = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recommendedPlants, setRecommendedPlants] = useState<RecommendedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
    fetchRecommendedPlants();
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
      } else {
        console.error("Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedPlants = async () => {
    try {
      const response = await fetch(`${API}/api/plants?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecommendedPlants(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching recommended plants:", error);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(itemId);

    try {
      const response = await fetch(`${API}/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(`${API}/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const addToCart = async (plantId: number) => {
    try {
      const response = await fetch(`${API}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plant_id: plantId, quantity: 1 }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const delivery = subtotal > 0 ? 0 : 0; // FREE delivery
  const vat = subtotal * 0.1; // 10% VAT
  const total = subtotal + delivery + vat;

  if (loading) {
    return (
      <Layout>
        <div className="cart-page">
          <div className="cart-loading">Loading your cart...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Cart</h1>

          {cartItems.length === 0 ? (
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
          ) : (
            <>
              <div className="cart-content">
                {/* Cart Items Table */}
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
                          ${item.plant.price.toFixed(2)}
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

                {/* Order Summary */}
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
              </div>
            </>
          )}

          {/* Recommended Products */}
          {recommendedPlants.length > 0 && (
            <section className="cart-recommended">
              <h2 className="cart-recommended-title">You Might Also Like These!</h2>
              <div className="cart-recommended-grid">
                {recommendedPlants.map((plant) => (
                  <div key={plant.id} className="cart-recommended-card">
                    <div className="cart-recommended-image-wrapper">
                      <img
                        src={
                          plant.image
                            ? `${API}/storage/${plant.image}`
                            : "/images/plant-placeholder.jpg"
                        }
                        alt={plant.name}
                        className="cart-recommended-image"
                      />
                    </div>
                    <h3 className="cart-recommended-name">{plant.name}</h3>
                    <p className="cart-recommended-price">${plant.price}</p>
                    <button
                      className="cart-recommended-add-btn"
                      onClick={() => addToCart(plant.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}

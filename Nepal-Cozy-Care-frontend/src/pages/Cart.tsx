import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import CartItems from "../components/cart/CartItems";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";
import RecommendedProducts from "../components/cart/RecommendedProducts";
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
        const plantsArray = data.data?.plants || data.data?.data || data.data || [];
        setRecommendedPlants(Array.isArray(plantsArray) ? plantsArray : []);
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
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

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
            <EmptyCart />
          ) : (
            <>
              <div className="cart-content">
                <CartItems
                  cartItems={cartItems}
                  updating={updating}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
                <CartSummary
                  subtotal={subtotal}
                  vat={vat}
                  total={total}
                />
              </div>
            </>
          )}

          <RecommendedProducts
            recommendedPlants={recommendedPlants}
            addToCart={addToCart}
          />
        </div>
      </div>
    </Layout>
  );
}

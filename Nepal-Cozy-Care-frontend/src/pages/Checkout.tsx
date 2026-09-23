import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  CreditCard,
  MapPin,
  Truck,
  Tag,
  AlertCircle,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import DeliveryLocationPicker from "../components/checkout/DeliveryLocationPicker";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../utils/imageUrl";
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
    shop?: {
      id: number;
      name: string;
      slug: string;
      is_verified?: boolean;
      logo?: string | null;
    };
  };
};

type FormData = {
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  location_notes: string;
  preferred_contact_method: "phone" | "whatsapp" | "email";
  payment_method: "cod";
};

interface DeliveryQuote {
  road_distance_km: number;
  delivery_fee: number;
  is_free: boolean;
  message: string;
  estimated_delivery_window: string;
  pricing_method: string;
  destination_label?: string;
}

interface AppliedPromo {
  code: string;
  discount_amount: number;
  message: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  // Form details
  const [formData, setFormData] = useState<FormData>({
    shipping_name: "",
    shipping_phone: "",
    shipping_city: "",
    shipping_address: "",
    location_notes: "",
    preferred_contact_method: "phone",
    payment_method: "cod",
  });

  // Location & Delivery Quote state
  const [deliveryLat, setDeliveryLat] = useState<number | null>(27.7172); // Default Kathmandu
  const [deliveryLng, setDeliveryLng] = useState<number | null>(85.324);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void fetchCart();
  }, [navigate, token]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
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
    } catch (fetchError) {
      console.error("Error fetching cart:", fetchError);
      setError("Error loading cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.plant.price * item.quantity,
    0
  );

  const discountAmount = appliedPromo?.discount_amount || 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);

  // Recalculate road delivery quote whenever destination coordinates or discounted subtotal changes
  const fetchDeliveryQuote = useCallback(
    async (lat: number, lng: number, subtotalToEvaluate: number) => {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const response = await fetch(`${API}/api/delivery/quote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            destination_lat: lat,
            destination_lng: lng,
            subtotal: subtotalToEvaluate,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setDeliveryQuote(null);
          setQuoteError(
            data.message ||
              "Could not calculate road delivery route for this location. Please adjust your pin and try again."
          );
        } else {
          setDeliveryQuote(data.data);
          setQuoteError(null);
        }
      } catch (err: any) {
        setDeliveryQuote(null);
        setQuoteError(
          "Routing service is currently unreachable. Please retry or adjust pin location."
        );
      } finally {
        setQuoteLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (deliveryLat && deliveryLng && cartItems.length > 0) {
      void fetchDeliveryQuote(deliveryLat, deliveryLng, discountedSubtotal);
    }
  }, [deliveryLat, deliveryLng, discountedSubtotal, cartItems.length, fetchDeliveryQuote]);

  const handleLocationChange = (lat: number, lng: number) => {
    setDeliveryLat(lat);
    setDeliveryLng(lng);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Promo code handlers
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setValidatingPromo(true);
    setPromoMessage(null);

    try {
      const res = await fetch(`${API}/api/promo/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          code: promoInput.trim().toUpperCase(),
          subtotal: cartSubtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setPromoMessage({
          type: "error",
          text: data.message || "Invalid or ineligible promo code.",
        });
      } else {
        setAppliedPromo({
          code: data.code,
          discount_amount: data.discount_amount,
          message: data.message,
        });
        setPromoMessage({
          type: "success",
          text: `${data.code} applied! Saved NPR ${data.discount_amount.toLocaleString()}`,
        });
        setPromoInput("");
      }
    } catch (err: any) {
      setPromoMessage({
        type: "error",
        text: "Failed to validate promo code. Please try again.",
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoMessage(null);
  };

  const validateForm = () => {
    if (!formData.shipping_name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!formData.shipping_phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!formData.shipping_city.trim()) {
      setError("Please enter your city or delivery area");
      return false;
    }
    if (!formData.shipping_address.trim()) {
      setError("Please enter your shipping address");
      return false;
    }
    if (!deliveryLat || !deliveryLng) {
      setError("Please adjust or confirm your delivery pin on the map");
      return false;
    }
    if (quoteError) {
      setError(
        "Cannot place order with delivery quote error: " + quoteError
      );
      return false;
    }
    if (!deliveryQuote) {
      setError("Delivery route is still calculating. Please wait a moment.");
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
          Accept: "application/json",
        },
        body: JSON.stringify({
          shipping_name: formData.shipping_name,
          shipping_phone: formData.shipping_phone,
          shipping_city: formData.shipping_city,
          shipping_address: formData.shipping_address,
          location_notes: formData.location_notes,
          preferred_contact_method: formData.preferred_contact_method,
          payment_method: "cod",
          delivery_latitude: deliveryLat,
          delivery_longitude: deliveryLng,
          road_distance_km: deliveryQuote?.road_distance_km,
          delivery_fee: deliveryQuote ? deliveryQuote.delivery_fee : 0,
          promo_code: appliedPromo ? appliedPromo.code : null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Failed to place order. Please try again.");
        return;
      }

      window.dispatchEvent(new Event("cozycare:cart-updated"));
      navigate("/track-order", {
        state: {
          success: true,
          orderNumber: data.data?.order?.id,
          message: "Order placed successfully! Cash on delivery is recorded.",
        },
      });
    } catch (placeOrderError) {
      console.error("Error placing order:", placeOrderError);
      setError("Error placing order. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryFee = deliveryQuote ? deliveryQuote.delivery_fee : 0;
  const finalTotal = discountedSubtotal + deliveryFee;

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems((previous) => ({
      ...previous,
      [itemId]: !previous[itemId],
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
            <p>Add plants to your cart before checking out.</p>
            <button className="checkout-continue-btn" onClick={() => navigate("/plants")}>
              Browse Plants
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

          {error && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="checkout-content">
            <div className="checkout-left">
              {/* Order Items Review */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">
                  <span className="checkout-icon">Order</span>
                  Order Review ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                </h2>
                <div className="checkout-items space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", padding: "0.75rem", background: "#fff" }}>
                      <div
                        className="checkout-item-header"
                        onClick={() => toggleItemExpansion(item.id)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                      >
                        <div className="checkout-item-main" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img
                            src={resolveImageUrl(item.plant.image, DEFAULT_PLANT_IMAGE)}
                            alt={item.plant.name}
                            className="checkout-item-image"
                            onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                          />
                          <div className="checkout-item-details">
                            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{item.plant.name}</h3>
                            <p className="checkout-item-qty" style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                              Qty: {item.quantity} × Rs {Number(item.plant.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="checkout-item-price" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className="checkout-price" style={{ fontWeight: 600 }}>
                            Rs {(item.plant.price * item.quantity).toFixed(2)}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`checkout-expand-icon ${expandedItems[item.id] ? "expanded" : ""}`}
                          />
                        </div>
                      </div>
                      {expandedItems[item.id] && (
                        <div className="checkout-item-expanded" style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed #e5e7eb", fontSize: "0.85rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Unit Price:</span>
                            <span>Rs {Number(item.plant.price).toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Quantity:</span>
                            <span>{item.quantity}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Delivery Location Section */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">
                  <MapPin size={20} />
                  Delivery Address & GPS Pin
                </h2>
                <div className="checkout-form">
                  <div className="checkout-form-group">
                    <label htmlFor="shipping_name">Full Recipient Name *</label>
                    <input
                      type="text"
                      id="shipping_name"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Aarav Sharma"
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="shipping_phone">Phone Number (For Delivery Rider) *</label>
                    <input
                      type="tel"
                      id="shipping_phone"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9841000000"
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="shipping_city">City / Area *</label>
                    <input
                      type="text"
                      id="shipping_city"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleInputChange}
                      placeholder="Kathmandu, Lalitpur, Bhaktapur..."
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="shipping_address">Street Address / Colony / Tole *</label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="e.g. House 42, Ward 3, Shanti Marga"
                      className="checkout-textarea"
                      rows={2}
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="location_notes">Landmark & House Details (Optional)</label>
                    <textarea
                      id="location_notes"
                      name="location_notes"
                      value={formData.location_notes}
                      onChange={handleInputChange}
                      placeholder="Near Bhatbhateni supermarket, 2nd floor, green gate"
                      className="checkout-textarea"
                      rows={2}
                    />
                  </div>

                  {/* Leaflet Map Interactive Pin Component */}
                  <DeliveryLocationPicker
                    latitude={deliveryLat}
                    longitude={deliveryLng}
                    onChange={handleLocationChange}
                  />

                  {/* Real-time Delivery Route Quote Card */}
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.85rem 1rem",
                      borderRadius: "8px",
                      background: quoteError
                        ? "#fef2f2"
                        : deliveryQuote?.is_free
                        ? "#ecfdf5"
                        : "#f8fafc",
                      border: `1px solid ${
                        quoteError
                          ? "#fecaca"
                          : deliveryQuote?.is_free
                          ? "#a7f3d0"
                          : "#e2e8f0"
                      }`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Truck size={18} color={quoteError ? "#dc2626" : deliveryQuote?.is_free ? "#059669" : "#2563eb"} />
                      <strong style={{ fontSize: "0.9rem" }}>
                        {quoteLoading
                          ? "Calculating road route from nursery..."
                          : quoteError
                          ? "Delivery Route Alert"
                          : deliveryQuote?.is_free
                          ? "Free Delivery Eligible!"
                          : "Standard Distance-Based Delivery"}
                      </strong>
                    </div>

                    {quoteLoading ? (
                      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>
                        Querying road distance and live delivery rate...
                      </div>
                    ) : quoteError ? (
                      <div style={{ fontSize: "0.8rem", color: "#991b1b", marginTop: "0.25rem" }}>
                        {quoteError}
                      </div>
                    ) : deliveryQuote ? (
                      <div style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "#374151" }}>
                        <div>{deliveryQuote.message}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                          Road Distance: <strong>{deliveryQuote.road_distance_km} km</strong> | Estimated Dispatch: {deliveryQuote.estimated_delivery_window}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="checkout-form-group" style={{ marginTop: "1rem" }}>
                    <label htmlFor="preferred_contact_method">Preferred Contact for Rider Call *</label>
                    <select
                      id="preferred_contact_method"
                      name="preferred_contact_method"
                      value={formData.preferred_contact_method}
                      onChange={handleInputChange}
                      className="checkout-input"
                    >
                      <option value="phone">Direct Phone Call</option>
                      <option value="whatsapp">WhatsApp Message</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method - Enforce Cash On Delivery ONLY */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">
                  <CreditCard size={20} />
                  Payment Method
                </h2>

                <div className="checkout-payment-options">
                  <label
                    className="checkout-payment-option selected"
                    style={{
                      border: "2px solid #059669",
                      background: "#f0fdf4",
                      padding: "1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={true}
                      readOnly
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "#065f46" }}>
                        Cash on Delivery (COD)
                      </div>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#047857" }}>
                        Pay safely in cash or scan rider's Fonepay/eSewa QR code when your healthy plants arrive at your door.
                      </p>
                    </div>
                  </label>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>
                  Online prepaid gateways are disabled for initial launch. New orders start as unpaid until confirmed by customer delivery.
                </div>
              </div>
            </div>

            {/* Order Summary & Totals */}
            <div className="checkout-right">
              <div className="checkout-summary">
                <h2 className="checkout-summary-title">Order Summary</h2>

                {/* Promo Code Box */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
                    <Tag size={15} color="#059669" />
                    <span>Have a Promo Code?</span>
                  </label>

                  {appliedPromo ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.5rem 0.75rem",
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: "6px",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#065f46" }}>{appliedPromo.code}</strong>
                        <span style={{ fontSize: "0.8rem", color: "#059669", marginLeft: "0.5rem" }}>
                          -NPR {appliedPromo.discount_amount.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        style={{ textTransform: "uppercase", letterSpacing: "1px" }}
                        className="checkout-input"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      />
                      <button
                        type="submit"
                        disabled={validatingPromo || !promoInput.trim()}
                        style={{
                          padding: "0 1rem",
                          background: "#059669",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: 600,
                          cursor: validatingPromo || !promoInput.trim() ? "not-allowed" : "pointer",
                        }}
                      >
                        {validatingPromo ? "..." : "Apply"}
                      </button>
                    </form>
                  )}

                  {promoMessage && (
                    <div
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.75rem",
                        color: promoMessage.type === "success" ? "#059669" : "#dc2626",
                      }}
                    >
                      {promoMessage.text}
                    </div>
                  )}
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-row">
                  <span>Product Subtotal</span>
                  <span>Rs {cartSubtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="checkout-summary-row" style={{ color: "#059669" }}>
                    <span>Promo Discount ({appliedPromo.code})</span>
                    <span>- Rs {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {appliedPromo && (
                  <div className="checkout-summary-row" style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    <span>Subtotal After Discount</span>
                    <span>Rs {discountedSubtotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="checkout-summary-row">
                  <span>
                    <Truck size={16} />
                    Road Delivery Fee {deliveryQuote ? `(${deliveryQuote.road_distance_km} km)` : ""}
                  </span>
                  <span>
                    {quoteLoading ? (
                      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Calculating...</span>
                    ) : deliveryQuote?.is_free ? (
                      <span className="checkout-free" style={{ color: "#059669", fontWeight: "bold" }}>FREE</span>
                    ) : (
                      `Rs ${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-row checkout-summary-total">
                  <span>Total Amount (COD)</span>
                  <span>Rs {finalTotal.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  className="checkout-place-order-btn"
                  onClick={placeOrder}
                  disabled={submitting || quoteLoading || Boolean(quoteError)}
                >
                  {submitting
                    ? "Placing Order..."
                    : quoteError
                    ? "Adjust Delivery Location to Continue"
                    : "Place Order (Cash on Delivery)"}
                </button>

                <button
                  type="button"
                  className="checkout-continue-shopping-btn"
                  onClick={() => navigate("/cart")}
                  disabled={submitting}
                >
                  Back to Cart
                </button>
              </div>

              <div className="checkout-info-card" style={{ marginTop: "1rem" }}>
                <h3 className="checkout-info-title">Initial Launch Delivery Policy</h3>
                <ul className="checkout-info-list" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                  <li>
                    <strong>Free Delivery:</strong> Orders with discounted subtotal ≥ NPR 2,000 within 10 km road distance.
                  </li>
                  <li>
                    <strong>Orders under NPR 2,000:</strong> Standard delivery fee applies within 10 km.
                  </li>
                  <li>
                    <strong>Orders beyond 10 km:</strong> Calculated based on actual road distance from our dispatch nursery.
                  </li>
                  <li>
                    Exact road route is verified via GPS coordinates before dispatch.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

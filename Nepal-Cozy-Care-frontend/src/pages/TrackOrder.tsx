import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Box,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  HelpCircle,
  Download,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/trackOrder.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type OrderItem = {
  id: number;
  plant: {
    id: number;
    name: string;
    image?: string;
  };
  quantity: number;
  price: number;
};

type TimelineEvent = {
  status: string;
  label: string;
  completed: boolean;
  date: string | null;
  description: string;
};

type OrderData = {
  id: number;
  status: string;
  tracking_number?: string;
  courier_name?: string;
  courier_tracking_url?: string;
  estimated_delivery_date?: string;
  created_at: string;
  packed_at?: string;
  shipped_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  items: OrderItem[];
};

export default function TrackOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`${API}/api/orders/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.data.order);
        setTimeline(data.data.timeline);
      } else {
        setError(data.message || "Failed to track order");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return <Package size={24} />;
      case "packed":
        return <Box size={24} />;
      case "shipped":
        return <Truck size={24} />;
      case "out_for_delivery":
        return <MapPin size={24} />;
      case "delivered":
        return <CheckCircle size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  const getStatusColor = (status: string, completed: boolean) => {
    if (!completed) return "status-pending";
    switch (status) {
      case "delivered":
        return "status-delivered";
      case "out_for_delivery":
        return "status-out-for-delivery";
      default:
        return "status-completed";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstimatedDelivery = () => {
    if (order?.estimated_delivery_date) {
      return formatDate(order.estimated_delivery_date);
    }
    if (order?.delivered_at) {
      return "Delivered";
    }
    return "Calculating...";
  };

  return (
    <Layout>
      <div className="track-order-page">
        {/* Hero Section */}
        <section className="track-order-hero">
          <div className="track-order-hero-content">
            <h1 className="track-order-hero-title">Track Your Order</h1>
            <p className="track-order-hero-subtitle">
              Enter your order details to check the status of your delivery
            </p>
          </div>
        </section>

        {/* Track Form Section */}
        <section className="track-order-form-section">
          <div className="track-order-container">
            <div className="track-order-form-wrapper">
              <form onSubmit={handleTrack} className="track-order-form">
                <div className="track-order-form-row">
                  <div className="track-order-input-group">
                    <label className="track-order-label">
                      <Package size={16} />
                      Order ID / Tracking Number
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g., 12345"
                      className="track-order-input"
                      required
                    />
                  </div>

                  <div className="track-order-input-group">
                    <label className="track-order-label">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="track-order-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="track-order-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    "Tracking..."
                  ) : (
                    <>
                      <Search size={18} />
                      Track Order
                    </>
                  )}
                </button>

                <p className="track-order-privacy">
                  <AlertCircle size={14} />
                  Your information is secure and only used to verify your order
                </p>
              </form>

              {/* Help Section */}
              <div className="track-order-help">
                <button
                  className="track-order-help-toggle"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle size={16} />
                  Need help finding your order details?
                </button>
                {showHelp && (
                  <div className="track-order-help-content">
                    <p>
                      <strong>Order ID:</strong> Found in your order confirmation email
                      or SMS. It usually looks like "12345".
                    </p>
                    <p>
                      <strong>Email:</strong> Use the same email address you used when
                      placing the order.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="track-order-error-section">
            <div className="track-order-container">
              <div className="track-order-error">
                <AlertCircle size={48} />
                <h3>{error}</h3>
                <p>Please check your order ID and email, then try again.</p>
              </div>
            </div>
          </section>
        )}

        {/* Order Details */}
        {order && (
          <section className="track-order-details-section">
            <div className="track-order-container">
              {/* Order Summary Card */}
              <div className="track-order-summary-card">
                <div className="track-order-summary-header">
                  <div>
                    <h2 className="track-order-summary-title">
                      Order #{order.id}
                    </h2>
                    <p className="track-order-summary-date">
                      Placed on {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <div className="track-order-status-badge">
                    {order.status === "delivered" ? (
                      <>
                        <CheckCircle size={16} />
                        Delivered
                      </>
                    ) : order.status === "out_for_delivery" ? (
                      <>
                        <Truck size={16} />
                        Out for Delivery
                      </>
                    ) : (
                      <>
                        <Package size={16} />
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </>
                    )}
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="track-order-estimated">
                  <Calendar size={20} />
                  <div>
                    <span className="track-order-estimated-label">
                      Estimated Delivery
                    </span>
                    <span className="track-order-estimated-date">
                      {getEstimatedDelivery()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="track-order-timeline-card">
                <h3 className="track-order-section-title">Delivery Progress</h3>
                <div className="track-order-timeline">
                  {timeline.map((event, index) => (
                    <div
                      key={event.status}
                      className={`track-order-timeline-item ${getStatusColor(
                        event.status,
                        event.completed
                      )}`}
                    >
                      <div className="track-order-timeline-icon">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="track-order-timeline-content">
                        <div className="track-order-timeline-header">
                          <span className="track-order-timeline-label">
                            {event.label}
                          </span>
                          <span className="track-order-timeline-date">
                            {formatDate(event.date)}
                          </span>
                        </div>
                        <p className="track-order-timeline-description">
                          {event.description}
                        </p>
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="track-order-timeline-connector" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipment Details */}
              {(order.courier_name || order.tracking_number) && (
                <div className="track-order-shipment-card">
                  <h3 className="track-order-section-title">
                    <Truck size={20} />
                    Shipment Details
                  </h3>
                  <div className="track-order-shipment-grid">
                    {order.courier_name && (
                      <div className="track-order-shipment-item">
                        <span className="track-order-shipment-label">
                          Courier
                        </span>
                        <span className="track-order-shipment-value">
                          {order.courier_name}
                        </span>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div className="track-order-shipment-item">
                        <span className="track-order-shipment-label">
                          Tracking Number
                        </span>
                        <span className="track-order-shipment-value">
                          {order.tracking_number}
                        </span>
                      </div>
                    )}
                  </div>
                  {order.courier_tracking_url && (
                    <a
                      href={order.courier_tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="track-order-tracking-link"
                    >
                      Track on Courier Website
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="track-order-items-card">
                <h3 className="track-order-section-title">
                  <Box size={20} />
                  Order Items
                </h3>
                <div className="track-order-items-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="track-order-item">
                      <img
                        src={
                          item.plant.image
                            ? `${API}/storage/${item.plant.image}`
                            : "/images/plant-placeholder.jpg"
                        }
                        alt={item.plant.name}
                        className="track-order-item-image"
                      />
                      <div className="track-order-item-details">
                        <h4 className="track-order-item-name">
                          {item.plant.name}
                        </h4>
                        <p className="track-order-item-qty">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="track-order-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="track-order-totals">
                  <div className="track-order-total-row">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="track-order-total-row">
                    <span>Delivery Fee</span>
                    <span>
                      {order.delivery_fee === 0
                        ? "FREE"
                        : `$${order.delivery_fee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="track-order-total-row">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="track-order-total-row track-order-grand-total">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="track-order-address-card">
                <h3 className="track-order-section-title">
                  <MapPin size={20} />
                  Delivery Address
                </h3>
                <div className="track-order-address">
                  <p className="track-order-address-name">
                    {order.shipping_name}
                  </p>
                  <p className="track-order-address-text">
                    {order.shipping_address}
                  </p>
                  <p className="track-order-address-phone">
                    <Phone size={14} />
                    {order.shipping_phone}
                  </p>
                </div>
              </div>

              {/* Support Section */}
              <div className="track-order-support">
                <h3 className="track-order-section-title">
                  <HelpCircle size={20} />
                  Need Help?
                </h3>
                <p className="track-order-support-text">
                  If you have any questions about your order, our support team is
                  here to help.
                </p>
                <div className="track-order-support-buttons">
                  <button
                    className="track-order-support-btn track-order-support-btn-primary"
                    onClick={() => navigate("/contact")}
                  >
                    Contact Support
                  </button>
                  <button
                    className="track-order-support-btn track-order-support-btn-secondary"
                    onClick={() => window.print()}
                  >
                    <Download size={16} />
                    Print Order
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

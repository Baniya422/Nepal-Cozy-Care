import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Eye,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
type OrderStatus =
  | "pending"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
type ConfirmationStatus = "pending" | "contacted" | "location_confirmed";
type OrderItem = {
  id: number;
  plant_name: string;
  quantity: number;
  price: number;
  wholesale_unit_cost?: number | null;
  supplier_name?: string | null;
  supplier_id?: number | null;
  supplier_obligation_status?: string | null;
};
type Order = {
  id: number;
  order_id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  date: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  road_distance_km?: number | null;
  delivery_fee: number;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  promo_code?: string | null;
  discount_amount: number;
  cod_collected_amount: number;
  cod_collected_at?: string | null;
  earnings_incomplete: boolean;
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  location_notes?: string | null;
  preferred_contact_method: "phone" | "whatsapp" | "email";
  confirmation_status: ConfirmationStatus;
  confirmation_notes?: string | null;
  contacted_at?: string | null;
  location_confirmed_at?: string | null;
  tracking_number?: string | null;
  courier_name?: string | null;
  notification_email_sent_at?: string | null;
  notification_email_error?: string | null;
  order_items: OrderItem[];
};
const normalizeStatus = (status: string): OrderStatus => {
  const normalized = status === "processing" ? "packed" : status;
  switch (normalized) {
    case "pending":
    case "packed":
    case "shipped":
    case "out_for_delivery":
    case "delivered":
    case "cancelled":
      return normalized;
    default:
      return "pending";
  }
};
const normalizeConfirmationStatus = (status: string): ConfirmationStatus => {
  switch (status) {
    case "contacted":
    case "location_confirmed":
      return status;
    default:
      return "pending";
  }
};
const formatStatusLabel = (status: string) =>
  status
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const transformOrder = (order: any): Order => ({
  id: Number(order?.id ?? 0),
  order_id: order?.order_id || `#ORD-${String(order?.id ?? 0).padStart(3, "0")}`,
  customer: order?.user?.name || order?.shipping_name || "Unknown",
  email: order?.user?.email || "-",
  items: Array.isArray(order?.items) ? order.items.length : 0,
  total: Number(order?.total ?? 0),
  date: String(order?.created_at ?? ""),
  status: normalizeStatus(String(order?.status ?? "pending")),
  payment_method: order?.payment_method || "cod",
  payment_status: order?.payment_status || "pending",
  road_distance_km: order?.road_distance_km ? Number(order.road_distance_km) : null,
  delivery_fee: Number(order?.delivery_fee ?? 0),
  delivery_latitude: order?.delivery_latitude ? Number(order.delivery_latitude) : null,
  delivery_longitude: order?.delivery_longitude ? Number(order.delivery_longitude) : null,
  promo_code: order?.promo_code || null,
  discount_amount: Number(order?.discount_amount ?? 0),
  cod_collected_amount: Number(order?.cod_collected_amount ?? 0),
  cod_collected_at: order?.cod_collected_at ?? null,
  earnings_incomplete: Boolean(order?.earnings_incomplete),
  shipping_name: order?.shipping_name || order?.user?.name || "Unknown",
  shipping_phone: order?.shipping_phone || "-",
  shipping_city: order?.shipping_city || "-",
  shipping_address: order?.shipping_address || "-",
  location_notes: order?.location_notes ?? null,
  preferred_contact_method: (order?.preferred_contact_method || "phone") as
    | "phone"
    | "whatsapp"
    | "email",
  confirmation_status: normalizeConfirmationStatus(String(order?.confirmation_status ?? "pending")),
  confirmation_notes: order?.confirmation_notes ?? null,
  contacted_at: order?.contacted_at ?? null,
  location_confirmed_at: order?.location_confirmed_at ?? null,
  tracking_number: order?.tracking_number ?? null,
  courier_name: order?.courier_name ?? null,
  notification_email_sent_at: order?.notification_email_sent_at ?? null,
  notification_email_error: order?.notification_email_error ?? null,
  order_items: Array.isArray(order?.items)
    ? order.items.map((item: any) => ({
        id: Number(item?.id ?? 0),
        plant_name: item?.plant?.name || "Unknown Plant",
        quantity: Number(item?.quantity ?? 0),
        price: Number(item?.price ?? 0),
        wholesale_unit_cost: item?.wholesale_unit_cost !== null && item?.wholesale_unit_cost !== undefined ? Number(item.wholesale_unit_cost) : null,
        supplier_name: item?.supplier?.name || null,
        supplier_id: item?.supplier_id ? Number(item.supplier_id) : null,
        supplier_obligation_status: item?.supplier_obligation_status || "kept",
      }))
    : [],
});
const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  pending: "packed",
  packed: "shipped",
  shipped: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
  cancelled: null,
};
const normalizePhoneForWhatsApp = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("977")) return digits;
  if (digits.length === 10 && digits.startsWith("9")) return `977${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `977${digits.slice(1)}`;
  return digits;
};
const formatContactMethod = (method: Order["preferred_contact_method"]) => {
  switch (method) {
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "Email";
    default:
      return "Phone Call";
  }
};
export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);
  const [savingConfirmationId, setSavingConfirmationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [showCodModal, setShowCodModal] = useState(false);
  const [codAmount, setCodAmount] = useState("");
  const [codNotes, setCodNotes] = useState("");
  const [busyCod, setBusyCod] = useState(false);
  useEffect(() => {
    void fetchOrders();
  }, []);
  const fetchOrders = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin login required to view orders.");
      }
      const res = await fetch(`${API}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }
      const ordersData = Array.isArray(data.data?.orders) ? data.data.orders : [];
      setOrders(ordersData.map(transformOrder));
    } catch (fetchError) {
      console.error("Error fetching orders:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };
  const replaceOrder = (updatedOrder: Order) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
    setSelectedOrder((currentOrder) =>
      currentOrder?.id === updatedOrder.id ? updatedOrder : currentOrder
    );
  };
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin login required to update orders.");
      }
      setSavingOrderId(orderId);
      setError(null);
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }
      replaceOrder(transformOrder(data.data?.order));
    } catch (updateError) {
      console.error("Error updating order status:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update order status."
      );
    } finally {
      setSavingOrderId(null);
    }
  };
  const handleUpdateConfirmation = async (
    orderId: number,
    payload: {
      confirmation_status?: ConfirmationStatus;
      confirmation_notes?: string;
    }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin login required to update confirmation.");
      }
      setSavingConfirmationId(orderId);
      setError(null);
      const res = await fetch(`${API}/api/orders/${orderId}/confirmation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update confirmation.");
      }
      const updatedOrder = transformOrder(data.data?.order);
      setConfirmationNotes(updatedOrder.confirmation_notes || "");
      replaceOrder(updatedOrder);
    } catch (confirmationError) {
      console.error("Error updating confirmation:", confirmationError);
      setError(
        confirmationError instanceof Error
          ? confirmationError.message
          : "Failed to update confirmation."
      );
    } finally {
      setSavingConfirmationId(null);
    }
  };

  const handleRecordCodCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !codAmount) return;
    setBusyCod(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/suppliers/orders/${selectedOrder.id}/cod-collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(codAmount),
          notes: codNotes || "Customer COD collected",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record COD collection");
      }
      setShowCodModal(false);
      setCodAmount("");
      setCodNotes("");
      void fetchOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyCod(false);
    }
  };

  const handleUpdateObligation = async (itemId: number, obligationStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/suppliers/items/${itemId}/obligation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          obligation_status: obligationStatus,
          reason: `Admin set supplier obligation to ${obligationStatus}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to update obligation");
      void fetchOrders();
      if (selectedOrder) {
        setSelectedOrder((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            order_items: prev.order_items.map((it) =>
              it.id === itemId ? { ...it, supplier_obligation_status: obligationStatus } : it
            ),
          };
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setConfirmationNotes(order.confirmation_notes || "");
    setShowDetailModal(true);
  };
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        [
          order.order_id,
          order.customer,
          order.email,
          order.shipping_phone,
          order.shipping_city,
          order.shipping_address,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [orders, searchQuery]
  );
  const formatPrice = (price: number) => `Rs ${price.toFixed(2)}`;
  const formatDate = (dateString: string | null | undefined) =>
    dateString
      ? new Date(dateString).toLocaleString("en-NP", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Not available";
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "out_for_delivery":
        return <MapPin size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "packed":
        return <Package size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };
  const getConfirmationIcon = (status: ConfirmationStatus) => {
    switch (status) {
      case "location_confirmed":
        return <CheckCircle size={16} />;
      case "contacted":
        return <Phone size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null =>
    statusFlow[currentStatus];
  const canCancelOrder = (status: OrderStatus) => status === "pending" || status === "packed";
  const getActionIcon = (status: OrderStatus) => {
    switch (status) {
      case "packed":
        return <Package size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "out_for_delivery":
        return <MapPin size={16} />;
      case "delivered":
        return <CheckCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };
  const openPhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };
  const openEmail = (email: string, orderId: string) => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Cozy Care Order ${orderId} Confirmation`
    )}`;
  };
  const openWhatsApp = (order: Order) => {
    const phone = normalizePhoneForWhatsApp(order.shipping_phone);
    const message = `Hello ${order.shipping_name}, this is Cozy Care regarding your order ${order.order_id}. We are confirming your delivery address and location details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };
  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Orders Management</h2>
            <p>Manage delivery progress and contact customers to confirm the location before dispatch.</p>
          </div>
        </div>
        {error ? (
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div
              className="admin-card-body"
              style={{ padding: "1rem 1.25rem", color: "#dc2626" }}
            >
              {error}
            </div>
          </div>
        ) : null}
        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by order ID, customer, phone, or city..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading orders...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Delivery</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Order Status</th>
                  <th>Email Alert</th>
                  <th>Contact Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="admin-order-id">{order.order_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer}</div>
                        <div className="admin-email">{order.email}</div>
                      </td>
                      <td>
                        <div>{order.shipping_phone}</div>
                        <div>{order.shipping_city}</div>
                      </td>
                      <td className="admin-price">{formatPrice(order.total)}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        <span className={`admin-status-badge status-${order.status}`}>
                          {getStatusIcon(order.status)}
                          {formatStatusLabel(order.status)}
                        </span>
                        <div style={{ marginTop: "4px" }}>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: order.payment_status === "paid" ? "#ecfdf5" : "#fef3c7",
                              color: order.payment_status === "paid" ? "#065f46" : "#92400e",
                              border: `1px solid ${order.payment_status === "paid" ? "#a7f3d0" : "#fde68a"}`,
                            }}
                          >
                            {order.payment_status === "paid" ? "COD Paid" : "COD Unpaid"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${
                            order.notification_email_sent_at
                              ? "admin-status-active"
                              : order.notification_email_error
                                ? "admin-status-inactive"
                                : "admin-status-pending"
                          }`}
                          title={order.notification_email_error || undefined}
                        >
                          {order.notification_email_sent_at
                            ? "Sent"
                            : order.notification_email_error
                              ? "Failed"
                              : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge status-${order.confirmation_status}`}
                        >
                          {getConfirmationIcon(order.confirmation_status)}
                          {formatStatusLabel(order.confirmation_status)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-action-btn admin-action-view"
                            title="View Details"
                            onClick={() => handleViewDetail(order)}
                          >
                            <Eye size={16} />
                          </button>
                          {nextStatus ? (
                            <button
                              className="admin-action-btn"
                              style={{ background: "#dbeafe", color: "#2563eb" }}
                              title={`Mark as ${formatStatusLabel(nextStatus)}`}
                              disabled={savingOrderId === order.id}
                              onClick={() => void handleUpdateStatus(order.id, nextStatus)}
                            >
                              {getActionIcon(nextStatus)}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filteredOrders.length === 0 ? (
            <div className="admin-empty-state">
              <p>No orders found.</p>
            </div>
          ) : null}
        </div>
        {showDetailModal && selectedOrder ? (
          <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div
              className="admin-modal admin-modal-large"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>Order Details - {selectedOrder.order_id}</h3>
                <button className="admin-modal-close" onClick={() => setShowDetailModal(false)}>
                  &times;
                </button>
              </div>
              <div className="admin-order-detail">
                <div className="admin-order-info">
                  <div className="admin-info-section">
                    <h4>Customer Information</h4>
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.shipping_phone}
                    </p>
                    <p>
                      <strong>Preferred Contact:</strong>{" "}
                      {formatContactMethod(selectedOrder.preferred_contact_method)}
                    </p>
                  </div>
                  <div className="admin-info-section">
                    <h4>Order Information</h4>
                    <p>
                      <strong>Date:</strong> {formatDate(selectedOrder.date)}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`admin-status-badge status-${selectedOrder.status}`}>
                        {formatStatusLabel(selectedOrder.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Total:</strong> {formatPrice(selectedOrder.total)}
                    </p>
                    <p>
                      <strong>Email alert:</strong>{" "}
                      {selectedOrder.notification_email_sent_at
                        ? "Sent"
                        : selectedOrder.notification_email_error
                          ? `Failed - ${selectedOrder.notification_email_error}`
                          : "Pending"}
                    </p>
                    <p>
                      <strong>Courier:</strong> {selectedOrder.courier_name || "Not assigned yet"}
                    </p>
                    <p>
                      <strong>Tracking:</strong>{" "}
                      {selectedOrder.tracking_number || "Not assigned yet"}
                    </p>
                  </div>
                  <div className="admin-info-section">
                    <h4>Shipping Information</h4>
                    <p>
                      <strong>Receiver:</strong> {selectedOrder.shipping_name}
                    </p>
                    <p>
                      <strong>City / Area:</strong> {selectedOrder.shipping_city}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedOrder.shipping_address}
                    </p>
                    <p>
                      <strong>Landmark / Notes:</strong>{" "}
                      {selectedOrder.location_notes || "Not provided"}
                    </p>
                  </div>
                  <div className="admin-info-section">
                    <h4>Payment & Delivery Financials</h4>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: selectedOrder.payment_status === "paid" ? "#ecfdf5" : "#fef3c7",
                          color: selectedOrder.payment_status === "paid" ? "#065f46" : "#92400e",
                          border: `1px solid ${selectedOrder.payment_status === "paid" ? "#a7f3d0" : "#fde68a"}`,
                        }}
                      >
                        {selectedOrder.payment_status === "paid" ? "COD Paid" : "COD Unpaid"}
                      </span>
                    </p>
                    <p>
                      <strong>Cash Collected:</strong> {formatPrice(selectedOrder.cod_collected_amount)}
                      {selectedOrder.payment_status !== "paid" && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          style={{ marginLeft: "0.5rem", padding: "2px 6px", fontSize: "0.75rem" }}
                          onClick={() => {
                            setCodAmount(String(Math.max(0, selectedOrder.total - selectedOrder.cod_collected_amount)));
                            setShowCodModal(true);
                          }}
                        >
                          Record COD
                        </button>
                      )}
                    </p>
                    <p>
                      <strong>Road Distance:</strong> {selectedOrder.road_distance_km ? `${selectedOrder.road_distance_km} km` : "N/A"}
                    </p>
                    <p>
                      <strong>Delivery Fee:</strong> {formatPrice(selectedOrder.delivery_fee)}
                    </p>
                    {selectedOrder.promo_code && (
                      <p>
                        <strong>Promo Code:</strong> {selectedOrder.promo_code} (-{formatPrice(selectedOrder.discount_amount)})
                      </p>
                    )}
                    <p>
                      <strong>Cost Accounting:</strong>{" "}
                      {selectedOrder.earnings_incomplete ? (
                        <span style={{ color: "#d97706", fontWeight: 600 }}>⚠️ Incomplete wholesale data</span>
                      ) : (
                        <span style={{ color: "#059669", fontWeight: 600 }}>✓ Costs Complete</span>
                      )}
                    </p>
                    {selectedOrder.delivery_latitude && selectedOrder.delivery_longitude && (
                      <p>
                        <strong>GPS Pin:</strong>{" "}
                        <a
                          href={`https://www.google.com/maps?q=${selectedOrder.delivery_latitude},${selectedOrder.delivery_longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2563eb", textDecoration: "underline", fontSize: "0.8rem" }}
                        >
                          View Map ({selectedOrder.delivery_latitude.toFixed(4)}, {selectedOrder.delivery_longitude.toFixed(4)})
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="admin-info-section admin-info-section-wide">
                    <h4>Quick Contact</h4>
                    <div className="admin-order-contact-row">
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openPhone(selectedOrder.shipping_phone)}
                      >
                        <Phone size={14} />
                        Call
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEmail(selectedOrder.email, selectedOrder.order_id)}
                      >
                        <Mail size={14} />
                        Email
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openWhatsApp(selectedOrder)}
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                  <div className="admin-info-section admin-info-section-wide">
                    <h4>Confirmation Workflow</h4>
                    <div className="admin-order-confirmation-grid">
                      <div className="admin-order-confirmation-card">
                        <span>Contact Status</span>
                        <strong>
                          <span
                            className={`admin-status-badge status-${selectedOrder.confirmation_status}`}
                          >
                            {formatStatusLabel(selectedOrder.confirmation_status)}
                          </span>
                        </strong>
                      </div>
                      <div className="admin-order-confirmation-card">
                        <span>Contacted At</span>
                        <strong>{formatDate(selectedOrder.contacted_at)}</strong>
                      </div>
                      <div className="admin-order-confirmation-card">
                        <span>Location Confirmed</span>
                        <strong>{formatDate(selectedOrder.location_confirmed_at)}</strong>
                      </div>
                    </div>
                    <div className="admin-form-group" style={{ marginTop: "1rem" }}>
                      <label htmlFor="confirmation_notes">Admin Confirmation Notes</label>
                      <textarea
                        id="confirmation_notes"
                        rows={4}
                        value={confirmationNotes}
                        onChange={(event) => setConfirmationNotes(event.target.value)}
                        placeholder="Add a note about the call, landmark clarification, or delivery instructions."
                      />
                    </div>
                    <div className="admin-order-contact-row">
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        disabled={savingConfirmationId === selectedOrder.id}
                        onClick={() =>
                          void handleUpdateConfirmation(selectedOrder.id, {
                            confirmation_notes: confirmationNotes,
                          })
                        }
                      >
                        <FileText size={14} />
                        Save Note
                      </button>
                      {selectedOrder.confirmation_status === "pending" ? (
                        <button
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          disabled={savingConfirmationId === selectedOrder.id}
                          onClick={() =>
                            void handleUpdateConfirmation(selectedOrder.id, {
                              confirmation_status: "contacted",
                              confirmation_notes: confirmationNotes,
                            })
                          }
                        >
                          <Phone size={14} />
                          Mark Contacted
                        </button>
                      ) : null}
                      {selectedOrder.confirmation_status !== "location_confirmed" ? (
                        <button
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          disabled={savingConfirmationId === selectedOrder.id}
                          onClick={() =>
                            void handleUpdateConfirmation(selectedOrder.id, {
                              confirmation_status: "location_confirmed",
                              confirmation_notes: confirmationNotes,
                            })
                          }
                        >
                          <MapPin size={14} />
                          Mark Location Confirmed
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="admin-order-items">
                  <h4>Order Items & Nursery Wholesale Costs</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Nursery Supplier</th>
                        <th>Unit Wholesale Cost</th>
                        <th>Obligation</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.plant_name}</strong></td>
                          <td>{item.supplier_name || <span style={{ color: "#9ca3af" }}>Not assigned</span>}</td>
                          <td>
                            {typeof item.wholesale_unit_cost === "number"
                              ? formatPrice(item.wholesale_unit_cost)
                              : <span style={{ color: "#d97706" }}>Missing (Incomplete)</span>}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: item.supplier_obligation_status === "waived" ? "#f3f4f6" : "#ecfdf5",
                                color: item.supplier_obligation_status === "waived" ? "#6b7280" : "#065f46",
                              }}
                            >
                              {item.supplier_obligation_status || "kept"}
                            </span>
                            {selectedOrder.status === "cancelled" && (
                              <button
                                type="button"
                                style={{ marginLeft: "6px", fontSize: "0.7rem", background: "none", border: "1px solid #d1d5db", borderRadius: "3px", cursor: "pointer" }}
                                onClick={() => handleUpdateObligation(item.id, item.supplier_obligation_status === "waived" ? "kept" : "waived")}
                              >
                                {item.supplier_obligation_status === "waived" ? "Restore Obligation" : "Waive"}
                              </button>
                            )}
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="admin-order-actions">
                  {getNextStatus(selectedOrder.status) ? (
                    <button
                      className="admin-btn admin-btn-primary"
                      disabled={savingOrderId === selectedOrder.id}
                      onClick={() =>
                        void handleUpdateStatus(
                          selectedOrder.id,
                          getNextStatus(selectedOrder.status) as OrderStatus
                        )
                      }
                    >
                      Mark as{" "}
                      {formatStatusLabel(getNextStatus(selectedOrder.status) as OrderStatus)}
                    </button>
                  ) : null}
                  {canCancelOrder(selectedOrder.status) ? (
                    <button
                      className="admin-btn admin-btn-danger"
                      disabled={savingOrderId === selectedOrder.id}
                      onClick={() => void handleUpdateStatus(selectedOrder.id, "cancelled")}
                    >
                      Cancel Order
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Record COD Payment Modal */}
        {showCodModal && selectedOrder && (
          <div className="admin-modal-overlay">
            <div className="admin-modal" style={{ maxWidth: "450px" }}>
              <div className="admin-modal-header">
                <h3>Record Cash on Delivery Collection</h3>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setShowCodModal(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleRecordCodCollection}>
                <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem" }}>
                    <div><strong>Order:</strong> {selectedOrder.order_id}</div>
                    <div><strong>Total Due:</strong> {formatPrice(selectedOrder.total)}</div>
                    <div><strong>Already Collected:</strong> {formatPrice(selectedOrder.cod_collected_amount)}</div>
                  </div>
                  <div>
                    <label className="admin-label">Amount Collected (NPR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      className="admin-input"
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Notes & Rider Details</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={codNotes}
                      onChange={(e) => setCodNotes(e.target.value)}
                      placeholder="e.g. Handed cash to rider Aarav"
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => setShowCodModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={busyCod}
                  >
                    {busyCod ? "Recording..." : "Confirm COD Collection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
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

interface OrderItem {
  id: number;
  plant_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  date: string;
  status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  tracking_number?: string | null;
  courier_name?: string | null;
  order_items: OrderItem[];
}

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
  shipping_name: order?.shipping_name || order?.user?.name || "Unknown",
  shipping_phone: order?.shipping_phone || "-",
  shipping_address: order?.shipping_address || "-",
  tracking_number: order?.tracking_number ?? null,
  courier_name: order?.courier_name ?? null,
  order_items: Array.isArray(order?.items)
    ? order.items.map((item: any) => ({
        id: Number(item?.id ?? 0),
        plant_name: item?.plant?.name || "Unknown Plant",
        quantity: Number(item?.quantity ?? 0),
        price: Number(item?.price ?? 0),
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

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
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

      const updatedOrder = transformOrder(data.data?.order);

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      setSelectedOrder((currentOrder) =>
        currentOrder?.id === orderId ? updatedOrder : currentOrder
      );
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

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null =>
    statusFlow[currentStatus];

  const canCancelOrder = (status: OrderStatus) =>
    status === "pending" || status === "packed";

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

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Orders Management</h2>
            <p>View and manage customer orders</p>
          </div>
        </div>

        {error && (
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div
              className="admin-card-body"
              style={{ padding: "1rem 1.25rem", color: "#dc2626" }}
            >
              {error}
            </div>
          </div>
        )}

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
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
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <tr key={order.id}>
                      <td className="admin-order-id">{order.order_id}</td>
                      <td>{order.customer}</td>
                      <td className="admin-email">{order.email}</td>
                      <td>{order.items}</td>
                      <td className="admin-price">{formatPrice(order.total)}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        <span className={`admin-status-badge status-${order.status}`}>
                          {getStatusIcon(order.status)}
                          {formatStatusLabel(order.status)}
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
                          {nextStatus && (
                            <button
                              className="admin-action-btn"
                              style={{ background: "#dbeafe", color: "#2563eb" }}
                              title={`Mark as ${formatStatusLabel(nextStatus)}`}
                              disabled={savingOrderId === order.id}
                              onClick={() => handleUpdateStatus(order.id, nextStatus)}
                            >
                              {getActionIcon(nextStatus)}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="admin-empty-state">
              <p>No orders found.</p>
            </div>
          )}
        </div>

        {showDetailModal && selectedOrder && (
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
                    <p><strong>Name:</strong> {selectedOrder.customer}</p>
                    <p><strong>Email:</strong> {selectedOrder.email}</p>
                  </div>
                  <div className="admin-info-section">
                    <h4>Order Information</h4>
                    <p><strong>Date:</strong> {formatDate(selectedOrder.date)}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`admin-status-badge status-${selectedOrder.status}`}>
                        {formatStatusLabel(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>Total:</strong> {formatPrice(selectedOrder.total)}</p>
                    <p>
                      <strong>Courier:</strong>{" "}
                      {selectedOrder.courier_name || "Not assigned yet"}
                    </p>
                    <p>
                      <strong>Tracking:</strong>{" "}
                      {selectedOrder.tracking_number || "Not assigned yet"}
                    </p>
                  </div>
                  <div className="admin-info-section">
                    <h4>Shipping Information</h4>
                    <p><strong>Name:</strong> {selectedOrder.shipping_name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shipping_phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                  </div>
                </div>

                <div className="admin-order-items">
                  <h4>Order Items</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.plant_name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-order-actions">
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      className="admin-btn admin-btn-primary"
                      disabled={savingOrderId === selectedOrder.id}
                      onClick={() =>
                        handleUpdateStatus(
                          selectedOrder.id,
                          getNextStatus(selectedOrder.status) as OrderStatus
                        )
                      }
                    >
                      Mark as{" "}
                      {formatStatusLabel(
                        getNextStatus(selectedOrder.status) as OrderStatus
                      )}
                    </button>
                  )}
                  {canCancelOrder(selectedOrder.status) && (
                    <button
                      className="admin-btn admin-btn-danger"
                      disabled={savingOrderId === selectedOrder.id}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

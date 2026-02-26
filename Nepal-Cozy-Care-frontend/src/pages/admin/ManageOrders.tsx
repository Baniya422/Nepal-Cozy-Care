import { useEffect, useState } from "react";
import { Search, Eye, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  order_items?: OrderItem[];
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ordersData = data.data?.orders || [];
        const transformedOrders = ordersData.map((order: any) => ({
          id: order.id,
          order_id: order.order_id || `#ORD-${String(order.id).padStart(3, "0")}`,
          customer: order.user?.name || "Unknown",
          email: order.user?.email || "-",
          items: order.items?.length || 0,
          total: parseFloat(order.total),
          date: order.created_at,
          status: order.status,
          order_items: order.items?.map((item: any) => ({
            id: item.id,
            plant_name: item.plant?.name || "Unknown Plant",
            quantity: item.quantity,
            price: parseFloat(item.price),
          })),
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as Order["status"] });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "processing":
        return <Package size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow = ["pending", "processing", "shipped", "delivered"];
    const index = flow.indexOf(currentStatus);
    if (index >= 0 && index < flow.length - 1) {
      return flow[index + 1];
    }
    return null;
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

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {filteredOrders.map((order) => (
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
                        {order.status}
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
                        {getNextStatus(order.status) && (
                          <button
                            className="admin-action-btn"
                            style={{ background: "#dbeafe", color: "#2563eb" }}
                            title={`Mark as ${getNextStatus(order.status)}`}
                            onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status)!)}
                          >
                            {getNextStatus(order.status) === "delivered" ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Truck size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
            <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Order Details - {selectedOrder.order_id}</h3>
                <button className="admin-modal-close" onClick={() => setShowDetailModal(false)}>
                  ×
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
                    <p><strong>Status:</strong> 
                      <span className={`admin-status-badge status-${selectedOrder.status}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><strong>Total:</strong> {formatPrice(selectedOrder.total)}</p>
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
                      {selectedOrder.order_items?.map((item) => (
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
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                        setShowDetailModal(false);
                      }}
                    >
                      Mark as {getNextStatus(selectedOrder.status)}
                    </button>
                  )}
                  {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, "cancelled");
                        setShowDetailModal(false);
                      }}
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

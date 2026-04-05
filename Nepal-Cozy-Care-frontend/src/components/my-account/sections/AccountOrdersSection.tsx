import { Package } from "lucide-react";
import type { AccountOrder } from "../types";

type AccountOrdersSectionProps = {
  orders: AccountOrder[];
  expandedOrderId: number | null;
  cancelingOrderId: number | null;
  onToggleOrderExpand: (orderId: number) => void;
  onOpenTrackOrder: (orderId: number) => void;
  onCancelOrder: (orderId: number) => void;
  onStartShopping: () => void;
  formatDateTime: (dateString?: string | null) => string;
  formatCurrency: (amount?: number | null) => string;
  buildImageUrl: (image?: string | null) => string;
  getOrderStatusTone: (status: string) => string;
  getOrderStatusLabel: (status: string) => string;
};

export default function AccountOrdersSection({
  orders,
  expandedOrderId,
  cancelingOrderId,
  onToggleOrderExpand,
  onOpenTrackOrder,
  onCancelOrder,
  onStartShopping,
  formatDateTime,
  formatCurrency,
  buildImageUrl,
  getOrderStatusTone,
  getOrderStatusLabel,
}: AccountOrdersSectionProps) {
  return (
    <div className="account-section-stack">
      {orders.length === 0 ? (
        <div className="account-empty-state account-card">
          <Package size={28} />
          <h3>No orders yet</h3>
          <p>Your completed checkout history will appear here.</p>
          <button type="button" className="account-primary-btn" onClick={onStartShopping}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="account-list-stack">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isPending = order.status === "pending";

            return (
              <section key={order.id} className="account-card">
                <div className="account-order-head">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p>
                      Placed {formatDateTime(order.created_at)} | {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="account-order-head-side">
                    <span className={`account-status-pill ${getOrderStatusTone(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                </div>

                <div className="account-order-actions">
                  <button
                    type="button"
                    className="account-secondary-btn"
                    onClick={() => onToggleOrderExpand(order.id)}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    type="button"
                    className="account-secondary-btn"
                    onClick={() => onOpenTrackOrder(order.id)}
                  >
                    Track Order
                  </button>
                  {isPending && (
                    <button
                      type="button"
                      className="account-danger-btn"
                      onClick={() => onCancelOrder(order.id)}
                      disabled={cancelingOrderId === order.id}
                    >
                      {cancelingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="account-order-details">
                    <div className="account-order-meta-grid">
                      <article>
                        <span>Shipping name</span>
                        <strong>{order.shipping_name || "Not provided"}</strong>
                      </article>
                      <article>
                        <span>Phone</span>
                        <strong>{order.shipping_phone || "Not provided"}</strong>
                      </article>
                      <article>
                        <span>Address</span>
                        <strong>{order.shipping_address || "Not provided"}</strong>
                      </article>
                      <article>
                        <span>Payment</span>
                        <strong>{order.payment_status || "Pending"}</strong>
                      </article>
                    </div>

                    <div className="account-order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="account-order-item">
                          <img src={buildImageUrl(item.plant?.image)} alt={item.plant?.name || "Plant"} />
                          <div>
                            <p className="account-item-title">{item.plant?.name || "Product"}</p>
                            <p className="account-item-meta">
                              Qty {item.quantity} |{" "}
                              {formatCurrency(item.line_total ?? item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

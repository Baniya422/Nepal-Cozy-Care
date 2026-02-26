import { Package, Truck, CheckCircle, Calendar } from "lucide-react";

type OrderData = {
  id: number;
  status: string;
  estimated_delivery_date?: string;
  created_at: string;
  delivered_at?: string;
};

interface OrderSummaryProps {
  order: OrderData;
  formatDateTime: (date: string | null) => string;
  getEstimatedDelivery: () => string;
}

export default function OrderSummary({ order, formatDateTime, getEstimatedDelivery }: OrderSummaryProps) {
  return (
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
  );
}

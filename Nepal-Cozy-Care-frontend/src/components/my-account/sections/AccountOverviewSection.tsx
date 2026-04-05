import { ChevronRight, ExternalLink, MapPin, ShoppingBag } from "lucide-react";
import type {
  AccountOrder,
  AccountSection,
  AddressEntry,
} from "../types";

type AccountOverviewSectionProps = {
  totalOrders: number;
  activeDeliveries: number;
  wishlistCount: number;
  reminderLabel: string;
  orders: AccountOrder[];
  defaultAddress: AddressEntry | null;
  onNavigateToSection: (section: AccountSection) => void;
  onOpenTrackOrder: (orderId?: number) => void;
  onBrowsePlants: () => void;
  formatCurrency: (amount?: number | null) => string;
  formatDate: (dateString?: string | null) => string;
  getOrderStatusTone: (status: string) => string;
  getOrderStatusLabel: (status: string) => string;
};

export default function AccountOverviewSection({
  totalOrders,
  activeDeliveries,
  wishlistCount,
  reminderLabel,
  orders,
  defaultAddress,
  onNavigateToSection,
  onOpenTrackOrder,
  onBrowsePlants,
  formatCurrency,
  formatDate,
  getOrderStatusTone,
  getOrderStatusLabel,
}: AccountOverviewSectionProps) {
  return (
    <div className="account-section-stack">
      <div className="account-stats-grid">
        <article className="account-stat-card">
          <span className="account-stat-label">Total Orders</span>
          <strong>{totalOrders}</strong>
          <p>Everything you have ordered so far.</p>
        </article>
        <article className="account-stat-card">
          <span className="account-stat-label">Active Deliveries</span>
          <strong>{activeDeliveries}</strong>
          <p>Orders currently packed, shipped, or out for delivery.</p>
        </article>
        <article className="account-stat-card">
          <span className="account-stat-label">Wishlist</span>
          <strong>{wishlistCount}</strong>
          <p>Plants saved for later decisions.</p>
        </article>
        <article className="account-stat-card">
          <span className="account-stat-label">Next Reminder</span>
          <strong>{reminderLabel}</strong>
          <p>Based on your current care reminder preference.</p>
        </article>
      </div>

      <div className="account-quick-grid">
        <button
          type="button"
          className="account-quick-card"
          onClick={() => onNavigateToSection("profile")}
        >
          <div>
            <h3>Update Profile</h3>
            <p>Keep your name, email, and phone ready for checkout and support.</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <button
          type="button"
          className="account-quick-card"
          onClick={() => onNavigateToSection("orders")}
        >
          <div>
            <h3>Review Orders</h3>
            <p>Open recent order details or cancel any pending purchase.</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <button
          type="button"
          className="account-quick-card"
          onClick={() => onNavigateToSection("wishlist")}
        >
          <div>
            <h3>Manage Wishlist</h3>
            <p>Jump back to your saved plants and remove anything outdated.</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <button type="button" className="account-quick-card" onClick={() => onOpenTrackOrder()}>
          <div>
            <h3>Track an Order</h3>
            <p>Open the tracker with your current account email prefilled.</p>
          </div>
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="account-overview-grid">
        <section className="account-card">
          <div className="account-card-head">
            <h3>Recent Orders</h3>
            <button
              type="button"
              className="account-link-btn"
              onClick={() => onNavigateToSection("orders")}
            >
              View all
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="account-empty-state">
              <ShoppingBag size={24} />
              <p>No order history yet.</p>
              <button type="button" className="account-primary-btn" onClick={onBrowsePlants}>
                Browse Plants
              </button>
            </div>
          ) : (
            <div className="account-list-stack">
              {orders.slice(0, 3).map((order) => (
                <article key={order.id} className="account-list-card">
                  <div className="account-list-main">
                    <div>
                      <p className="account-item-title">Order #{order.id}</p>
                      <p className="account-item-meta">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"} |{" "}
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <span className={`account-status-pill ${getOrderStatusTone(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="account-list-footer">
                    <span>{formatDate(order.created_at)}</span>
                    <button
                      type="button"
                      className="account-link-btn"
                      onClick={() => onOpenTrackOrder(order.id)}
                    >
                      Track order
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Default Delivery Address</h3>
            <button
              type="button"
              className="account-link-btn"
              onClick={() => onNavigateToSection("addresses")}
            >
              Manage
            </button>
          </div>

          {defaultAddress ? (
            <div className="account-address-preview">
              <strong>{defaultAddress.label}</strong>
              <p>{defaultAddress.address}</p>
              <span>{defaultAddress.note || "Default checkout destination"}</span>
            </div>
          ) : (
            <div className="account-empty-state">
              <MapPin size={24} />
              <p>No saved addresses yet.</p>
              <button
                type="button"
                className="account-primary-btn"
                onClick={() => onNavigateToSection("addresses")}
              >
                Add Address
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

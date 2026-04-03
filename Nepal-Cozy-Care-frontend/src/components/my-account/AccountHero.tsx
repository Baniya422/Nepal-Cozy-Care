import { Leaf, Package, Truck } from "lucide-react";

type AccountHeroProps = {
  userName?: string;
  onViewOrders: () => void;
  onOpenMyGarden: () => void;
  onOpenTrackOrder: () => void;
};

export default function AccountHero({
  userName,
  onViewOrders,
  onOpenMyGarden,
  onOpenTrackOrder,
}: AccountHeroProps) {
  const firstName = userName?.split(" ")[0];

  return (
    <section className="account-hero">
      <div className="account-container account-hero-inner">
        <div>
          <span className="account-eyebrow">Customer Dashboard</span>
          <h1>My Account</h1>
          <p>
            Welcome back{firstName ? `, ${firstName}` : ""}. Manage your profile, orders, saved
            addresses, and care preferences here.
          </p>
        </div>

        <div className="account-hero-actions">
          <button type="button" className="account-hero-btn primary" onClick={onViewOrders}>
            <Package size={16} />
            View Orders
          </button>
          <button type="button" className="account-hero-btn secondary" onClick={onOpenMyGarden}>
            <Leaf size={16} />
            My Garden
          </button>
          <button type="button" className="account-hero-btn secondary" onClick={onOpenTrackOrder}>
            <Truck size={16} />
            Track Order
          </button>
        </div>
      </div>
    </section>
  );
}

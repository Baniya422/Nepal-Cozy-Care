import { Package } from "lucide-react";

export default function AccountLoadingCard() {
  return (
    <div className="account-loading-card">
      <Package size={26} />
      <h3>Loading your account</h3>
      <p>Fetching your latest profile, orders, and wishlist details.</p>
    </div>
  );
}

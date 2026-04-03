import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import AccountNotice from "./AccountNotice";
import type { Notice } from "./types";

type AccountGuestPromptProps = {
  loadingNotice: Notice | null;
};

export default function AccountGuestPrompt({ loadingNotice }: AccountGuestPromptProps) {
  return (
    <div className="account-page">
      <section className="account-hero">
        <div className="account-container account-hero-inner">
          <div>
            <span className="account-eyebrow">Customer Dashboard</span>
            <h1>My Account</h1>
            <p>Track deliveries, review saved plants, and manage your checkout details from one place.</p>
          </div>
        </div>
      </section>

      <section className="account-shell">
        <div className="account-container">
          <AccountNotice notice={loadingNotice} />
          <div className="account-guest-card">
            <div className="account-guest-icon">
              <Leaf size={26} />
            </div>
            <h2>Login required</h2>
            <p>Sign in to view your orders, wishlist, saved addresses, and account security settings.</p>
            <div className="account-guest-actions">
              <Link to="/login" className="account-primary-link">
                Login
              </Link>
              <Link to="/register" className="account-secondary-link">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

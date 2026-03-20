import Layout from "../components/layout/Layout";
import "../styles/my-account.css";

export default function MyAccount() {
  return (
    <Layout>
      <section className="account-page">
        <div className="account-container">
          <h1>My Account</h1>
          <p>Manage your profile, orders, addresses, and preferences.</p>

          <div className="account-content">
            <aside className="account-sidebar">
              <h2>Account Menu</h2>
              <ul>
                <li>Overview</li>
                <li>Profile</li>
                <li>Orders</li>
                <li>Addresses</li>
                <li>Wishlist</li>
                <li>Security</li>
                <li>Preferences</li>
              </ul>
            </aside>

            <div className="account-main">
              <section className="account-section">
                <h2>Overview</h2>
                <div className="account-stats-grid">
                  <article>
                    <h3>14</h3>
                    <p>Total Orders</p>
                  </article>
                  <article>
                    <h3>2</h3>
                    <p>Active Deliveries</p>
                  </article>
                  <article>
                    <h3>8</h3>
                    <p>Wishlist Items</p>
                  </article>
                  <article>
                    <h3>3 days</h3>
                    <p>Next Watering Reminder</p>
                  </article>
                </div>
              </section>

              <section className="account-section account-profile-section">
                <h2>Profile Snapshot</h2>
                <div className="account-profile-card">
                  <div>
                    <p className="account-label">Full Name</p>
                    <p className="account-value">Sanjana Baniya</p>
                  </div>
                  <div>
                    <p className="account-label">Email</p>
                    <p className="account-value">sanjana@example.com</p>
                  </div>
                  <div>
                    <p className="account-label">Phone</p>
                    <p className="account-value">+977 98XXXXXXXX</p>
                  </div>
                  <button className="account-action-btn">Edit Profile</button>
                </div>
              </section>

              <section className="account-section account-orders-section">
                <h2>Recent Orders</h2>
                <div className="account-order-list">
                  <article>
                    <p className="account-order-id">Order #CC-12031</p>
                    <p className="account-order-meta">2 items • Rs. 4,200 • Delivered</p>
                  </article>
                  <article>
                    <p className="account-order-id">Order #CC-12032</p>
                    <p className="account-order-meta">1 item • Rs. 1,950 • In Transit</p>
                  </article>
                </div>
              </section>

              <section className="account-section account-address-section">
                <h2>Saved Addresses</h2>
                <div className="account-address-grid">
                  <article>
                    <p className="account-order-id">Home</p>
                    <p className="account-order-meta">Kathmandu, Nepal • Default shipping</p>
                  </article>
                  <article>
                    <p className="account-order-id">Office</p>
                    <p className="account-order-meta">Lalitpur, Nepal • Delivery 9am-5pm</p>
                  </article>
                </div>
              </section>

              <section className="account-section account-wishlist-section">
                <h2>Wishlist Preview</h2>
                <div className="account-wishlist-grid">
                  <article>Snake Plant</article>
                  <article>Rubber Plant</article>
                  <article>Ceramic Pot Set</article>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

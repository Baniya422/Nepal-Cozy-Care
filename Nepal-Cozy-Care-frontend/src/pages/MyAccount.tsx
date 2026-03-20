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
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

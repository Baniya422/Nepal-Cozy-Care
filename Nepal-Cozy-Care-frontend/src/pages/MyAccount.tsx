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
              <p>Select any section from the menu to manage your account.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

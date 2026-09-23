import { useEffect, useState } from "react";
import {
  KeyRound,
  Mail,
  Save,
  Send,
  Settings,
  UserRound,
  Truck,
  AlertTriangle,
  Palette,
  CircleDot,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Account = { id: number; name: string; email: string };
type MailSettings = {
  mail_enabled: boolean;
  mail_host: string;
  mail_port: number;
  mail_username: string;
  mail_password_configured: boolean;
  mail_encryption: "tls" | "ssl" | "none";
  mail_from_address: string;
  mail_from_name: string;
  contact_recipient: string;
  is_configured: boolean;
};

type LaunchSettings = {
  vendor_marketplace_enabled: boolean;
  esewa_enabled: boolean;
  dispatch_latitude: string;
  dispatch_longitude: string;
  dispatch_address: string;
  free_delivery_threshold: string;
  free_delivery_radius_km: string;
  standard_delivery_fee: string;
  max_delivery_distance_km: string;
  distance_rate_per_km: string;
  delivery_pricing_method: string;
  site_url: string;
};

const emptyMail: MailSettings = {
  mail_enabled: false,
  mail_host: "smtp.gmail.com",
  mail_port: 587,
  mail_username: "",
  mail_password_configured: false,
  mail_encryption: "tls",
  mail_from_address: "",
  mail_from_name: "Nepal Cozy Care",
  contact_recipient: "",
  is_configured: false,
};

const defaultLaunch: LaunchSettings = {
  vendor_marketplace_enabled: false,
  esewa_enabled: false,
  dispatch_latitude: "27.6934",
  dispatch_longitude: "85.2816",
  dispatch_address: "Kalanki Nursery Hub, Ring Road, Kathmandu",
  free_delivery_threshold: "2000",
  free_delivery_radius_km: "10",
  standard_delivery_fee: "150",
  max_delivery_distance_km: "25",
  distance_rate_per_km: "25",
  delivery_pricing_method: "road_distance_bands",
  site_url: "https://nepal-cozy-care.onrender.com",
};

const apiError = (data: Record<string, unknown>, fallback: string) => {
  const errors = data.errors && typeof data.errors === "object" ? (data.errors as Record<string, unknown>) : {};
  const first = Object.values(errors).flat().find((item) => typeof item === "string");
  return (
    (typeof first === "string" ? first : null) ||
    (typeof data.message === "string" ? data.message : fallback)
  );
};

export default function AdminSettingsPage() {
  const [account, setAccount] = useState<Account>({ id: 0, name: "", email: "" });
  const [mail, setMail] = useState<MailSettings>(emptyMail);
  const [launch, setLaunch] = useState<LaunchSettings>(defaultLaunch);
  const [mailPassword, setMailPassword] = useState("");
  const [passwords, setPasswords] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [testRecipient, setTestRecipient] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API}/api/admin/settings`, { headers: authHeaders() });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(apiError(data, "Could not load settings."));

        setAccount(data.data.account as Account);
        setMail({ ...emptyMail, ...data.data.mail } as MailSettings);
        setTestRecipient(data.data.mail?.contact_recipient || data.data.account?.email || "");

        if (data.data.launch) {
          setLaunch({
            vendor_marketplace_enabled: Boolean(data.data.launch.vendor_marketplace_enabled),
            esewa_enabled: Boolean(data.data.launch.esewa_enabled),
            dispatch_latitude: data.data.launch.dispatch_latitude ? String(data.data.launch.dispatch_latitude) : "27.6934",
            dispatch_longitude: data.data.launch.dispatch_longitude ? String(data.data.launch.dispatch_longitude) : "85.2816",
            dispatch_address: data.data.launch.dispatch_address || "Kalanki Nursery Hub, Ring Road, Kathmandu",
            free_delivery_threshold: String(data.data.launch.free_delivery_threshold ?? "2000"),
            free_delivery_radius_km: String(data.data.launch.free_delivery_radius_km ?? "10"),
            standard_delivery_fee: String(data.data.launch.standard_delivery_fee ?? "150"),
            max_delivery_distance_km: String(data.data.launch.max_delivery_distance_km ?? "25"),
            distance_rate_per_km: String(data.data.launch.distance_rate_per_km ?? "25"),
            delivery_pricing_method: data.data.launch.delivery_pricing_method || "road_distance_bands",
            site_url: data.data.launch.site_url || "https://nepal-cozy-care.onrender.com",
          });
        }
      } catch (error) {
        setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not load settings." });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("profile");
    setNotice(null);
    try {
      const response = await fetch(`${API}/api/me`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ name: account.name, email: account.email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not update admin account."));
      setAccount(data.user as Account);
      localStorage.setItem("user", JSON.stringify(data.user));
      setNotice({ type: "success", text: data.message || "Admin profile updated." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not update admin account." });
    } finally {
      setBusy("");
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("password");
    setNotice(null);
    try {
      const response = await fetch(`${API}/api/admin/password`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(passwords),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not update password."));
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
      setNotice({ type: "success", text: data.message || "Password updated." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not update password." });
    } finally {
      setBusy("");
    }
  };

  const saveLaunchSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("launch");
    setNotice(null);
    try {
      const response = await fetch(`${API}/api/admin/settings/launch`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          vendor_marketplace_enabled: launch.vendor_marketplace_enabled,
          esewa_enabled: launch.esewa_enabled,
          dispatch_latitude: parseFloat(launch.dispatch_latitude),
          dispatch_longitude: parseFloat(launch.dispatch_longitude),
          dispatch_address: launch.dispatch_address,
          free_delivery_threshold: parseFloat(launch.free_delivery_threshold),
          free_delivery_radius_km: parseFloat(launch.free_delivery_radius_km),
          standard_delivery_fee: parseFloat(launch.standard_delivery_fee),
          max_delivery_distance_km: parseFloat(launch.max_delivery_distance_km),
          distance_rate_per_km: parseFloat(launch.distance_rate_per_km),
          delivery_pricing_method: launch.delivery_pricing_method,
          site_url: launch.site_url,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not save launch settings."));
      setNotice({ type: "success", text: "Launch feature flags & delivery pricing settings saved!" });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save settings." });
    } finally {
      setBusy("");
    }
  };

  const saveMail = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("mail");
    setNotice(null);
    try {
      const payload: Record<string, unknown> = {
        mail_enabled: mail.mail_enabled,
        mail_host: mail.mail_host,
        mail_port: Number(mail.mail_port),
        mail_username: mail.mail_username,
        mail_encryption: mail.mail_encryption,
        mail_from_address: mail.mail_from_address,
        mail_from_name: mail.mail_from_name,
        contact_recipient: mail.contact_recipient,
      };
      if (mailPassword.trim()) {
        payload.mail_password = mailPassword.trim();
      }
      const response = await fetch(`${API}/api/admin/settings/mail`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not update SMTP settings."));
      setMail({ ...mail, ...data.data.mail } as MailSettings);
      setMailPassword("");
      setNotice({ type: "success", text: data.message || "SMTP settings updated." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not update SMTP settings." });
    } finally {
      setBusy("");
    }
  };

  const sendTest = async () => {
    setBusy("test");
    setNotice(null);
    try {
      const response = await fetch(`${API}/api/admin/settings/mail/test`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ recipient: testRecipient || null }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not send test email."));
      setNotice({ type: "success", text: data.message || "Test email sent." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not send test email." });
    } finally {
      setBusy("");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page admin-settings-page">
        <div className="admin-page-header">
          <div>
            <h2>Launch & System Settings</h2>
            <p>Configure feature flags, nursery dispatch location, distance delivery pricing, and system accounts.</p>
          </div>
        </div>

        {notice ? <div className={`admin-notice admin-notice-${notice.type}`}>{notice.text}</div> : null}

        {loading ? (
          <div className="admin-loading">Loading settings...</div>
        ) : (
          <div className="admin-settings-grid">
            {/* Website Logo, Name & Category Circles Quick Navigation */}
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "1.2rem 1.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <strong style={{ color: "#166534", fontSize: "1rem", display: "block", marginBottom: "0.2rem" }}>
                  Website Logo, Brand Name & Catalog Circles
                </strong>
                <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                  Easily update the storefront logo image, store title (&quot;Cozy Care&quot;), subtitle (&quot;Nepal Plant Studio&quot;), or customize catalog category filter circles.
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link
                  to="/admin/pages/branding"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.55rem 1rem",
                    background: "#166534",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Palette size={15} /> Website Logo & Name
                </Link>
                <Link
                  to="/admin/pages/category-bubbles"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.55rem 1rem",
                    background: "#ffffff",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <CircleDot size={15} /> Category Filter Circles
                </Link>
              </div>
            </div>

            {/* Launch Feature Flags & Dispatch Card */}
            <section className="admin-editor-card" style={{ gridColumn: "1 / -1" }}>
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <Truck size={22} color="#059669" />
                <div>
                  <h3>Initial Launch Operations & Delivery Rules</h3>
                  <p>Central feature switches and location-based road pricing for Cozy Care direct-to-consumer delivery.</p>
                </div>
              </div>

              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.25rem", color: "#92400e", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "0.85rem" }}>
                  <strong>Launch Configuration Notice:</strong> Dispatch nursery coordinates and delivery rates are editable below. Verify and save your exact dispatch location before going live so road distances calculate accurately.
                </div>
              </div>

              <form onSubmit={saveLaunchSettings}>
                {/* Feature Flags Section */}
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.4rem" }}>
                  Central Feature Flags
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "8px",
                      background: launch.vendor_marketplace_enabled ? "#ecfdf5" : "#f9fafb",
                      border: `1px solid ${launch.vendor_marketplace_enabled ? "#a7f3d0" : "#e5e7eb"}`,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={launch.vendor_marketplace_enabled}
                      onChange={(e) => setLaunch({ ...launch, vendor_marketplace_enabled: e.target.checked })}
                      style={{ marginTop: "4px" }}
                    />
                    <div>
                      <strong style={{ color: "#111827" }}>Vendor Marketplace</strong>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                        Currently <strong>{launch.vendor_marketplace_enabled ? "Enabled" : "Disabled (Direct Cozy Care Sales)"}</strong>. Hides vendor shops, registration, attribution, and partner listings.
                      </p>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "1rem",
                      borderRadius: "8px",
                      background: launch.esewa_enabled ? "#ecfdf5" : "#f9fafb",
                      border: `1px solid ${launch.esewa_enabled ? "#a7f3d0" : "#e5e7eb"}`,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={launch.esewa_enabled}
                      onChange={(e) => setLaunch({ ...launch, esewa_enabled: e.target.checked })}
                      style={{ marginTop: "4px" }}
                    />
                    <div>
                      <strong style={{ color: "#111827" }}>eSewa & Prepaid Gateways</strong>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                        Currently <strong>{launch.esewa_enabled ? "Enabled" : "Disabled (Cash on Delivery Only)"}</strong>. New checkout requests enforce Cash on Delivery.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Dispatch Location Section */}
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.4rem" }}>
                  Nursery Dispatch Location (Road Distance Origin)
                </h4>

                <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
                  <label>Dispatch Address / Landmark Description</label>
                  <input
                    value={launch.dispatch_address}
                    onChange={(e) => setLaunch({ ...launch, dispatch_address: e.target.value })}
                    placeholder="e.g. Kalanki Nursery Hub, Ring Road, Kathmandu"
                    required
                  />
                </div>

                <div className="admin-form-grid" style={{ marginBottom: "1.5rem" }}>
                  <div className="admin-form-group">
                    <label>Dispatch Latitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={launch.dispatch_latitude}
                      onChange={(e) => setLaunch({ ...launch, dispatch_latitude: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Dispatch Longitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={launch.dispatch_longitude}
                      onChange={(e) => setLaunch({ ...launch, dispatch_longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Pricing Rules Section */}
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.4rem" }}>
                  Location-Based Delivery Pricing Rules
                </h4>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Free Delivery Threshold (NPR Subtotal)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={launch.free_delivery_threshold}
                      onChange={(e) => setLaunch({ ...launch, free_delivery_threshold: e.target.value })}
                      required
                    />
                    <small>Default: 2000 (after all promo discounts).</small>
                  </div>

                  <div className="admin-form-group">
                    <label>Free Delivery Max Radius (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={launch.free_delivery_radius_km}
                      onChange={(e) => setLaunch({ ...launch, free_delivery_radius_km: e.target.value })}
                      required
                    />
                    <small>Default: 10 km (orders beyond this never get free delivery).</small>
                  </div>

                  <div className="admin-form-group">
                    <label>Standard Delivery Fee (NPR)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={launch.standard_delivery_fee}
                      onChange={(e) => setLaunch({ ...launch, standard_delivery_fee: e.target.value })}
                      required
                    />
                    <small>Applies to orders &lt; threshold within radius.</small>
                  </div>

                  <div className="admin-form-group">
                    <label>Distance Rate Beyond Radius (NPR / km)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={launch.distance_rate_per_km}
                      onChange={(e) => setLaunch({ ...launch, distance_rate_per_km: e.target.value })}
                      required
                    />
                    <small>Additional rate per km beyond 10 km.</small>
                  </div>

                  <div className="admin-form-group">
                    <label>Maximum Delivery Distance (km)</label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      value={launch.max_delivery_distance_km}
                      onChange={(e) => setLaunch({ ...launch, max_delivery_distance_km: e.target.value })}
                      required
                    />
                    <small>Checkouts beyond this distance are blocked with a friendly message.</small>
                  </div>

                  <div className="admin-form-group">
                    <label>Production Site URL (for Canonical SEO & Sitemap)</label>
                    <input
                      type="url"
                      value={launch.site_url}
                      onChange={(e) => setLaunch({ ...launch, site_url: e.target.value })}
                      required
                    />
                    <small>Used for canonical tags and sitemap.xml generation.</small>
                  </div>
                </div>

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  style={{ marginTop: "1rem" }}
                  disabled={busy === "launch"}
                >
                  <Save size={16} /> {busy === "launch" ? "Saving..." : "Save Launch & Delivery Settings"}
                </button>
              </form>
            </section>

            {/* Profile Section */}
            <section className="admin-editor-card">
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <UserRound size={21} />
                <div>
                  <h3>Admin Profile</h3>
                  <p>Change the name and login email shown for this administrator.</p>
                </div>
              </div>
              <form onSubmit={saveProfile}>
                <div className="admin-form-group">
                  <label>Admin name</label>
                  <input
                    value={account.name}
                    onChange={(event) => setAccount((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Admin login email</label>
                  <input
                    type="email"
                    value={account.email}
                    onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <button className="admin-btn admin-btn-primary" disabled={busy === "profile"}>
                  <Save size={16} /> {busy === "profile" ? "Saving..." : "Save profile"}
                </button>
              </form>
            </section>

            {/* Password Section */}
            <section className="admin-editor-card">
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <KeyRound size={21} />
                <div>
                  <h3>Change Password</h3>
                  <p>Your current password is required for security.</p>
                </div>
              </div>
              <form onSubmit={changePassword}>
                <div className="admin-form-group">
                  <label>Current password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current_password}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, current_password: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>New password</label>
                    <input
                      type="password"
                      minLength={6}
                      autoComplete="new-password"
                      value={passwords.password}
                      onChange={(event) =>
                        setPasswords((current) => ({ ...current, password: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Confirm new password</label>
                    <input
                      type="password"
                      minLength={6}
                      autoComplete="new-password"
                      value={passwords.password_confirmation}
                      onChange={(event) =>
                        setPasswords((current) => ({
                          ...current,
                          password_confirmation: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <button className="admin-btn admin-btn-primary" disabled={busy === "password"}>
                  <KeyRound size={16} /> {busy === "password" ? "Updating..." : "Update password"}
                </button>
              </form>
            </section>

            {/* SMTP Section */}
            <section className="admin-editor-card admin-settings-mail-card" style={{ gridColumn: "1 / -1" }}>
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <Mail size={21} />
                <div>
                  <h3>SMTP Email Settings</h3>
                  <p>Send every new contact request and order alert to the recipient below.</p>
                </div>
              </div>
              <form onSubmit={saveMail}>
                <label className="admin-toggle-row">
                  <input
                    type="checkbox"
                    checked={mail.mail_enabled}
                    onChange={(event) =>
                      setMail((current) => ({ ...current, mail_enabled: event.target.checked }))
                    }
                  />
                  <span>
                    <strong>Enable SMTP notifications</strong>
                    <small>Contact requests and orders remain saved in the admin panel even if email delivery fails.</small>
                  </span>
                </label>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>SMTP host</label>
                    <input
                      value={mail.mail_host || ""}
                      onChange={(event) => setMail((current) => ({ ...current, mail_host: event.target.value }))}
                      required={mail.mail_enabled}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>SMTP port</label>
                    <input
                      type="number"
                      min={1}
                      max={65535}
                      value={mail.mail_port || ""}
                      onChange={(event) =>
                        setMail((current) => ({ ...current, mail_port: Number(event.target.value) }))
                      }
                      required={mail.mail_enabled}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>From email</label>
                    <input
                      type="email"
                      value={mail.mail_from_address || ""}
                      onChange={(event) =>
                        setMail((current) => ({ ...current, mail_from_address: event.target.value }))
                      }
                      required={mail.mail_enabled}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>From name</label>
                    <input
                      value={mail.mail_from_name || ""}
                      onChange={(event) =>
                        setMail((current) => ({ ...current, mail_from_name: event.target.value }))
                      }
                      required={mail.mail_enabled}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Notification recipient</label>
                    <input
                      type="email"
                      value={mail.contact_recipient || ""}
                      onChange={(event) =>
                        setMail((current) => ({ ...current, contact_recipient: event.target.value }))
                      }
                      required={mail.mail_enabled}
                    />
                  </div>
                </div>
                <button className="admin-btn admin-btn-primary" disabled={busy === "mail"}>
                  <Settings size={16} /> {busy === "mail" ? "Saving..." : "Save SMTP settings"}
                </button>
              </form>
              <div className="admin-test-mail-row" style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
                <div className="admin-form-group" style={{ flex: 1, margin: 0 }}>
                  <label>Test recipient email</label>
                  <input type="email" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} placeholder="Email address for test" />
                </div>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => void sendTest()} disabled={busy === "test" || !mail.is_configured}>
                  <Send size={16} /> {busy === "test" ? "Sending..." : "Send test email"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

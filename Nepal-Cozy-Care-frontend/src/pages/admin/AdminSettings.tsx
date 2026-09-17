import { useEffect, useState } from "react";
import { KeyRound, Mail, Save, Send, Settings, UserRound } from "lucide-react";
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

const apiError = (data: Record<string, unknown>, fallback: string) => {
  const errors = data.errors && typeof data.errors === "object" ? data.errors as Record<string, unknown> : {};
  const first = Object.values(errors).flat().find((item) => typeof item === "string");
  return (typeof first === "string" ? first : null)
    || (typeof data.message === "string" ? data.message : fallback);
};

export default function AdminSettingsPage() {
  const [account, setAccount] = useState<Account>({ id: 0, name: "", email: "" });
  const [mail, setMail] = useState<MailSettings>(emptyMail);
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
      const response = await fetch(`${API}/api/me/password`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(passwords),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not change password."));
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
      setNotice({ type: "success", text: data.message || "Password updated." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not change password." });
    } finally {
      setBusy("");
    }
  };

  const saveMail = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("mail");
    setNotice(null);
    try {
      const response = await fetch(`${API}/api/admin/settings/mail`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          ...mail,
          mail_password: mailPassword || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(data, "Could not save SMTP settings."));
      setMail({ ...emptyMail, ...data.data.mail } as MailSettings);
      setMailPassword("");
      setTestRecipient((current) => current || data.data.mail.contact_recipient || "");
      setNotice({ type: "success", text: data.message || "Email settings saved." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save SMTP settings." });
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
            <h2>Admin Settings</h2>
            <p>Manage the administrator account and notification email delivery.</p>
          </div>
          <span className={`admin-status-badge ${mail.is_configured ? "admin-status-active" : "admin-status-pending"}`}>
            SMTP {mail.is_configured ? "configured" : "not configured"}
          </span>
        </div>
        {notice ? <div className={`admin-notice admin-notice-${notice.type}`}>{notice.text}</div> : null}
        {loading ? <div className="admin-loading">Loading settings...</div> : (
          <div className="admin-settings-grid">
            <section className="admin-editor-card">
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <UserRound size={21} />
                <div><h3>Admin profile</h3><p>Change the name and login email shown for this administrator.</p></div>
              </div>
              <form onSubmit={saveProfile}>
                <div className="admin-form-group">
                  <label>Admin name</label>
                  <input value={account.name} onChange={(event) => setAccount((current) => ({ ...current, name: event.target.value }))} required />
                </div>
                <div className="admin-form-group">
                  <label>Admin login email</label>
                  <input type="email" value={account.email} onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))} required />
                </div>
                <button className="admin-btn admin-btn-primary" disabled={busy === "profile"}>
                  <Save size={16} /> {busy === "profile" ? "Saving..." : "Save profile"}
                </button>
              </form>
            </section>

            <section className="admin-editor-card">
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <KeyRound size={21} />
                <div><h3>Change password</h3><p>Your current password is required for security.</p></div>
              </div>
              <form onSubmit={changePassword}>
                <div className="admin-form-group">
                  <label>Current password</label>
                  <input type="password" autoComplete="current-password" value={passwords.current_password} onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))} required />
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>New password</label>
                    <input type="password" minLength={6} autoComplete="new-password" value={passwords.password} onChange={(event) => setPasswords((current) => ({ ...current, password: event.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Confirm new password</label>
                    <input type="password" minLength={6} autoComplete="new-password" value={passwords.password_confirmation} onChange={(event) => setPasswords((current) => ({ ...current, password_confirmation: event.target.value }))} required />
                  </div>
                </div>
                <button className="admin-btn admin-btn-primary" disabled={busy === "password"}>
                  <KeyRound size={16} /> {busy === "password" ? "Updating..." : "Update password"}
                </button>
              </form>
            </section>

            <section className="admin-editor-card admin-settings-mail-card">
              <div className="admin-editor-card-head admin-editor-card-head-icon">
                <Mail size={21} />
                <div><h3>SMTP email</h3><p>Send every new contact request and order alert to the recipient below.</p></div>
              </div>
              <div className="admin-smtp-help">
                For Gmail, use <strong>smtp.gmail.com</strong>, port <strong>587</strong>, TLS, your full Gmail address, and a Google <strong>App Password</strong>. Do not use your normal Gmail password.
              </div>
              <form onSubmit={saveMail}>
                <label className="admin-toggle-row">
                  <input type="checkbox" checked={mail.mail_enabled} onChange={(event) => setMail((current) => ({ ...current, mail_enabled: event.target.checked }))} />
                  <span><strong>Enable SMTP notifications</strong><small>Contact requests and orders remain saved in the admin panel even if email delivery fails.</small></span>
                </label>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>SMTP host</label>
                    <input value={mail.mail_host || ""} onChange={(event) => setMail((current) => ({ ...current, mail_host: event.target.value }))} required={mail.mail_enabled} />
                  </div>
                  <div className="admin-form-group">
                    <label>SMTP port</label>
                    <input type="number" min={1} max={65535} value={mail.mail_port || ""} onChange={(event) => setMail((current) => ({ ...current, mail_port: Number(event.target.value) }))} required={mail.mail_enabled} />
                  </div>
                  <div className="admin-form-group">
                    <label>Encryption</label>
                    <select value={mail.mail_encryption} onChange={(event) => setMail((current) => ({ ...current, mail_encryption: event.target.value as MailSettings["mail_encryption"] }))}>
                      <option value="tls">TLS / STARTTLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>SMTP username</label>
                    <input autoComplete="username" value={mail.mail_username || ""} onChange={(event) => setMail((current) => ({ ...current, mail_username: event.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>SMTP password / App Password</label>
                    <input type="password" autoComplete="new-password" value={mailPassword} placeholder={mail.mail_password_configured ? "Saved securely — leave blank to keep" : "Enter SMTP password"} onChange={(event) => setMailPassword(event.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label>From email</label>
                    <input type="email" value={mail.mail_from_address || ""} onChange={(event) => setMail((current) => ({ ...current, mail_from_address: event.target.value }))} required={mail.mail_enabled} />
                  </div>
                  <div className="admin-form-group">
                    <label>From name</label>
                    <input value={mail.mail_from_name || ""} onChange={(event) => setMail((current) => ({ ...current, mail_from_name: event.target.value }))} required={mail.mail_enabled} />
                  </div>
                  <div className="admin-form-group">
                    <label>Notification recipient</label>
                    <input type="email" value={mail.contact_recipient || ""} onChange={(event) => setMail((current) => ({ ...current, contact_recipient: event.target.value }))} required={mail.mail_enabled} />
                    <small>New contact requests and new orders will be sent to this address.</small>
                  </div>
                </div>
                <button className="admin-btn admin-btn-primary" disabled={busy === "mail"}>
                  <Settings size={16} /> {busy === "mail" ? "Saving..." : "Save SMTP settings"}
                </button>
              </form>
              <div className="admin-test-mail-row">
                <div className="admin-form-group">
                  <label>Test recipient</label>
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

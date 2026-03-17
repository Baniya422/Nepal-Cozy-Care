import { useEffect, useState } from "react";
import { Mail, MessageCircle, Search, Trash2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  subject: string;
  preferred_contact_method: "phone" | "whatsapp" | "email";
  order_reference?: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
};

const subjectLabels: Record<string, string> = {
  general_inquiry: "General Inquiry",
  order_support: "Order Support",
  delivery_help: "Delivery Help",
  plant_care: "Plant Care",
  bulk_order: "Bulk Order",
};

const formatSubject = (subject: string) => subjectLabels[subject] || subject.replaceAll("_", " ");

const normalizePhoneForWhatsApp = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("977")) return digits;
  if (digits.length === 10 && digits.startsWith("9")) return `977${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `977${digits.slice(1)}`;

  return digits;
};

export default function ManageContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMessages();
  }, []);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchMessages = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/admin/contact-messages`, {
        headers: authHeader(),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load contact messages.");
      }

      setMessages((data.data?.messages ?? []) as ContactMessage[]);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load contact messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId: number, status: ContactMessage["status"]) => {
    try {
      const response = await fetch(`${API}/api/contact-messages/${messageId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Could not update message status.");
      }

      await fetchMessages();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update message status.");
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm("Delete this contact message?")) return;

    try {
      const response = await fetch(`${API}/api/contact-messages/${messageId}`, {
        method: "DELETE",
        headers: authHeader(),
      });

      if (!response.ok) {
        throw new Error("Could not delete message.");
      }

      await fetchMessages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete message.");
    }
  };

  const filteredMessages = messages.filter((message) => {
    const haystack = [
      message.name,
      message.email,
      message.phone,
      message.city,
      message.subject,
      message.order_reference ?? "",
      message.message,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Contact Inbox</h2>
            <p>Review support requests, order questions, and delivery issues from the contact page.</p>
          </div>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, city, order ref, or message..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {error ? <div className="admin-error">{error}</div> : null}

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading messages...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Topic</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => {
                  const whatsappNumber = normalizePhoneForWhatsApp(message.phone);

                  return (
                    <tr key={message.id}>
                      <td>
                        <strong>{message.name}</strong>
                        <div>{message.email}</div>
                        <div>{message.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatSubject(message.subject)}</div>
                        <div>{message.city}</div>
                        <div>Preferred: {message.preferred_contact_method}</div>
                        {message.order_reference ? (
                          <div>Order: {message.order_reference}</div>
                        ) : null}
                      </td>
                      <td style={{ maxWidth: "360px" }}>{message.message}</td>
                      <td>{new Date(message.created_at).toLocaleDateString("en-NP")}</td>
                      <td>
                        <select
                          value={message.status}
                          onChange={(event) =>
                            void handleStatusChange(
                              message.id,
                              event.target.value as ContactMessage["status"]
                            )
                          }
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <a
                            className="admin-action-btn admin-action-view"
                            href={`mailto:${message.email}?subject=${encodeURIComponent(`Cozy Care Support: ${formatSubject(message.subject)}`)}`}
                            title="Email sender"
                          >
                            <Mail size={16} />
                          </a>
                          <a
                            className="admin-action-btn"
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background: "#dcfce7", color: "#16a34a" }}
                            title="Open WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <button
                            className="admin-action-btn admin-action-delete"
                            onClick={() => void handleDelete(message.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filteredMessages.length === 0 ? (
            <div className="admin-empty-state">
              <p>No contact messages found.</p>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import {
  Building2,
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Truck,
  CreditCard,
  TrendingUp,
  Info,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  notes?: string;
  total_wholesale_cost?: number;
  total_paid?: number;
  balance_due?: number;
}

interface FinancialSummary {
  cash_collected_customer: number;
  outstanding_customer_receivables: number;
  total_supplier_cost: number;
  total_supplier_paid: number;
  outstanding_supplier_payable: number;
  total_recorded_expenses: number;
  expenses_by_type: { delivery: number; packaging: number; other: number };
  estimated_gross_earnings: number;
  cash_realized_earnings: number;
  orders_with_incomplete_costs_count: number;
}

interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  details: any;
  created_at: string;
}

export default function ManageSuppliers() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "payments" | "expenses" | "audit">("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Supplier modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Record payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "Bank Transfer",
    payment_reference: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
    order_id: "",
  });

  // Record expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    order_id: "",
    expense_type: "delivery",
    amount: "",
    notes: "",
  });

  const token = localStorage.getItem("token") || "";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, finRes] = await Promise.all([
        fetch(`${API}/api/admin/suppliers`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }),
        fetch(`${API}/api/admin/suppliers/financial-summary`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }).catch(() => null),
      ]);

      if (supRes && supRes.ok) {
        const supData = await supRes.json();
        const list = Array.isArray(supData?.data)
          ? supData.data
          : Array.isArray(supData)
          ? supData
          : [];
        setSuppliers(list);
      }
      if (finRes && finRes.ok) {
        const finData = await finRes.json();
        setFinancials(finData?.data || null);
      }
    } catch (e) {
      console.error("Error loading supplier data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API}/api/admin/suppliers/audit-logs`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "audit") {
      void fetchAuditLogs();
    }
  }, [activeTab]);

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const url = editingSupplier
        ? `${API}/api/admin/suppliers/${editingSupplier.id}`
        : `${API}/api/admin/suppliers`;
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save nursery supplier");
      }

      setStatusMessage({
        type: "success",
        text: `Nursery supplier ${editingSupplier ? "updated" : "created"} successfully!`,
      });
      setShowSupplierModal(false);
      setEditingSupplier(null);
      setFormData({ name: "", contact_person: "", phone: "", address: "", notes: "" });
      void fetchData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment || !paymentForm.amount) return;

    try {
      const payload: any = {
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        payment_reference: paymentForm.payment_reference,
        payment_date: paymentForm.payment_date,
        notes: paymentForm.notes,
      };

      if (paymentForm.order_id) {
        payload.allocations = [
          {
            order_id: parseInt(paymentForm.order_id, 10),
            allocated_amount: parseFloat(paymentForm.amount),
          },
        ];
      }

      const res = await fetch(`${API}/api/admin/suppliers/${selectedSupplierForPayment.id}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record payment");
      }

      setStatusMessage({ type: "success", text: "Supplier payment recorded successfully!" });
      setShowPaymentModal(false);
      setSelectedSupplierForPayment(null);
      setPaymentForm({
        amount: "",
        payment_method: "Bank Transfer",
        payment_reference: "",
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
        order_id: "",
      });
      void fetchData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.order_id || !expenseForm.amount) return;

    try {
      const res = await fetch(`${API}/api/admin/suppliers/orders/${expenseForm.order_id}/expenses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          expense_type: expenseForm.expense_type,
          amount: parseFloat(expenseForm.amount),
          notes: expenseForm.notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record order expense");
      }

      setStatusMessage({ type: "success", text: "Order expense recorded successfully!" });
      setShowExpenseModal(false);
      setExpenseForm({ order_id: "", expense_type: "delivery", amount: "", notes: "" });
      void fetchData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const filteredSuppliers = supplierList.filter(
    (s) =>
      s?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s?.contact_person && s.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s?.phone && s.phone.includes(searchQuery))
  );

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Private Nurseries & Supplier Accounts</h1>
          <p className="admin-page-subtitle">
            Manage wholesale nursery suppliers, track plant inventory costs, record payments, and monitor order expenses.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={() => setShowExpenseModal(true)}
          >
            <Truck size={16} /> Record Order Expense
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => {
              setEditingSupplier(null);
              setFormData({ name: "", contact_person: "", phone: "", address: "", notes: "" });
              setShowSupplierModal(true);
            }}
          >
            <Plus size={16} /> Add Nursery Supplier
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.85rem 1.25rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: statusMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: statusMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${statusMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {statusMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Financial Health Overview Cards */}
      {financials && (
        <div className="admin-stats-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <DollarSign size={20} />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-label">Customer Cash Collected (COD)</span>
              <span className="admin-stat-value">NPR {financials.cash_collected_customer.toLocaleString()}</span>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                Unpaid Receivables: NPR {financials.outstanding_customer_receivables.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Building2 size={20} />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-label">Wholesale Plant Costs</span>
              <span className="admin-stat-value">NPR {financials.total_supplier_cost.toLocaleString()}</span>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                Paid: NPR {financials.total_supplier_paid.toLocaleString()} | Due: NPR {financials.outstanding_supplier_payable.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Truck size={20} />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-label">Recorded Operations Expenses</span>
              <span className="admin-stat-value">NPR {financials.total_recorded_expenses.toLocaleString()}</span>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                Delivery: NPR {financials.expenses_by_type.delivery.toLocaleString()} | Packaging: NPR {financials.expenses_by_type.packaging.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
              <TrendingUp size={20} />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-label">Realized Cash Earnings</span>
              <span className="admin-stat-value" style={{ color: financials.cash_realized_earnings >= 0 ? "#059669" : "#dc2626" }}>
                NPR {financials.cash_realized_earnings.toLocaleString()}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                Estimated Order Earnings: NPR {financials.estimated_gross_earnings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Incomplete Costs Warning Banner */}
      {financials && financials.orders_with_incomplete_costs_count > 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#92400e",
          }}
        >
          <Info size={20} />
          <div>
            <strong>Notice on Historical Orders:</strong> {financials.orders_with_incomplete_costs_count} order(s) have
            items without recorded wholesale supplier costs. Their earnings are labeled <em>Incomplete</em> rather than
            assuming zero cost.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("suppliers")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "suppliers" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "suppliers" ? "#059669" : "#6b7280",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Nursery Directory & Balances ({suppliers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "audit" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "audit" ? "#059669" : "#6b7280",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Financial Audit Trail
        </button>
      </div>

      {activeTab === "suppliers" && (
        <div className="admin-card">
          <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="admin-card-title">Registered Nursery Suppliers</h2>
            <div style={{ position: "relative", width: "260px" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="text"
                className="admin-input"
                style={{ paddingLeft: "2.25rem" }}
                placeholder="Search nurseries or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nursery Name</th>
                  <th>Contact Person & Phone</th>
                  <th>Location / Notes</th>
                  <th>Wholesale Invoiced</th>
                  <th>Paid to Date</th>
                  <th>Remaining Due</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                      Loading nursery suppliers...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                      No nursery suppliers found. Click "Add Nursery Supplier" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id}>
                      <td>
                        <strong>{sup.name}</strong>
                      </td>
                      <td>
                        <div>{sup.contact_person || "—"}</div>
                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{sup.phone || "No phone"}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {sup.address || "—"}
                        </div>
                        {sup.notes && (
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
                            {sup.notes}
                          </div>
                        )}
                      </td>
                      <td>NPR {Number(sup.total_wholesale_cost || 0).toLocaleString()}</td>
                      <td style={{ color: "#059669" }}>NPR {Number(sup.total_paid || 0).toLocaleString()}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: Number(sup.balance_due || 0) > 0 ? "#dc2626" : "#059669",
                          }}
                        >
                          NPR {Number(sup.balance_due || 0).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn--secondary"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                            onClick={() => {
                              setSelectedSupplierForPayment(sup);
                              setPaymentForm({
                                amount: String(sup.balance_due || ""),
                                payment_method: "Bank Transfer",
                                payment_reference: "",
                                payment_date: new Date().toISOString().split("T")[0],
                                notes: "",
                                order_id: "",
                              });
                              setShowPaymentModal(true);
                            }}
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--secondary"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                            onClick={() => {
                              setEditingSupplier(sup);
                              setFormData({
                                name: sup.name,
                                contact_person: sup.contact_person || "",
                                phone: sup.phone || "",
                                address: sup.address || "",
                                notes: sup.notes || "",
                              });
                              setShowSupplierModal(true);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Financial Audit Trail</h2>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Admin / User</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                      No financial audit records yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: "#f3f4f6",
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>{log.user_name}</td>
                      <td>
                        {log.entity_type} #{log.entity_id}
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                          {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {showSupplierModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "500px" }}>
            <div className="admin-modal-header">
              <h3>{editingSupplier ? "Edit Nursery Supplier" : "Add New Nursery Supplier"}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowSupplierModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSupplier}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="admin-label">Nursery Business Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kalanki Flora & Nursery"
                  />
                </div>
                <div>
                  <label className="admin-label">Contact Person</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Ram Shrestha"
                  />
                </div>
                <div>
                  <label className="admin-label">Phone Number</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9841000000"
                  />
                </div>
                <div>
                  <label className="admin-label">Physical Address</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Kalanki, Kathmandu"
                  />
                </div>
                <div>
                  <label className="admin-label">Notes & Terms</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Wholesale payment agreement, credit terms, contact timings..."
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowSupplierModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingSupplier ? "Save Changes" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedSupplierForPayment && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "500px" }}>
            <div className="admin-modal-header">
              <h3>Record Payment to {selectedSupplierForPayment.name}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem" }}>
                  <strong>Current Outstanding Due:</strong> NPR{" "}
                  {Number(selectedSupplierForPayment.balance_due || 0).toLocaleString()}
                </div>
                <div>
                  <label className="admin-label">Payment Amount (NPR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    className="admin-input"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="Amount in NPR"
                  />
                </div>
                <div>
                  <label className="admin-label">Payment Method</label>
                  <select
                    className="admin-select"
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="eSewa">eSewa</option>
                    <option value="Khalti">Khalti</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Payment Reference / Cheque No.</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={paymentForm.payment_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                    placeholder="Transaction ID or bank reference"
                  />
                </div>
                <div>
                  <label className="admin-label">Payment Date</label>
                  <input
                    type="date"
                    required
                    className="admin-input"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-label">Allocate to Specific Order ID (Optional)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={paymentForm.order_id}
                    onChange={(e) => setPaymentForm({ ...paymentForm, order_id: e.target.value })}
                    placeholder="Leave empty for general balance settlement"
                  />
                </div>
                <div>
                  <label className="admin-label">Notes</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Partial settlement remarks..."
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Order Expense Modal */}
      {showExpenseModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "500px" }}>
            <div className="admin-modal-header">
              <h3>Record Order Operational Expense</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowExpenseModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordExpense}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="admin-label">Order ID *</label>
                  <input
                    type="number"
                    required
                    className="admin-input"
                    value={expenseForm.order_id}
                    onChange={(e) => setExpenseForm({ ...expenseForm, order_id: e.target.value })}
                    placeholder="e.g. 101"
                  />
                </div>
                <div>
                  <label className="admin-label">Expense Category *</label>
                  <select
                    className="admin-select"
                    value={expenseForm.expense_type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}
                  >
                    <option value="delivery">Rider / Delivery Partner Fee</option>
                    <option value="packaging">Packaging Material (Pots/Boxes/Bubblewrap)</option>
                    <option value="other">Other Operational Cost</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Actual Expense Amount (NPR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    className="admin-input"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="Amount in NPR"
                  />
                </div>
                <div>
                  <label className="admin-label">Notes & Description</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    placeholder="Rider receipt number or packaging invoice..."
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

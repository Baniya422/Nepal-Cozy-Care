import { Search, Package, Mail, AlertCircle, HelpCircle } from "lucide-react";

interface TrackFormProps {
  orderId: string;
  setOrderId: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
  showHelp: boolean;
  setShowHelp: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TrackForm({
  orderId,
  setOrderId,
  email,
  setEmail,
  loading,
  showHelp,
  setShowHelp,
  onSubmit,
}: TrackFormProps) {
  return (
    <section className="track-order-form-section">
      <div className="track-order-container">
        <div className="track-order-form-wrapper">
          <form onSubmit={onSubmit} className="track-order-form">
            <div className="track-order-form-row">
              <div className="track-order-input-group">
                <label className="track-order-label">
                  <Package size={16} />
                  Order ID / Tracking Number
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., 12345"
                  className="track-order-input"
                  required
                />
              </div>

              <div className="track-order-input-group">
                <label className="track-order-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="track-order-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="track-order-submit-btn"
              disabled={loading}
            >
              {loading ? (
                "Tracking..."
              ) : (
                <>
                  <Search size={18} />
                  Track Order
                </>
              )}
            </button>

            <p className="track-order-privacy">
              <AlertCircle size={14} />
              Your information is secure and only used to verify your order
            </p>
          </form>

          {/* Help Section */}
          <div className="track-order-help">
            <button
              className="track-order-help-toggle"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle size={16} />
              Need help finding your order details?
            </button>
            {showHelp && (
              <div className="track-order-help-content">
                <p>
                  <strong>Order ID:</strong> Found in your order confirmation email
                  or SMS. It usually looks like "12345".
                </p>
                <p>
                  <strong>Email:</strong> Use the same email address you used when
                  placing the order.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

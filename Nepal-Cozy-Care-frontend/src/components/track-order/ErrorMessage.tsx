import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <section className="track-order-error-section">
      <div className="track-order-container">
        <div className="track-order-error">
          <AlertCircle size={48} />
          <h3>{error}</h3>
          <p>Please check your order ID and email, then try again.</p>
        </div>
      </div>
    </section>
  );
}

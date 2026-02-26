import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  submessage?: string;
}

export default function EmptyState({
  message = "No items found",
  submessage = "Try adjusting your search or filters",
}: EmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <Inbox size={48} className="admin-empty-icon" />
      <h3>{message}</h3>
      <p>{submessage}</p>
    </div>
  );
}

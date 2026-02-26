import { Eye, Edit, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  size?: "sm" | "md";
}

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
  size = "md",
}: ActionButtonsProps) {
  const btnClass = size === "sm" ? "admin-btn-icon-sm" : "admin-btn-icon";

  return (
    <div className="admin-actions">
      {onView && (
        <button
          className={`${btnClass} admin-btn-view`}
          onClick={onView}
          title="View"
        >
          <Eye size={size === "sm" ? 14 : 16} />
        </button>
      )}
      {onEdit && (
        <button
          className={`${btnClass} admin-btn-edit`}
          onClick={onEdit}
          title="Edit"
        >
          <Edit size={size === "sm" ? 14 : 16} />
        </button>
      )}
      {onDelete && (
        <button
          className={`${btnClass} admin-btn-delete`}
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 size={size === "sm" ? 14 : 16} />
        </button>
      )}
    </div>
  );
}

import { Plus, Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onAddNew?: () => void;
  addButtonText?: string;
  showSearch?: boolean;
  showAddButton?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onAddNew,
  addButtonText = "Add New",
  showSearch = true,
  showAddButton = true,
}: PageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="admin-header-actions">
        {showSearch && onSearchChange && (
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        {showAddButton && onAddNew && (
          <button className="admin-btn admin-btn-primary" onClick={onAddNew}>
            <Plus size={18} />
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
}

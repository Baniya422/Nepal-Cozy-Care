import { Plus, Search } from "lucide-react";

interface PlantHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onAddNew: () => void;
}

export default function PlantHeader({ searchQuery, setSearchQuery, onAddNew }: PlantHeaderProps) {
  return (
    <div className="admin-page-header">
      <h1 className="admin-page-title">Manage Plants</h1>
      <div className="admin-page-actions">
        <div className="admin-search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="admin-btn admin-btn-primary" onClick={onAddNew}>
          <Plus size={18} />
          Add New Plant
        </button>
      </div>
    </div>
  );
}

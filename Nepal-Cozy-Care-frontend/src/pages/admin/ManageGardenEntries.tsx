import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../components/admin/admin.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type GardenEntry = {
  id: number;
  nickname?: string | null;
  city?: string | null;
  room?: string | null;
  quantity: number;
  last_watered_at?: string | null;
  last_fertilized_at?: string | null;
  acquired_at?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  plant?: {
    id: number;
    name: string;
  } | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ManageGardenEntries() {
  const [entries, setEntries] = useState<GardenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/garden-entries?per_page=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load garden entries.");
      }

      setEntries((data.data?.entries ?? []) as GardenEntry[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load garden entries.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const haystack = `${entry.user?.name ?? ""} ${entry.user?.email ?? ""} ${entry.plant?.name ?? ""} ${entry.nickname ?? ""} ${entry.city ?? ""} ${entry.room ?? ""}`;
    return haystack.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2>Garden Entries</h2>
            <p>See which plants customers are tracking in their personal My Garden dashboards.</p>
          </div>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by user, plant, city, or nickname..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {error ? <div className="admin-error">{error}</div> : null}

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">Loading garden entries...</div>
          ) : (
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plant</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Added</th>
                  <th>Last Watered</th>
                  <th>Last Fertilized</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.user?.name || "Unknown user"}</strong>
                      <div>{entry.user?.email || "No email"}</div>
                    </td>
                    <td>
                      <strong>{entry.nickname || entry.plant?.name || "Unknown plant"}</strong>
                      {entry.nickname && entry.plant?.name ? <div>{entry.plant.name}</div> : null}
                    </td>
                    <td>{entry.quantity}</td>
                    <td>
                      {[entry.room, entry.city].filter(Boolean).join(", ") || "Not set"}
                    </td>
                    <td>{formatDate(entry.acquired_at)}</td>
                    <td>{formatDate(entry.last_watered_at)}</td>
                    <td>{formatDate(entry.last_fertilized_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredEntries.length === 0 ? (
            <div className="admin-empty-state">
              <p>No garden entries found.</p>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

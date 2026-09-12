import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CloudSun,
  Droplets,
  Flower2,
  Leaf,
  Pencil,
  Plus,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/myGarden.css";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
type CareAction = "water" | "fertilize";
type PlantOption = {
  id: number;
  name: string;
  image?: string | null;
  water?: string | null;
  category?: string | null;
};
type Tip = {
  id: number;
  title: string;
  category: string;
  excerpt?: string | null;
  image?: string | null;
};
type GardenEntry = {
  id: number;
  nickname?: string | null;
  city?: string | null;
  room?: string | null;
  notes?: string | null;
  quantity: number;
  acquired_at?: string | null;
  last_watered_at?: string | null;
  last_fertilized_at?: string | null;
  watering_frequency_days: number;
  fertilizing_frequency_days: number;
  next_watering_date?: string | null;
  next_fertilizing_date?: string | null;
  needs_watering: boolean;
  needs_fertilizer: boolean;
  days_until_watering: number;
  days_until_fertilizer: number;
  plant?: {
    id: number;
    name: string;
    image?: string | null;
    category?: string | null;
    light?: string | null;
    humidity?: string | null;
  } | null;
  recommended_tips: Tip[];
};
type Summary = {
  total_entries: number;
  needs_watering: number;
  needs_fertilizer: number;
};
type SeasonalReminder = {
  id: number;
  title: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  city?: string | null;
  season_key: string;
  care_tip?: {
    id: number;
    title: string;
    category: string;
  } | null;
};
type Notice = {
  tone: "success" | "error";
  text: string;
};
type GardenFormState = {
  plant_id: string;
  nickname: string;
  city: string;
  room: string;
  quantity: string;
  watering_frequency_days: string;
  fertilizing_frequency_days: string;
  acquired_at: string;
  notes: string;
};
const emptyForm: GardenFormState = {
  plant_id: "",
  nickname: "",
  city: "",
  room: "",
  quantity: "1",
  watering_frequency_days: "7",
  fertilizing_frequency_days: "30",
  acquired_at: "",
  notes: "",
};
const emptySummary: Summary = {
  total_entries: 0,
  needs_watering: 0,
  needs_fertilizer: 0,
};
const buildImageUrl = (image?: string | null) =>
  image ? `${API}/storage/${image}` : "/images/placeholder-plant.jpg";
const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const describeDueState = (daysUntil: number, label: string) => {
  if (daysUntil < 0) return `${label} overdue by ${Math.abs(daysUntil)} day(s)`;
  if (daysUntil === 0) return `${label} due today`;
  return `${label} in ${daysUntil} day(s)`;
};
export default function MyGarden() {
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("token"));
  const [entries, setEntries] = useState<GardenEntry[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [reminders, setReminders] = useState<SeasonalReminder[]>([]);
  const [seasonLabel, setSeasonLabel] = useState("Seasonal Care");
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GardenEntry | null>(null);
  const [formData, setFormData] = useState<GardenFormState>(emptyForm);
  const [cityFilter, setCityFilter] = useState("");
  const authHeaders = useCallback(() => ({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);
  const fetchGarden = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/my-garden`, {
        headers: authHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Could not load your garden.");
      }
      const nextEntries = (data.data?.entries ?? []) as GardenEntry[];
      setEntries(nextEntries);
      setSummary((data.data?.summary as Summary) ?? emptySummary);
      const firstCity = nextEntries.find((entry) => entry.city?.trim())?.city?.trim() ?? "";
      if (firstCity) {
        setCityFilter((currentCity) => currentCity || firstCity);
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not load your garden.",
      });
    } finally {
      setLoading(false);
    }
  }, [authHeaders, navigate]);
  const fetchPlants = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/plants?per_page=100`);
      const data = await response.json().catch(() => ({}));
      const items = (data.data?.plants ?? data.data?.data ?? []) as PlantOption[];
      setPlants(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error loading plants:", error);
    }
  }, []);
  const fetchReminders = useCallback(async (city: string) => {
    setLoadingReminders(true);
    try {
      const params = new URLSearchParams();
      if (city.trim()) {
        params.set("city", city.trim());
      }
      const response = await fetch(
        `${API}/api/seasonal-reminders/current${params.toString() ? `?${params.toString()}` : ""}`
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not load seasonal reminders.");
      }
      setSeasonLabel(data.data?.season_label || "Seasonal Care");
      setReminders((data.data?.reminders ?? []) as SeasonalReminder[]);
    } catch (error) {
      console.error("Error loading reminders:", error);
      setReminders([]);
    } finally {
      setLoadingReminders(false);
    }
  }, []);
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    void Promise.all([fetchGarden(), fetchPlants()]);
  }, [token, fetchGarden, fetchPlants]);
  useEffect(() => {
    if (!token) return;
    void fetchReminders(cityFilter);
  }, [token, cityFilter, fetchReminders]);
  const resetForm = () => {
    setFormData(emptyForm);
    setEditingEntry(null);
  };
  const openAddModal = () => {
    resetForm();
    setFormData((current) => ({
      ...current,
      city: cityFilter,
    }));
    setShowModal(true);
  };
  const openEditModal = (entry: GardenEntry) => {
    setEditingEntry(entry);
    setFormData({
      plant_id: String(entry.plant?.id ?? ""),
      nickname: entry.nickname ?? "",
      city: entry.city ?? "",
      room: entry.room ?? "",
      quantity: String(entry.quantity),
      watering_frequency_days: String(entry.watering_frequency_days),
      fertilizing_frequency_days: String(entry.fertilizing_frequency_days),
      acquired_at: entry.acquired_at ?? "",
      notes: entry.notes ?? "",
    });
    setShowModal(true);
  };
  const updateFormField = (field: keyof GardenFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };
  const openCareTipCategory = (category: string) => {
    navigate(`/care-tips?category=${encodeURIComponent(category)}`);
  };
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    try {
      const url = editingEntry
        ? `${API}/api/my-garden/${editingEntry.id}`
        : `${API}/api/my-garden`;
      const response = await fetch(url, {
        method: editingEntry ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          plant_id: Number(formData.plant_id),
          nickname: formData.nickname || null,
          city: formData.city || null,
          room: formData.room || null,
          quantity: Number(formData.quantity || 1),
          watering_frequency_days: Number(formData.watering_frequency_days || 7),
          fertilizing_frequency_days: Number(formData.fertilizing_frequency_days || 30),
          acquired_at: formData.acquired_at || null,
          notes: formData.notes || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not save this garden entry.");
      }
      setNotice({
        tone: "success",
        text: data.message || "Garden updated successfully.",
      });
      setShowModal(false);
      resetForm();
      await fetchGarden();
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not save this garden entry.",
      });
    }
  };
  const updateEntryAction = async (entryId: number, action: CareAction) => {
    try {
      const response = await fetch(`${API}/api/my-garden/${entryId}/${action}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }
      setNotice({
        tone: "success",
        text: data.message || "Reminder updated successfully.",
      });
      await fetchGarden();
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Action failed.",
      });
    }
  };
  const handleDelete = async (entryId: number) => {
    if (!window.confirm("Remove this plant from your garden?")) return;
    try {
      const response = await fetch(`${API}/api/my-garden/${entryId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not remove this plant.");
      }
      setNotice({
        tone: "success",
        text: data.message || "Plant removed from your garden.",
      });
      await fetchGarden();
    } catch (error) {
      setNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not remove this plant.",
      });
    }
  };
  if (!token) {
    return <GuestGardenPrompt />;
  }
  return (
    <Layout>
      <div className="my-garden-page">
        {}
        <GardenHero
          onAddPlant={openAddModal}
          onOpenHealthChecker={() => navigate("/plant-health-checker")}
        />
        {}
        <GardenSummary summary={summary} />
        {}
        <SeasonalRemindersPanel
          seasonLabel={seasonLabel}
          cityFilter={cityFilter}
          reminders={reminders}
          loading={loadingReminders}
          onCityFilterChange={setCityFilter}
          onOpenCareTip={openCareTipCategory}
        />
        {}
        <GardenEntriesSection
          notice={notice}
          loading={loading}
          entries={entries}
          onAddPlant={openAddModal}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onCareAction={updateEntryAction}
          onOpenCareTip={openCareTipCategory}
        />
        {}
        {showModal ? (
          <GardenEntryModal
            editingEntry={editingEntry}
            formData={formData}
            plants={plants}
            onClose={() => setShowModal(false)}
            onFieldChange={updateFormField}
            onSubmit={handleFormSubmit}
          />
        ) : null}
      </div>
    </Layout>
  );
}
function GuestGardenPrompt() {
  return (
    <Layout>
      <div className="my-garden-page">
        <section className="my-garden-hero">
          <div className="my-garden-shell">
            <p className="my-garden-kicker">My Garden</p>
            <h1>Keep your plants alive after checkout.</h1>
            <p>
              Track watering, fertilizer, and Nepal seasonal advice in one place once you log in.
            </p>
            <div className="my-garden-hero-actions">
              <Link to="/login" className="my-garden-primary-btn">
                Login
              </Link>
              <Link to="/register" className="my-garden-secondary-btn">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
type GardenHeroProps = {
  onAddPlant: () => void;
  onOpenHealthChecker: () => void;
};
function GardenHero({ onAddPlant, onOpenHealthChecker }: GardenHeroProps) {
  return (
    <section className="my-garden-hero">
      <div className="my-garden-shell">
        <div>
          <p className="my-garden-kicker">My Garden</p>
          <h1>Your plant care dashboard for Nepal homes.</h1>
          <p>
            Purchased plants appear here automatically. Add more manually, track watering and
            fertilizer, and follow seasonal reminders.
          </p>
        </div>
        <div className="my-garden-hero-actions">
          <button type="button" className="my-garden-primary-btn" onClick={onAddPlant}>
            <Plus size={16} />
            Add Plant
          </button>
          <button type="button" className="my-garden-secondary-btn" onClick={onOpenHealthChecker}>
            <Leaf size={16} />
            Health Checker
          </button>
        </div>
      </div>
    </section>
  );
}
type GardenSummaryProps = {
  summary: Summary;
};
function GardenSummary({ summary }: GardenSummaryProps) {
  return (
    <section className="my-garden-shell my-garden-summary">
      <article className="my-garden-summary-card">
        <span>Total Plants</span>
        <strong>{summary.total_entries}</strong>
        <p>Tracked entries in your personal garden.</p>
      </article>
      <article className="my-garden-summary-card alert">
        <span>Watering Due</span>
        <strong>{summary.needs_watering}</strong>
        <p>Plants that need water today or are overdue.</p>
      </article>
      <article className="my-garden-summary-card warn">
        <span>Fertilizer Due</span>
        <strong>{summary.needs_fertilizer}</strong>
        <p>Plants that need feeding soon.</p>
      </article>
    </section>
  );
}
type SeasonalRemindersPanelProps = {
  seasonLabel: string;
  cityFilter: string;
  reminders: SeasonalReminder[];
  loading: boolean;
  onCityFilterChange: (city: string) => void;
  onOpenCareTip: (category: string) => void;
};
function SeasonalRemindersPanel({
  seasonLabel,
  cityFilter,
  reminders,
  loading,
  onCityFilterChange,
  onOpenCareTip,
}: SeasonalRemindersPanelProps) {
  return (
    <section className="my-garden-shell my-garden-reminder-panel">
      <div className="my-garden-panel-head">
        <div>
          <p className="my-garden-panel-kicker">Nepal Seasonal Care</p>
          <h2>{seasonLabel} reminders</h2>
        </div>
        <div className="my-garden-city-filter">
          <input
            type="text"
            value={cityFilter}
            onChange={(event) => onCityFilterChange(event.target.value)}
            placeholder="City filter e.g. Kathmandu"
          />
        </div>
      </div>
      {}
      {loading ? (
        <div className="my-garden-empty">Loading seasonal reminders...</div>
      ) : reminders.length === 0 ? (
        <div className="my-garden-empty">
          No seasonal reminders yet. Add them from the admin panel and they will appear here.
        </div>
      ) : (
        <div className="my-garden-reminders-grid">
          {reminders.map((reminder) => (
            <article key={reminder.id} className="my-garden-reminder-card">
              <div className="my-garden-reminder-icon">
                <CloudSun size={20} />
              </div>
              <h3>{reminder.title}</h3>
              <p>{reminder.excerpt || reminder.content}</p>
              {reminder.care_tip ? (
                <button
                  type="button"
                  className="my-garden-inline-link"
                  onClick={() => onOpenCareTip(reminder.care_tip?.category ?? "")}
                >
                  Open related care tip
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
type GardenEntriesSectionProps = {
  notice: Notice | null;
  loading: boolean;
  entries: GardenEntry[];
  onAddPlant: () => void;
  onEdit: (entry: GardenEntry) => void;
  onDelete: (entryId: number) => Promise<void>;
  onCareAction: (entryId: number, action: CareAction) => Promise<void>;
  onOpenCareTip: (category: string) => void;
};
function GardenEntriesSection({
  notice,
  loading,
  entries,
  onAddPlant,
  onEdit,
  onDelete,
  onCareAction,
  onOpenCareTip,
}: GardenEntriesSectionProps) {
  return (
    <section className="my-garden-shell my-garden-list-section">
      <div className="my-garden-panel-head">
        <div>
          <p className="my-garden-panel-kicker">Your Plants</p>
          <h2>Care actions and next tasks</h2>
        </div>
      </div>
      {}
      {notice ? <div className={`my-garden-notice ${notice.tone}`}>{notice.text}</div> : null}
      {}
      {loading ? (
        <div className="my-garden-empty">Loading your garden...</div>
      ) : entries.length === 0 ? (
        <EmptyGardenState onAddPlant={onAddPlant} />
      ) : (
        <div className="my-garden-grid">
          {entries.map((entry) => (
            <GardenEntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
              onCareAction={onCareAction}
              onOpenCareTip={onOpenCareTip}
            />
          ))}
        </div>
      )}
    </section>
  );
}
type EmptyGardenStateProps = {
  onAddPlant: () => void;
};
function EmptyGardenState({ onAddPlant }: EmptyGardenStateProps) {
  return (
    <div className="my-garden-empty">
      <Sprout size={28} />
      <h3>Your garden is empty</h3>
      <p>Buy a plant or add one manually to start tracking your care routine.</p>
      <button type="button" className="my-garden-primary-btn" onClick={onAddPlant}>
        Add your first plant
      </button>
    </div>
  );
}
type GardenEntryCardProps = {
  entry: GardenEntry;
  onEdit: (entry: GardenEntry) => void;
  onDelete: (entryId: number) => Promise<void>;
  onCareAction: (entryId: number, action: CareAction) => Promise<void>;
  onOpenCareTip: (category: string) => void;
};
function GardenEntryCard({
  entry,
  onEdit,
  onDelete,
  onCareAction,
  onOpenCareTip,
}: GardenEntryCardProps) {
  const title = entry.nickname || entry.plant?.name || "Garden Plant";
  const subtitle =
    entry.plant?.name && entry.nickname && entry.nickname !== entry.plant.name
      ? entry.plant.name
      : entry.city || entry.room || "Tracked care entry";
  return (
    <article className="my-garden-card">
      <img
        src={buildImageUrl(entry.plant?.image)}
        alt={title}
        className="my-garden-card-image"
      />
      <div className="my-garden-card-body">
        {}
        <div className="my-garden-card-head">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <span className="my-garden-quantity">x{entry.quantity}</span>
        </div>
        {}
        <div className="my-garden-meta">
          <span>{entry.room || "Room not set"}</span>
          <span>{entry.city || "City not set"}</span>
          <span>Added {formatDate(entry.acquired_at)}</span>
        </div>
        {}
        <div className="my-garden-care-status">
          <div className={entry.needs_watering ? "due" : "ok"}>
            <Droplets size={16} />
            {describeDueState(entry.days_until_watering, "Water")}
          </div>
          <div className={entry.needs_fertilizer ? "due" : "ok"}>
            <Flower2 size={16} />
            {describeDueState(entry.days_until_fertilizer, "Feed")}
          </div>
        </div>
        {}
        {entry.notes ? <p className="my-garden-notes">{entry.notes}</p> : null}
        {}
        {entry.recommended_tips.length > 0 ? (
          <GardenTipLinks tips={entry.recommended_tips} onOpenCareTip={onOpenCareTip} />
        ) : null}
        {}
        <div className="my-garden-actions">
          <button type="button" onClick={() => void onCareAction(entry.id, "water")}>
            <Droplets size={16} />
            Mark Watered
          </button>
          <button type="button" onClick={() => void onCareAction(entry.id, "fertilize")}>
            <Flower2 size={16} />
            Mark Fertilized
          </button>
          <button type="button" onClick={() => onEdit(entry)}>
            <Pencil size={16} />
            Edit
          </button>
          <button type="button" onClick={() => void onDelete(entry.id)}>
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
type GardenTipLinksProps = {
  tips: Tip[];
  onOpenCareTip: (category: string) => void;
};
function GardenTipLinks({ tips, onOpenCareTip }: GardenTipLinksProps) {
  return (
    <div className="my-garden-tips">
      <strong>Related care tips</strong>
      <div className="my-garden-tip-links">
        {tips.map((tip) => (
          <button
            key={tip.id}
            type="button"
            className="my-garden-inline-link"
            onClick={() => onOpenCareTip(tip.category)}
          >
            {tip.title}
          </button>
        ))}
      </div>
    </div>
  );
}
type GardenEntryModalProps = {
  editingEntry: GardenEntry | null;
  formData: GardenFormState;
  plants: PlantOption[];
  onClose: () => void;
  onFieldChange: (field: keyof GardenFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
function GardenEntryModal({
  editingEntry,
  formData,
  plants,
  onClose,
  onFieldChange,
  onSubmit,
}: GardenEntryModalProps) {
  return (
    <div className="my-garden-modal-backdrop" onClick={onClose}>
      {}
      <div className="my-garden-modal" onClick={(event) => event.stopPropagation()}>
        <div className="my-garden-modal-head">
          <h3>{editingEntry ? "Edit Garden Entry" : "Add to My Garden"}</h3>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form className="my-garden-form" onSubmit={onSubmit}>
          {}
          <label>
            Plant
            <select
              value={formData.plant_id}
              onChange={(event) => onFieldChange("plant_id", event.target.value)}
              required
            >
              <option value="">Choose a plant</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
          </label>
          {}
          <div className="my-garden-form-grid">
            <label>
              Nickname
              <input
                type="text"
                value={formData.nickname}
                onChange={(event) => onFieldChange("nickname", event.target.value)}
                placeholder="Living room fern"
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                min={1}
                max={99}
                value={formData.quantity}
                onChange={(event) => onFieldChange("quantity", event.target.value)}
              />
            </label>
            <label>
              City
              <input
                type="text"
                value={formData.city}
                onChange={(event) => onFieldChange("city", event.target.value)}
                placeholder="Kathmandu"
              />
            </label>
            <label>
              Room
              <input
                type="text"
                value={formData.room}
                onChange={(event) => onFieldChange("room", event.target.value)}
                placeholder="Balcony, office, bedroom"
              />
            </label>
            <label>
              Water every (days)
              <input
                type="number"
                min={1}
                max={30}
                value={formData.watering_frequency_days}
                onChange={(event) => onFieldChange("watering_frequency_days", event.target.value)}
              />
            </label>
            <label>
              Fertilize every (days)
              <input
                type="number"
                min={7}
                max={120}
                value={formData.fertilizing_frequency_days}
                onChange={(event) =>
                  onFieldChange("fertilizing_frequency_days", event.target.value)
                }
              />
            </label>
            <label>
              Added on
              <input
                type="date"
                value={formData.acquired_at}
                onChange={(event) => onFieldChange("acquired_at", event.target.value)}
              />
            </label>
          </div>
          {}
          <label>
            Notes
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(event) => onFieldChange("notes", event.target.value)}
              placeholder="Window direction, current condition, or reminders for yourself"
            />
          </label>
          {}
          <div className="my-garden-form-actions">
            <button type="button" className="my-garden-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="my-garden-primary-btn">
              {editingEntry ? "Save Changes" : "Add Plant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

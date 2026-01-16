import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarHeart, CloudSun, MapPin } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const FALLBACK_IMAGE = "/images/winter-garden.png";

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

export default function SeasonalCarePreview() {
  const navigate = useNavigate();
  const [seasonLabel, setSeasonLabel] = useState("Seasonal Care");
  const [reminders, setReminders] = useState<SeasonalReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchSeasonalPreview();
  }, []);

  const fetchSeasonalPreview = async () => {
    try {
      const response = await fetch(`${API}/api/seasonal-reminders/current`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load seasonal reminders.");
      }

      setSeasonLabel(data.data?.season_label || "Seasonal Care");
      setReminders((data.data?.reminders ?? []) as SeasonalReminder[]);
    } catch (error) {
      console.error("Error loading seasonal reminder preview:", error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleReminders = reminders.slice(0, 2);

  return (
    <section className="seasonal-home-section">
      <div className="seasonal-home-container">
        <div className="seasonal-home-copy">
          <span className="seasonal-home-kicker">Seasonal Reminder Preview</span>
          <h2>Homepage care advice that updates with the season.</h2>
          <p>
            Your admin seasonal reminders can appear here to show users that the system
            gives timely plant-care guidance, not just product listings.
          </p>

          <div className="seasonal-home-badge">
            <CalendarHeart size={18} />
            <span>{seasonLabel} guidance is active now</span>
          </div>

          <div className="seasonal-home-actions">
            <button type="button" className="seasonal-home-btn" onClick={() => navigate("/care-tips")}>
              Explore Care Tips
            </button>
            <button
              type="button"
              className="seasonal-home-btn seasonal-home-btn-secondary"
              onClick={() => navigate("/my-garden")}
            >
              Open My Garden
            </button>
          </div>
        </div>

        <div className="seasonal-home-cards">
          {loading ? (
            <div className="seasonal-home-empty">Loading seasonal reminders...</div>
          ) : visibleReminders.length === 0 ? (
            <article className="seasonal-home-card seasonal-home-card-empty">
              <div className="seasonal-home-card-icon">
                <CloudSun size={20} />
              </div>
              <h3>{seasonLabel} preview</h3>
              <p>
                Add reminder cards from the admin panel and they will show here as fresh,
                seasonal guidance for users.
              </p>
              <button
                type="button"
                className="seasonal-home-inline-link"
                onClick={() => navigate("/care-tips?category=seasonal")}
              >
                Open seasonal care tips
                <ArrowRight size={15} />
              </button>
            </article>
          ) : (
            visibleReminders.map((reminder, index) => (
              <article
                key={reminder.id}
                className={`seasonal-home-card ${index === 0 ? "featured" : ""}`}
              >
                <img
                  src={reminder.image ? `${API}/storage/${reminder.image}` : FALLBACK_IMAGE}
                  alt={reminder.title}
                  className="seasonal-home-card-image"
                />
                <div className="seasonal-home-card-body">
                  <div className="seasonal-home-card-head">
                    <span>{seasonLabel}</span>
                    {reminder.city ? (
                      <small>
                        <MapPin size={12} />
                        {reminder.city}
                      </small>
                    ) : null}
                  </div>
                  <h3>{reminder.title}</h3>
                  <p>{reminder.excerpt || reminder.content}</p>

                  <button
                    type="button"
                    className="seasonal-home-inline-link"
                    onClick={() =>
                      navigate(
                        reminder.care_tip?.category
                          ? `/care-tips?category=${reminder.care_tip.category}`
                          : "/care-tips"
                      )
                    }
                  >
                    {reminder.care_tip ? `Open ${reminder.care_tip.title}` : "Explore related care tips"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

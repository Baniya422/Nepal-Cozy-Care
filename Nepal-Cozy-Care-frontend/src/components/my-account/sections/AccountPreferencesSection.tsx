import AccountNotice from "../AccountNotice";
import type { Notice, Preferences } from "../types";

type AccountPreferencesSectionProps = {
  notice: Notice | null;
  preferences: Preferences;
  onToggleEmailUpdates: (checked: boolean) => void;
  onToggleSmsAlerts: (checked: boolean) => void;
  onReminderChange: (days: number) => void;
  onSavePreferences: () => void;
};

export default function AccountPreferencesSection({
  notice,
  preferences,
  onToggleEmailUpdates,
  onToggleSmsAlerts,
  onReminderChange,
  onSavePreferences,
}: AccountPreferencesSectionProps) {
  return (
    <div className="account-section-stack">
      <AccountNotice notice={notice} />

      <section className="account-card">
        <div className="account-card-head">
          <h3>Notification Preferences</h3>
        </div>

        <div className="account-toggle-list">
          <label className="account-toggle-row">
            <div>
              <strong>Email updates</strong>
              <span>Receive order updates, restocks, and care notes by email.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailUpdates}
              onChange={(event) => onToggleEmailUpdates(event.target.checked)}
            />
          </label>

          <label className="account-toggle-row">
            <div>
              <strong>SMS alerts</strong>
              <span>Get delivery-sensitive notices by phone when timing matters.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.smsAlerts}
              onChange={(event) => onToggleSmsAlerts(event.target.checked)}
            />
          </label>
        </div>

        <label className="account-form-field account-reminder-field">
          <span>Care reminder frequency</span>
          <select
            value={preferences.careReminderDays}
            onChange={(event) => onReminderChange(Number(event.target.value))}
          >
            <option value={1}>Every day</option>
            <option value={3}>Every 3 days</option>
            <option value={5}>Every 5 days</option>
            <option value={7}>Every week</option>
          </select>
        </label>

        <div className="account-form-actions">
          <button type="button" className="account-primary-btn" onClick={onSavePreferences}>
            Save Preferences
          </button>
        </div>
      </section>
    </div>
  );
}

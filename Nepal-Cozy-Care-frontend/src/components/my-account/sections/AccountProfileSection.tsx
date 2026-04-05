import type { FormEvent } from "react";
import AccountNotice from "../AccountNotice";
import type { Notice, ProfileForm } from "../types";

type AccountProfileSectionProps = {
  notice: Notice | null;
  profileForm: ProfileForm;
  memberSinceLabel: string;
  profileSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChangeProfileField: (field: keyof ProfileForm, value: string) => void;
};

export default function AccountProfileSection({
  notice,
  profileForm,
  memberSinceLabel,
  profileSaving,
  onSubmit,
  onChangeProfileField,
}: AccountProfileSectionProps) {
  return (
    <div className="account-section-stack">
      <AccountNotice notice={notice} />

      <div className="account-profile-grid">
        <section className="account-card">
          <div className="account-card-head">
            <h3>Snapshot</h3>
          </div>
          <div className="account-profile-summary">
            <div>
              <p className="account-field-label">Full name</p>
              <strong>{profileForm.name || "Not set"}</strong>
            </div>
            <div>
              <p className="account-field-label">Email</p>
              <strong>{profileForm.email || "Not set"}</strong>
            </div>
            <div>
              <p className="account-field-label">Phone</p>
              <strong>{profileForm.phone || "Add a phone number for delivery calls"}</strong>
            </div>
            <div>
              <p className="account-field-label">Member since</p>
              <strong>{memberSinceLabel}</strong>
            </div>
          </div>
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Edit Profile</h3>
          </div>

          <form className="account-form" onSubmit={onSubmit}>
            <label className="account-form-field">
              <span>Full name</span>
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) => onChangeProfileField("name", event.target.value)}
                placeholder="Your full name"
              />
            </label>

            <label className="account-form-field">
              <span>Email address</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => onChangeProfileField("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="account-form-field">
              <span>Phone number</span>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(event) => onChangeProfileField("phone", event.target.value)}
                placeholder="+977 98XXXXXXXX"
              />
            </label>

            <p className="account-form-hint">
              Phone number is saved locally for faster checkout and delivery communication.
            </p>

            <div className="account-form-actions">
              <button type="submit" className="account-primary-btn" disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

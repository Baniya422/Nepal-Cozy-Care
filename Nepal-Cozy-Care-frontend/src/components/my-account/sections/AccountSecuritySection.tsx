import type { FormEvent } from "react";
import { LogOut, Shield } from "lucide-react";
import AccountNotice from "../AccountNotice";
import type { Notice, PasswordForm } from "../types";

type AccountSecuritySectionProps = {
  notice: Notice | null;
  passwordForm: PasswordForm;
  passwordSaving: boolean;
  passwordChangedLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChangePasswordField: (field: keyof PasswordForm, value: string) => void;
  onLogoutThisDevice: () => void;
  onLogoutAllDevices: () => void;
};

export default function AccountSecuritySection({
  notice,
  passwordForm,
  passwordSaving,
  passwordChangedLabel,
  onSubmit,
  onChangePasswordField,
  onLogoutThisDevice,
  onLogoutAllDevices,
}: AccountSecuritySectionProps) {
  return (
    <div className="account-section-stack">
      <AccountNotice notice={notice} />

      <div className="account-security-grid">
        <section className="account-card">
          <div className="account-card-head">
            <h3>Password</h3>
          </div>

          <div className="account-security-summary">
            <p>
              Last updated: <strong>{passwordChangedLabel}</strong>
            </p>
            <p>Updating your password signs out other devices and keeps this one active.</p>
          </div>

          <form className="account-form" onSubmit={onSubmit}>
            <label className="account-form-field">
              <span>Current password</span>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(event) => onChangePasswordField("current_password", event.target.value)}
                placeholder="Enter current password"
              />
            </label>

            <label className="account-form-field">
              <span>New password</span>
              <input
                type="password"
                value={passwordForm.password}
                onChange={(event) => onChangePasswordField("password", event.target.value)}
                placeholder="Minimum 6 characters"
              />
            </label>

            <label className="account-form-field">
              <span>Confirm new password</span>
              <input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(event) => onChangePasswordField("password_confirmation", event.target.value)}
                placeholder="Repeat new password"
              />
            </label>

            <div className="account-form-actions">
              <button type="submit" className="account-primary-btn" disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Session Controls</h3>
          </div>

          <div className="account-session-actions">
            <button type="button" className="account-secondary-btn" onClick={onLogoutThisDevice}>
              <LogOut size={16} />
              Logout This Device
            </button>
            <button type="button" className="account-danger-btn" onClick={onLogoutAllDevices}>
              <Shield size={16} />
              Logout All Devices
            </button>
          </div>

          <p className="account-form-hint">
            Use logout all if you signed in on another laptop or shared browser and want to invalidate
            every active session.
          </p>
        </section>
      </div>
    </div>
  );
}

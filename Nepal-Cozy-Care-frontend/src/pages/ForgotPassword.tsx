import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./auth.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewCode, setPreviewCode] = useState("");

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const parseApiError = (status: number, payload: any, fallback: string) => {
    if (status >= 500) {
      return "Server error. Please try again in a moment.";
    }

    return (
      payload?.errors?.email?.[0] ||
      payload?.errors?.code?.[0] ||
      payload?.errors?.password?.[0] ||
      payload?.message ||
      fallback
    );
  };

  const handleSendCode = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          parseApiError(res.status, data, "Could not send password reset code.")
        );
      }

      setCodeSent(true);
      setSuccess(data?.message || "If an account exists for that email, a reset code has been sent.");
      setPreviewCode(data?.development_code ?? "");
      if (data?.development_code) {
        setCode(data.development_code);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!code.trim()) {
      setError("Reset code is required.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Reset code must be exactly 6 digits.");
      return;
    }
    if (!password) {
      setError("New password is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(parseApiError(res.status, data, "Password reset failed."));
      }

      navigate("/login", {
        state: {
          email: email.trim(),
          message: "Password reset successful. Please log in with your new password.",
        },
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 4c-6.5 0-12 2.5-15 7.5C2.5 16.5 4 20 8.5 20c5 0 9.5-4.5 10.5-11.5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 18c2-3 6-6 11-8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Request a reset code, then choose a new password.</p>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
        {success ? <div className="auth-alert auth-alert--success">{success}</div> : null}
        {previewCode ? (
          <div className="auth-dev-panel">
            <div className="auth-dev-label">Local Development Code</div>
            <div className="auth-dev-code">{previewCode}</div>
            <p className="auth-dev-help">
              Email is not configured, so the reset code is shown here and filled in for you.
            </p>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleResetPassword}>
          <label className="auth-label">
            Email Address
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
              autoComplete="email"
            />
          </label>

          <button
            className="auth-btn auth-btn--secondary"
            disabled={sendingCode}
            type="button"
            onClick={handleSendCode}
          >
            {sendingCode ? "Sending code..." : codeSent ? "Resend Code" : "Send Reset Code"}
          </button>

          <label className="auth-label">
            Reset Code
            <input
              className="auth-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              pattern="\d{6}"
              autoComplete="one-time-code"
            />
          </label>

          <label className="auth-label">
            New Password
            <input
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              type="password"
              autoComplete="new-password"
            />
          </label>

          <label className="auth-label">
            Confirm New Password
            <input
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="........"
              type="password"
              autoComplete="new-password"
            />
          </label>

          <button className="auth-btn" disabled={loading} type="submit">
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="auth-footer">
            <span>Back to login?</span>
            <Link className="auth-link" to="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

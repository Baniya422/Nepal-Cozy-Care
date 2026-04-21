import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

type RegisterResponse = {
  message?: string;
  user?: any;
  errors?: Record<string, string[]>;
};

// Use empty string to leverage Vite proxy, or fallback to direct URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const parseApiError = (status: number, payload: any) => {
    if (status >= 500) {
      return "Server error. Please try again in a moment.";
    }

    return (
      payload?.errors?.email?.[0] ||
      payload?.errors?.password?.[0] ||
      payload?.errors?.name?.[0] ||
      payload?.message ||
      "Registration failed."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      // 1) Register
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          password_confirmation: confirmPassword, // Laravel default
        }),
      });

      const data: RegisterResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = parseApiError(res.status, data);
        throw new Error(msg);
      }

      navigate("/login", {
        state: {
          email,
          message: data.message ?? "Account created successfully. You can now log in.",
        },
      });
    } catch (err: any) {
      if (err?.message === "Failed to fetch") {
        setError("Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000");
      } else {
        setError(err?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          {/* Leaf icon */}
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

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start your plant care journey today</p>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
        {success ? <div className="auth-alert auth-alert--success">{success}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <label className="auth-label">
            Full Name
            <input
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              autoComplete="off"
              type="text"
            />
          </label>

          <label className="auth-label">
            Email Address
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
              autoComplete="off"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="off"
            />
          </label>

          <label className="auth-label">
            Confirm Password
            <input
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="off"
            />
          </label>

          <button className="auth-btn" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link className="auth-link" to="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

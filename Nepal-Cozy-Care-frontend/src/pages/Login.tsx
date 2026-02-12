import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required.");
    if (!password) return setError("Password is required.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.errors?.email?.[0] ||
          data?.errors?.password?.[0] ||
          "Login failed.";
        throw new Error(msg);
      }

      // ✅ Save token + user
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirect after login
      navigate("/plants"); // change if your app uses a different route
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

        <div className="auth-topline">Welcome Back</div>
        <p className="auth-subtitle">Login to continue your plant care journey</p>

        {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </label>

          <button className="auth-btn" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Just UI for now. You can wire backend later */}
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => alert("Forgot password can be added later.")}
          >
            Forgot your password?
          </button>

          <div className="auth-footer">
            <span>Don’t have an account?</span>
            <Link className="auth-link" to="/register">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

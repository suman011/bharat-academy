import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginWithEmailPassword } from "../utils/authStore";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/courses";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <section className="section-page auth-page auth-page--login">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-head">
            <span className="mini-label">Login</span>
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">Use your email and password to continue.</p>
          </div>

          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                await loginWithEmailPassword({ email, password });
                navigate(next);
              } catch (err) {
                setError(err?.message || "Login failed.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="auth-form-grid">
              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            {error ? (
              <div className="auth-error" role="alert">
                {error}
              </div>
            ) : null}

            <button className="primary-btn full-btn" type="submit" disabled={loading || !email.trim() || !password.trim()}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="auth-foot">
              <span>New here?</span>
              <Link to="/signup" className="auth-link">
                Create account
              </Link>
            </div>

            <div className="auth-foot">
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { requestPasswordReset, resetPasswordWithToken } from "../utils/authStore";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleRequestLink(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const data = await requestPasswordReset({ email });
      if (data.mode === "demo" && data.resetUrl) {
        setInfo(`Demo reset link: ${data.resetUrl}`);
      } else {
        setInfo("If this email exists, a reset link has been sent.");
      }
    } catch (err) {
      setError(err?.message || "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      await resetPasswordWithToken({ token, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-page auth-page auth-page--forgot">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-head">
            <span className="mini-label">Forgot password</span>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-subtitle">
              {token ? "Set a new password for your account." : "We’ll email you a password reset link."}
            </p>
          </div>

          <form className="auth-form" onSubmit={token ? handleResetPassword : handleRequestLink}>
            <div className="auth-form-grid">
              {token ? null : (
                <label className="auth-field">
                  <span className="auth-label">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </label>
              )}

              {token ? (
                <label className="auth-field">
                  <span className="auth-label">New password</span>
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    placeholder="Create a new password"
                    required
                    minLength={6}
                  />
                </label>
              ) : null}
            </div>

            {info ? <div className="auth-info">{info}</div> : null}
            {error ? (
              <div className="auth-error" role="alert">
                {error}
              </div>
            ) : null}

            <button
              className="primary-btn full-btn"
              type="submit"
              disabled={
                loading ||
                (token ? !newPassword.trim() : !email.trim())
              }
            >
              {loading ? (token ? "Resetting..." : "Sending...") : token ? "Reset password" : "Send reset link"}
            </button>

            <div className="auth-foot">
              <Link to="/login" className="auth-link">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../utils/authStore";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup({ name, email, mobile, password });
      navigate("/courses");
    } catch (err) {
      setError(err?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-page auth-page auth-page--signup">
      <div className="container auth-container">
        <div className="auth-card">
          <div className="auth-head">
            <span className="mini-label">Sign up</span>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Join the academy to enroll and keep track of your learning progress.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-grid">
              <label className="auth-field">
                <span className="auth-label">Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" />
              </label>

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

              <label className="auth-field">
                <span className="auth-label">Mobile (optional)</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="Create a password"
                />
              </label>
            </div>

            {error ? (
              <div className="auth-error" role="alert">
                {error}
              </div>
            ) : null}

            <button className="primary-btn full-btn" type="submit" disabled={loading || !password.trim()}>
              {loading ? "Creating..." : "Create account"}
            </button>

            <div className="auth-foot">
              <span>Already have an account?</span>
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


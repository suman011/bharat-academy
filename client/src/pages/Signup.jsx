import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY_KEY,
  dialFromPhoneCountryKey,
  formatPhoneCountryOption,
  toPhoneCountryKey,
} from "../data/countryCallingCodes";
import { signup } from "../utils/authStore";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryKey, setPhoneCountryKey] = useState(DEFAULT_PHONE_COUNTRY_KEY);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedDial = dialFromPhoneCountryKey(phoneCountryKey);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const digits = String(mobile || "").replace(/\D/g, "");
      const mobileForApi = digits.length > 0 ? `${selectedDial}${digits}` : "";
      await signup({ name, email, mobile: mobileForApi, password });
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
                <span className="auth-label">Mobile number</span>
                <div className="auth-mobile-row">
                  <select
                    className="auth-mobile-select"
                    value={phoneCountryKey}
                    onChange={(e) => setPhoneCountryKey(e.target.value)}
                    aria-label="Country calling code"
                  >
                    {PHONE_COUNTRIES.map((c) => (
                      <option key={toPhoneCountryKey(c)} value={toPhoneCountryKey(c)}>
                        {formatPhoneCountryOption(c)}
                      </option>
                    ))}
                  </select>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 15))}
                    placeholder={selectedDial === "+91" ? "10-digit number" : "National number"}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-label="Mobile number without country code"
                  />
                </div>
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

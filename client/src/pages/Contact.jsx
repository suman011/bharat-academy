import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaEnvelope, FaGlobe, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY_KEY,
  dialFromPhoneCountryKey,
  formatPhoneCountryOption,
  toPhoneCountryKey,
} from "../data/countryCallingCodes";

const ENQUIRY_PHONE_TEL = "+919309399799";
const ENQUIRY_PHONE_DISPLAY = "+91 93093 99799";
/** Receives enquiry emails via FormSubmit (free). First use: confirm the activation email in this inbox. */
const ENQUIRY_EMAIL = "bharatskilldevelopmentacademy@gmail.com";
/** Use VITE_FORMSUBMIT_ID (hex from FormSubmit activation) so the request URL does not expose the raw email. */
const FORMSUBMIT_ID =
  (import.meta.env.VITE_FORMSUBMIT_ID || "").trim() || ENQUIRY_EMAIL;
const FORMSUBMIT_AJAX = `https://formsubmit.co/ajax/${encodeURIComponent(FORMSUBMIT_ID)}`;

const WHATSAPP_URL = `https://wa.me/919309399799?text=${encodeURIComponent(
  "Hi, I would like to enquire about courses at Bharat Skill Development Academy."
)}`;

export default function Contact() {
  const [phoneCountryKey, setPhoneCountryKey] = useState(DEFAULT_PHONE_COUNTRY_KEY);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  /** Honeypot: leave empty; bots often fill hidden fields — FormSubmit drops non-empty _honey. */
  const [honeypot, setHoneypot] = useState("");

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleMobileDigits(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setFormData((prev) => ({ ...prev, mobile: digits }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (honeypot.trim()) {
      setSuccess(
        "Thank you — your enquiry was sent to our team. We'll get back to you soon."
      );
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch(FORMSUBMIT_AJAX, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          mobile: `${dialFromPhoneCountryKey(phoneCountryKey)} ${formData.mobile}`.trim(),
          email: formData.email,
          message: formData.message,
          _subject: `[Website] Course enquiry — ${formData.name}`,
          _replyto: formData.email,
          _template: "table",
          _captcha: "false",
          _honey: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Could not send enquiry");
      }

      setSuccess(
        "Thank you — your enquiry was sent to our team. We'll get back to you soon."
      );
      setFormData({ name: "", mobile: "", email: "", message: "" });
      setHoneypot("");
    } catch {
      setError(
        "We couldn't send the form just now. Please call, WhatsApp, or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-page contact-page">
      <Helmet>
        <title>Contact & Admission Enquiry | Bharat Skill Development Academy</title>
        <meta
          name="description"
          content="Contact Bharat Skill Development Academy for course enquiry, admission, and demos — phone, WhatsApp, or form. Pune, India."
        />
        <link rel="canonical" href="https://bharatskillacademy.com/contact" />
      </Helmet>
      <div className="container">
        <header className="page-head theme-section-head contact-page__intro">
          <span>We're here to help</span>
          <h1>Contact &amp; admission enquiry</h1>
          <p>
            Call or WhatsApp for a quick course discussion, or send the form and we&apos;ll reply as
            soon as we can.
          </p>
        </header>

        <div className="contact-grid contact-grid--enhanced">
          <div className="info-card contact-info contact-info-panel">
            <span className="mini-label">Contact Us</span>
            <h2>Start your admission enquiry</h2>
            <p className="contact-info-panel__lede">
              Tell us which track you&apos;re interested in — IT, Automation and Robotics, job-oriented programs,
              or packages — and we&apos;ll guide you on the next steps.
            </p>

            <div className="contact-channels" role="list">
              <a href={`tel:${ENQUIRY_PHONE_TEL}`} className="contact-channel" role="listitem">
                <span className="contact-channel__icon" aria-hidden>
                  <FaPhoneAlt />
                </span>
                <div className="contact-channel__text">
                  <span className="contact-channel__label">Course enquiry (phone)</span>
                  <span className="contact-channel__value">{ENQUIRY_PHONE_DISPLAY}</span>
                  <span className="contact-channel__hint">Tap to call</span>
                </div>
              </a>

              <a
                href={`mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent("Course enquiry — Bharat Skill Development Academy")}`}
                className="contact-channel"
                role="listitem"
              >
                <span className="contact-channel__icon" aria-hidden>
                  <FaEnvelope />
                </span>
                <div className="contact-channel__text">
                  <span className="contact-channel__label">Email</span>
                  <span className="contact-channel__value">{ENQUIRY_EMAIL}</span>
                  <span className="contact-channel__hint">Tap to send email</span>
                </div>
              </a>

              <div className="contact-channel contact-channel--static" role="listitem">
                <span className="contact-channel__icon" aria-hidden>
                  <FaGlobe />
                </span>
                <div className="contact-channel__text">
                  <span className="contact-channel__label">Learning mode</span>
                  <span className="contact-channel__value">Online / Offline</span>
                  <span className="contact-channel__hint">Choose what suits you</span>
                </div>
              </div>
            </div>

            <a
              href={WHATSAPP_URL}
              className="contact-whatsapp-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="contact-whatsapp-btn__icon" aria-hidden />
              <span>
                <strong>WhatsApp</strong>
                <small>Same number — fast replies</small>
              </span>
            </a>
          </div>

          <form className="form-card-ui contact-form contact-form-panel" onSubmit={handleSubmit}>
            <span className="mini-label">Send a message</span>
            <h3>Enquiry form</h3>
            {success ? <div className="success-box">{success}</div> : null}
            {error ? (
              <div className="contact-error-box" role="alert">
                {error}{" "}
                <a href={`mailto:${ENQUIRY_EMAIL}`} className="contact-error-box__link">
                  {ENQUIRY_EMAIL}
                </a>
              </div>
            ) : null}
            <p className="contact-form-panel__hint">
              Fields marked <span className="contact-required-star">*</span> are required. Your
              enquiry is emailed to <strong>{ENQUIRY_EMAIL}</strong>.
            </p>
            <div className="contact-form-honey" aria-hidden="true">
              <label>
                Company
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>
            <div className="form-grid contact-form-grid">
              <label className="contact-field">
                <span className="contact-field__label">
                  Full name <span className="contact-required-star">*</span>
                </span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="contact-field contact-field--phone">
                <span className="contact-field__label">
                  Mobile number <span className="contact-required-star">*</span>
                </span>
                <div className="contact-phone-row">
                  <select
                    className="contact-phone-row__dial"
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
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    className="contact-phone-row__number"
                    value={formData.mobile}
                    onChange={handleMobileDigits}
                    placeholder={dialFromPhoneCountryKey(phoneCountryKey) === "+91" ? "10-digit number" : "Your number"}
                    autoComplete="tel-national"
                    required
                    minLength={6}
                    maxLength={15}
                  />
                </div>
              </label>
              <label className="contact-field">
                <span className="contact-field__label">
                  Email <span className="contact-required-star">*</span>
                </span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="contact-field contact-field--full">
                <span className="contact-field__label">
                  Message <span className="contact-required-star">*</span>
                </span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Which courses or career goal are you interested in?"
                  rows="5"
                  required
                />
              </label>
            </div>
            <button
              className="primary-btn full-btn contact-submit-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Submit enquiry"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

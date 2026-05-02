import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaLaptopCode, FaBrain, FaUserGraduate, FaShieldAlt } from "react-icons/fa";
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY_KEY,
  dialFromPhoneCountryKey,
  formatPhoneCountryOption,
  toPhoneCountryKey,
} from "../data/countryCallingCodes";
import { industry40Categories, INDUSTRY40_CATEGORY_COUNT } from "../data/industry40Catalog";
import { courseCategories, IT_CORE_CATEGORY_COUNT } from "../data/courses";
import CourseCategoryCard from "../components/CourseCategoryCard";
import ItCoursesTierGrid from "../components/ItCoursesTierGrid";
import HomeMissionCarousel from "../components/HomeMissionCarousel";
import { apiUrl } from "../utils/apiBase";

const slugify = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Home() {
  const [demoForm, setDemoForm] = useState({
    courseKey: "",
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phoneCountryKey: DEFAULT_PHONE_COUNTRY_KEY,
    phone: "",
    notes: "",
  });

  const demoCourseOptions = useMemo(() => {
    const map = new Map();
    for (const cat of courseCategories) {
      for (const item of cat.items || []) {
        const key = slugify(item.name);
        if (!key || map.has(key)) continue;
        map.set(key, { key, label: item.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, []);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoResult, setDemoResult] = useState(null);

  const phoneDigits = String(demoForm.phone || "").replace(/\D/g, "");
  const selectedDial = dialFromPhoneCountryKey(demoForm.phoneCountryKey);
  const fullMobile = `${selectedDial}${phoneDigits}`;

  return (
    <>
      <Helmet>
        <title>Best Technical Training Institute in India | Bharat Skill Development Academy</title>
        <meta
          name="description"
          content="Top institute for Full Stack MERN, AI & Machine Learning, Cyber Security, and Automation and Robotics in Pune, India. Practical training, projects, and career support."
        />
        <link rel="canonical" href="https://bharatskillacademy.com/" />
      </Helmet>
      <section className="hero-section">
        <div className="hero-banner-note" role="note" aria-label="Industry collaboration note">
          The Only Institute with Strong Industry Collaboration for On-Job Training &amp; Career Assistance
        </div>
        <div className="container hero-grid">
          <div className="hero-content theme-stagger-children">
            <div className="eyebrow">Bharat Skill Development Academy</div>
            <h1>Best Technical Training Institute in India</h1>
            <p>
              Bharat Skill Development Academy offers industry-ready programs in AI, Machine Learning, Data Science, Full
              Stack Development, Cyber Security, Computer Vision, and Automation &amp; Robotics. Learn through hands-on
              projects, real-world applications, and structured learning paths designed to take you from fundamentals to
              advanced expertise.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="primary-btn">Explore Courses</Link>
              <Link to="/contact" className="primary-btn">Contact Us</Link>
            </div>
            <div className="hero-note">
              <strong>Bharat Skill Development Academy</strong> – preparing learners for success with modern skills,
              hands-on practice, and career-focused training
            </div>
          </div>

          <div className="hero-panel theme-chips-reveal">
            <div className="hero-panel-book-demo">
              <a href="#book-demo" className="book-demo-pill-btn">
                <span className="book-demo-pill-btn__orb" aria-hidden="true">
                  <svg
                    className="book-demo-pill-btn__arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="book-demo-pill-btn__text">Book a demo</span>
              </a>
            </div>
            <div className="feature-chip"><FaBrain /> AI & Machine Learning</div>
            <div className="feature-chip"><FaLaptopCode /> Full Stack & Programming</div>
            <div className="feature-chip"><FaShieldAlt /> Security & API Skills</div>
            <div className="feature-chip"><FaUserGraduate /> Interview & Career Prep</div>
            <div className="hero-card">
              <h3>Bonus Signature Course</h3>
              <p>Factory Automation and Robotics</p>
              <small>Smart Factory Basics + Robotics + Vision AI</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block home-seo-block">
        <div className="container home-seo-block__inner">
          <HomeMissionCarousel />
        </div>
      </section>

      <section className="keywords-section">
        <div className="container keywords-grid theme-stagger-keywords">
          <div className="keyword-box">
            <span className="keyword-title">Industry Experts</span>
            <span className="keyword-desc">Learn from the best</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">Career Guidance</span>
            <span className="keyword-desc">Tailored action plans</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">Code Review</span>
            <span className="keyword-desc">Project feedback</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">Mock Interviews</span>
            <span className="keyword-desc">Interview prep</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">Personal Mentoring</span>
            <span className="keyword-desc">1:1 expert sessions</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">CV Review</span>
            <span className="keyword-desc">Resume feedback</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">Learning Path Guide</span>
            <span className="keyword-desc">Structured roadmap</span>
          </div>
          <div className="keyword-box">
            <span className="keyword-title">Job Support</span>
            <span className="keyword-desc">Placement assistance</span>
          </div>
        </div>
      </section>

      <section className="section-block section-block--it-tiers">
        <div className="container">
          <ItCoursesTierGrid
            categories={courseCategories.slice(0, IT_CORE_CATEGORY_COUNT)}
            className="it-courses-block--home"
            eyebrow="Learning tracks"
            title="IT Courses"
            lede="Three clear levels — start where you fit, then grow into advanced engineering and industry skills."
            showCourseImages={false}
            layout="rows"
          />
        </div>
      </section>

      <section className="section-block section-block--it-tiers section-block--i4-tiers">
        <div className="container">
          <ItCoursesTierGrid
            categories={industry40Categories}
            className="it-courses-block--home"
            eyebrow="Learning tracks"
            title="Automation and Robotics courses"
            lede="Three clear levels — start where you fit, then grow into PLC, SCADA, IIoT, robotics, analytics, OT security, and smart factory architecture."
            showCourseImages={false}
            layout="rows"
          />
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-head theme-section-head">
            <span>More programs</span>
            <h2>Specialized tracks, job prep, and packages</h2>
            <p>
              Premium programs, short-term courses, job-oriented paths, and value bundles — beyond core IT and Automation and Robotics paths.
            </p>
          </div>

          <div className="category-grid">
            {courseCategories
              .slice(IT_CORE_CATEGORY_COUNT + INDUSTRY40_CATEGORY_COUNT)
              .map((category, index) => (
                <CourseCategoryCard
                  key={category.title}
                  category={category}
                  revealIndex={index}
                />
              ))}
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container why-grid">
          <div className="why-card">
            <h3>Why students choose this academy</h3>
            <ul>
              <li>Structured roadmap from fundamentals to advanced mastery</li>
              <li>Industry-aligned curriculum built for real job roles</li>
              <li>Hands-on projects, labs, and portfolio-ready work</li>
              <li>Career support: resume, interviews, and placement guidance</li>
              <li>Modern skills across AI, Automation &amp; Robotics</li>
            </ul>
          </div>
          <div className="why-card accent">
            <h3>
              Skills That Get You Hired
            </h3>
            <p>
              Learn in-demand technologies with hands-on experience, live projects, and career support designed for real
              job outcomes.
            </p>
            <Link to="/contact" className="primary-btn small-btn">Start Admission Enquiry</Link>
          </div>
        </div>
      </section>

      {/* Course demo lead section (Home only) */}
      <section className="demo-lead-section" id="book-demo" aria-label="Course demo request">
        <div className="container">
          <div className="demo-lead-grid">
            <div className="demo-lead-copy">
              <h2 className="demo-lead-title">Get started today</h2>
              <p className="demo-lead-subtitle">
                A quick live session to understand what you&apos;ll learn, how the course works, and how to start.
              </p>
              <ul className="demo-lead-bullets">
                <li>30-minute guided demo</li>
                <li>Get a learning roadmap for your goal</li>
                <li>Q&amp;A with the trainer</li>
              </ul>
              <div className="demo-lead-note">
                Fill the form on the right. We&apos;ll contact you to schedule the demo.
              </div>
            </div>

            <div className="demo-lead-form">
              <div className="demo-lead-form-head">
                <span className="demo-lead-badge">Course demo</span>
                <div className="demo-lead-form-course">Book a live session</div>
              </div>

              <div className="demo-form-grid">
                <label className="demo-field demo-field--full">
                  <span className="demo-label">Course name *</span>
                  <select
                    value={demoForm.courseKey}
                    onChange={(e) => setDemoForm((p) => ({ ...p, courseKey: e.target.value }))}
                    required
                    aria-required="true"
                  >
                    <option value="">— Select a course —</option>
                    {demoCourseOptions.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                    <option value="__other__">Other / not listed — describe in notes</option>
                  </select>
                </label>
                <label className="demo-field">
                  <span className="demo-label">First name *</span>
                  <input
                    value={demoForm.firstName}
                    onChange={(e) => setDemoForm((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="John"
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label className="demo-field">
                  <span className="demo-label">Last name *</span>
                  <input
                    value={demoForm.lastName}
                    onChange={(e) => setDemoForm((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Doe"
                    autoComplete="family-name"
                    required
                  />
                </label>
                <label className="demo-field demo-field--full">
                  <span className="demo-label">Company name *</span>
                  <input
                    value={demoForm.companyName}
                    onChange={(e) => setDemoForm((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="Your company / institute"
                    autoComplete="organization"
                    required
                  />
                </label>
                <label className="demo-field demo-field--full">
                  <span className="demo-label">Company email *</span>
                  <input
                    value={demoForm.email}
                    onChange={(e) => setDemoForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="name@company.com"
                    autoComplete="email"
                    type="email"
                    required
                  />
                </label>
                <label className="demo-field demo-field--full">
                  <span className="demo-label">
                    Mobile number <span className="demo-required-star" aria-hidden="true">*</span>
                  </span>
                  <div className="demo-phone-row">
                    <select
                      className="demo-phone-cc"
                      value={demoForm.phoneCountryKey}
                      onChange={(e) => setDemoForm((p) => ({ ...p, phoneCountryKey: e.target.value }))}
                      aria-label="Country calling code"
                    >
                      {PHONE_COUNTRIES.map((c) => (
                        <option key={toPhoneCountryKey(c)} value={toPhoneCountryKey(c)}>
                          {formatPhoneCountryOption(c)}
                        </option>
                      ))}
                    </select>
                    <input
                      className="demo-phone-national"
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder={selectedDial === "+91" ? "10-digit number" : "National number"}
                      autoComplete="tel-national"
                      inputMode="tel"
                      required
                    />
                  </div>
                </label>
                <label className="demo-field demo-field--full">
                  <span className="demo-label">Notes (optional)</span>
                  <textarea
                    value={demoForm.notes}
                    onChange={(e) => setDemoForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="What do you want to learn in this demo?"
                    rows={4}
                  />
                </label>
              </div>

              {demoResult ? (
                <p
                  role="status"
                  aria-live="polite"
                  style={{
                    margin: "10px 0 0",
                    color: demoResult.ok ? "#065f46" : "#b91c1c",
                    fontWeight: 850,
                  }}
                >
                  {demoResult.message}
                </p>
              ) : null}

              <button
                type="button"
                className="demo-submit-btn"
                aria-busy={demoSubmitting}
                disabled={
                  demoSubmitting ||
                  !demoForm.courseKey ||
                  demoForm.firstName.trim().length < 1 ||
                  demoForm.lastName.trim().length < 1 ||
                  demoForm.companyName.trim().length < 2 ||
                  !demoForm.email.includes("@") ||
                  phoneDigits.trim().length < 8
                }
                onClick={async () => {
                  setDemoSubmitting(true);
                  setDemoResult(null);
                  try {
                    const name = `${demoForm.firstName} ${demoForm.lastName}`.trim();
                    const courseLabel =
                      demoForm.courseKey === "__other__"
                        ? "Other / not listed (see notes)"
                        : demoCourseOptions.find((o) => o.key === demoForm.courseKey)?.label ||
                          demoForm.courseKey;
                    const apiCourseKey =
                      demoForm.courseKey && demoForm.courseKey !== "__other__"
                        ? demoForm.courseKey
                        : null;
                    const res = await fetch(apiUrl("/leads/callback"), {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        mobile: fullMobile,
                        courseKey: apiCourseKey,
                        courseLabel,
                        company: demoForm.companyName.trim(),
                        leadEmail: demoForm.email.trim(),
                        notes: demoForm.notes.trim(),
                      }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data.ok) throw new Error(data.error || "Demo request failed.");
                    setDemoResult({ ok: true, message: "Demo request submitted. We will contact you soon." });
                    setDemoForm({
                      courseKey: "",
                      firstName: "",
                      lastName: "",
                      companyName: "",
                      email: "",
                      phoneCountryKey: DEFAULT_PHONE_COUNTRY_KEY,
                      phone: "",
                      notes: "",
                    });
                  } catch (e) {
                    setDemoResult({ ok: false, message: e?.message || "Demo request failed." });
                  } finally {
                    setDemoSubmitting(false);
                  }
                }}
              >
                {demoSubmitting ? "Booking..." : "Book a demo"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

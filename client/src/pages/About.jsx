import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const HERO_BG =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80";
const WHY_IMG =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

function IconCap({ children }) {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" className="about-feature__icon">
      {children}
    </svg>
  );
}

export default function About() {
  return (
    <div className="about-page">
      <Helmet>
        <title>About Us | Bharat Skill Development Academy</title>
        <meta
          name="description"
          content="Learn about Bharat Skill Development Academy — industry-aligned tech training, mentorship, and career-focused programs across AI, Full Stack, Cyber Security, and Automation & Robotics."
        />
        <link rel="canonical" href="https://bharatskillacademy.com/about" />
      </Helmet>

      <section className="about-hero" aria-label="Welcome">
        <div
          className="about-hero__bg"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          role="presentation"
        />
        <div className="about-hero__scrim" aria-hidden="true" />
        <div className="container about-hero__inner">
          <h1 className="about-hero__title">
            <span className="about-hero__line about-hero__line--brand">
              Transforming Careers with Industry-Ready Skills
            </span>
          </h1>
        </div>
      </section>

      <section className="about-section about-intro" aria-labelledby="about-what-is-heading">
        <div className="container about-intro__grid">
          <div className="about-intro__copy">
            <h2 id="about-what-is-heading">What is Bharat Skill Development Academy?</h2>
            <p className="about-intro__lead">
              We are a career-focused training institute helping learners build real skills in software, AI, data, and
              industrial automation. Our programs combine structured curriculum with hands-on projects so you graduate
              ready for interviews and the workplace—not just certificates.
            </p>
            <ul className="about-features">
              <li className="about-feature">
                <IconCap>
                  <rect x="12" y="18" width="40" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M22 14h20v8H22z" fill="currentColor" opacity="0.35" />
                  <path d="M28 26h8v6h-8z" fill="currentColor" opacity="0.5" />
                </IconCap>
                <strong>Industry-aligned tech training</strong>
                <span>Curriculum shaped around skills employers hire for today.</span>
              </li>
              <li className="about-feature">
                <IconCap>
                  <circle cx="24" cy="28" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="42" cy="28" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M30 28h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M32 18v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                </IconCap>
                <strong>Mentorship &amp; guidance</strong>
                <span>Support from trainers who focus on clarity, practice, and career direction.</span>
              </li>
              <li className="about-feature">
                <IconCap>
                  <path
                    d="M16 22h32v28H16z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <path d="M22 16h20l4 6H18z" fill="currentColor" opacity="0.35" />
                  <path
                    d="M32 30c-4 0-7 2.5-7 5.5h14c0-3-3-5.5-7-5.5z"
                    fill="currentColor"
                    opacity="0.45"
                  />
                </IconCap>
                <strong>Deep, forward-looking syllabus</strong>
                <span>From fundamentals to advanced topics in AI, Full Stack, security, and robotics.</span>
              </li>
            </ul>
          </div>
          <div className="about-intro__media">
            <div className="about-intro__visual">
              <div className="about-intro__stack" aria-hidden="true" />
              <div className="about-intro__blue" aria-hidden="true" />
              <div className="about-intro__dots" aria-hidden="true" />
              <Link to="/contact" className="about-intro-card">
                <div className="about-intro-card__thumb">
                  <img
                    src="/images/about-collaboration.jpg"
                    alt="Learners collaborating on a laptop during training"
                    width="560"
                    height="373"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-what" aria-labelledby="about-what-do-heading">
        <div className="container about-what__grid">
          <div className="about-what__copy">
            <h2 id="about-what-do-heading">What do we do?</h2>
            <p>
              We run intensive programs in Full Stack development, AI and machine learning, data science, cyber security,
              computer vision, and automation &amp; robotics. Each track blends theory with labs, mini-projects, and
              portfolio work you can show in interviews.
            </p>
            <p>
              Beyond classroom hours, we emphasize communication, problem-solving, and interview readiness—so technical
              skill and professional confidence grow together.
            </p>
            <p>
              Whether you are starting from basics or upskilling mid-career, we help you map a path and stay accountable
              until you are job-ready.
            </p>
            <Link to="/courses" className="about-text-link">
              Explore our courses →
            </Link>
          </div>
          <div className="about-what__deco" aria-hidden="true">
            ?
          </div>
        </div>
      </section>

      <section className="about-section about-why" aria-labelledby="about-why-heading">
        <div className="container about-why__grid">
          <div className="about-why__visual">
            <div className="about-why__blue" aria-hidden="true" />
            <div className="about-why__dots" aria-hidden="true" />
            <img
              src={WHY_IMG}
              alt="Learners collaborating in a training environment"
              className="about-why__img"
              width="560"
              height="380"
              loading="lazy"
            />
          </div>
          <div className="about-why__copy">
            <h2 id="about-why-heading">Why do we do it?</h2>
            <p>
              Technology changes fast; too many talented people never get a fair shot because training is outdated,
              fragmented, or disconnected from real hiring bar. We started Bharat Skill Development Academy to close that
              gap with honest, practical education.
            </p>
            <p>
              Our motivation is simple: when learners succeed in landing better roles and building stable careers, whole
              families and communities benefit. That outcome is what we optimize for every day.
            </p>
            <Link to="/contact" className="about-ghost-btn">
              Start an admission enquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

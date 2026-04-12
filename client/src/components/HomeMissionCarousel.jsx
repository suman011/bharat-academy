import React, { useCallback, useEffect, useState } from "react";

const SLIDE_COUNT = 3;
const AUTO_MS = 6000;

export default function HomeMissionCarousel() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((index) => {
    setActive(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDE_COUNT);
    }, AUTO_MS);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      className="home-seo-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="About Bharat Skill Development Academy"
    >
      <div className="home-seo-carousel__viewport">
        <div
          className="home-seo-carousel__track"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          <div
            className="home-seo-carousel__slide"
            aria-hidden={active !== 0}
            id="home-seo-slide-0"
          >
            <h2 id="home-seo-mission-heading" className="home-seo-block__title home-seo-block__title--lead">
              Our Mission
            </h2>
            <p className="home-seo-block__body home-seo-block__body--mission">
              To bridge the gap between education and employment by providing training that transforms learners into
              confident, job-ready professionals.
            </p>
          </div>

          <div
            className="home-seo-carousel__slide"
            aria-hidden={active !== 1}
            id="home-seo-slide-1"
          >
            <h2 id="home-seo-why-heading" className="home-seo-block__title home-seo-block__title--lead">
              Why Choose Us?
            </h2>
            <p className="home-seo-block__body">
              We provide practical, industry-focused training designed to make you job-ready from day one. Our approach
              goes beyond traditional learning by combining real-world experience, expert guidance, and career support.
            </p>
          </div>

          <div
            className="home-seo-carousel__slide"
            aria-hidden={active !== 2}
            id="home-seo-slide-2"
          >
            <h2 id="home-seo-different-heading" className="home-seo-block__title home-seo-block__title--lead">
              What Makes Us Different?
            </h2>
            <div className="home-seo-block__diff-columns">
              <ul className="home-seo-block__list home-seo-block__list--pointers">
                <li>
                  <strong>Strong Industry Collaboration</strong> – Learn aligned with real industry practices
                </li>
                <li>
                  <strong>On-Job Training Approach</strong> – Experience real work environment during training
                </li>
                <li>
                  <strong>Live Project Experience</strong> – Work on real-world projects for practical skills
                </li>
                <li>
                  <strong>Industry-Relevant Curriculum</strong> – Courses based on current market demand
                </li>
              </ul>
              <ul className="home-seo-block__list home-seo-block__list--pointers">
                <li>
                  <strong>Expert Mentorship</strong> – Learn from experienced industry professionals
                </li>
                <li>
                  <strong>Personalized Support</strong> – Get individual attention and doubt-solving help
                </li>
                <li>
                  <strong>End-to-End Career Support</strong> – From learning to placement guidance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="home-seo-carousel__controls" role="tablist" aria-label="Carousel slides">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`Go to slide ${i + 1} of ${SLIDE_COUNT}`}
            className={`home-seo-carousel__dot ${active === i ? "is-active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

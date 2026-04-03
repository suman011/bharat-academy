import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCourseImage } from "../utils/courseImages";
import { getCourseKeyPoints } from "../utils/courseKeyPoints";

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const TIER_LABELS = ["Basic", "Intermediate", "Advanced"];

function tierSubtitle(fullTitle) {
  const m = fullTitle.match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : fullTitle;
}

const DEFAULT_EYEBROW = "Learning tracks";
const DEFAULT_TITLE = "IT Courses";
const DEFAULT_LEDE =
  "Three clear levels — start where you fit, then grow into advanced engineering and industry skills.";

export default function ItCoursesTierGrid({
  categories,
  className = "",
  eyebrow = DEFAULT_EYEBROW,
  title = DEFAULT_TITLE,
  lede = DEFAULT_LEDE,
  showCourseImages = true,
  layout = "rows",
}) {
  if (!categories?.length) return null;

  const showEyebrow = eyebrow != null && String(eyebrow).trim() !== "";

  const renderCourseCard = (item) =>
    showCourseImages ? (
      <div className="it-tier-card__mini">
        <div className="it-tier-card__mini-image">
          <img src={getCourseImage(item.name)} alt={item.name} loading="lazy" />
        </div>
        <div className="it-tier-card__mini-content">
          <div className="it-tier-card__mini-title">{item.name}</div>
          <ul className="it-tier-card__mini-points" aria-label="Course key points">
            {getCourseKeyPoints(item).map((p) => (
              <li key={p}>
                <FaCheckCircle aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <span className="it-tier-card__mini-btn btn-primary btn-sm">View Details</span>
        </div>
      </div>
    ) : (
      <>
        <FaCheckCircle aria-hidden className="it-tier-card__icon" />
        <span>{item.name}</span>
      </>
    );

  return (
    <div className={`it-courses-block ${className}`.trim()}>
      <div className="it-courses-block__head">
        {showEyebrow ? <span className="it-courses-block__eyebrow">{eyebrow}</span> : null}
        <h2 className="it-courses-block__title">{title}</h2>
        <p className="it-courses-block__lede">{lede}</p>
      </div>

      {layout === "rows" ? (
        <div className="it-rows">
          {categories.map((category, idx) => (
            <section
              key={category.title}
              className="it-row-section theme-reveal-item"
              style={{ "--reveal-delay": `${idx * 0.09}s` }}
            >
              <div className="it-row-head">
                <div className="it-row-title-wrap">
                  <h3 className={`it-row-title ${category.color}`}>
                    {category.title || TIER_LABELS[idx] || `Level ${idx + 1}`}
                  </h3>
                  <p className="it-row-subtitle">{tierSubtitle(category.title)}</p>
                </div>
                <span className="it-row-count">{category.items.length} Courses</span>
              </div>

              <div className="it-row-scroll" role="list">
                {category.items.map((item) => (
                  <Link
                    key={item.name}
                    to={`/courses/${slugify(item.name)}`}
                    className="it-row-card"
                    role="listitem"
                  >
                    {renderCourseCard(item)}
                  </Link>
                ))}
              </div>

              <div className="it-row-cta">
                <Link
                  to={`/courses?category=${encodeURIComponent(category.title)}`}
                  className="primary-btn small-btn"
                >
                  Explore {TIER_LABELS[idx] ?? "level"}
                </Link>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="it-tiers-grid">
          {categories.map((category, idx) => (
            <div
              key={category.title}
              className={`it-tier-card ${category.color} theme-reveal-item`}
              style={{ "--reveal-delay": `${idx * 0.09}s` }}
            >
              <div className="it-tier-card__top">
                <h3 className="it-tier-card__label">{TIER_LABELS[idx] ?? `Level ${idx + 1}`}</h3>
                <span className="it-tier-card__count">{category.items.length} Courses</span>
              </div>
              <p className="it-tier-card__subtitle">{tierSubtitle(category.title)}</p>
              <ul className="it-tier-card__list it-tier-card__list--grid course-catalog-grid">
                {category.items.map((item) => (
                  <li key={item.name}>
                    <Link to={`/courses/${slugify(item.name)}`} className="it-tier-card__link">
                      {renderCourseCard(item)}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={`/courses?category=${encodeURIComponent(category.title)}`}
                className="it-tier-card__cta primary-btn small-btn"
              >
                Explore {TIER_LABELS[idx] ?? "level"}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

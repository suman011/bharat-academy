import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import CourseStickyThumbnail from "./CourseStickyThumbnail";

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function CourseCategoryCard({
  category,
  revealIndex = 0,
  showCourseThumbs = false,
}) {
  return (
    <div
      className={`category-card ${category.color} theme-reveal-item`}
      style={{ "--reveal-delay": `${Math.min(revealIndex, 30) * 0.055}s` }}
    >
      <div className="category-header">
        <h3>{category.title}</h3>
        <span>{category.items.length} Courses</span>
      </div>
      <ul className="course-list">
        {category.items.map((item, index) => (
          <li key={index} className="course-item">
            <Link to={`/courses/${slugify(item.name)}`} className="course-item-link">
              <div className="course-info">
                {showCourseThumbs ? (
                  <CourseStickyThumbnail courseName={item.name} variant="micro" className="course-thumb" />
                ) : null}
                <FaCheckCircle aria-hidden />
                <div className="course-details">
                  <span className="course-name">{item.name}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to={`/courses?category=${encodeURIComponent(category.title)}`}
        className="primary-btn small-btn category-explore-btn"
      >
        Explore Courses
      </Link>
    </div>
  );
}

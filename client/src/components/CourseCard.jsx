import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaHeart, FaRegHeart, FaTag } from "react-icons/fa";
import { getCourseImage } from "../utils/courseImages";
import { apiUrl } from "../utils/apiBase";
import { getCourseKeyPoints } from "../utils/courseKeyPoints";

export default function CourseCard({ course, revealIndex = 0, inWishlist = false, ratingSummary }) {
  const imageUrl = getCourseImage(course.name);
  const keyPoints = getCourseKeyPoints(course);
  const [wish, setWish] = useState(Boolean(inWishlist));

  return (
    <Link to={`/courses/${course.slug}`} className="course-card-link">
      <article
        className="course-card course-card-udemy theme-reveal-item"
        style={{ "--reveal-delay": `${Math.min(revealIndex, 40) * 0.04}s` }}
      >
        <div className="course-card-image">
          <img src={imageUrl} alt={course.name} loading="lazy" />
          <div className="course-card-overlay" />
          <button
            type="button"
            className="course-card-wish"
            aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const next = !wish;
              setWish(next);
              try {
                if (next) {
                  await fetch(apiUrl("/wishlist"), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ courseKey: course.slug, course }),
                  });
                } else {
                  await fetch(apiUrl(`/wishlist/${encodeURIComponent(course.slug)}`), {
                    method: "DELETE",
                    credentials: "include",
                  });
                }
              } catch {
                // ignore
              }
            }}
          >
            {wish ? <FaHeart aria-hidden /> : <FaRegHeart aria-hidden />}
          </button>
        </div>
        <div className="course-card-content">
          <span className="course-category-badge">
            <FaTag />
            {course.category}
          </span>
          {ratingSummary && ratingSummary.count ? (
            <div className="course-rating-row">
              <span className="course-rating-star">★</span>
              <span className="course-rating-text">
                {Number(ratingSummary.avg || 0).toFixed(1)} ({ratingSummary.count})
              </span>
            </div>
          ) : null}
          <h3 className="course-title">{course.name}</h3>
          <ul className="course-keypoints" aria-label="Course key points">
            {keyPoints.map((p) => (
              <li key={p}>
                <FaCheckCircle aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="course-card-footer">
            <span className="btn-primary btn-sm">View Details</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

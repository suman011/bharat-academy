import React from "react";
import { getStickyMicroAcronym, getStickyThumbnailLabel } from "../utils/courseThumbnailSticky";

/**
 * Sticky-note + office-style scene (matches branded photo format: yellow note, marker text, blurred tech bg).
 * @param {"card"|"compact"|"detail"|"micro"} variant
 */
export default function CourseStickyThumbnail({ courseName, variant = "card", className = "" }) {
  if (variant === "micro") {
    const ac = getStickyMicroAcronym(courseName);
    return (
      <div
        className={`course-sticky-thumb course-sticky-thumb--micro ${className}`.trim()}
        role="img"
        aria-label={courseName}
      >
        <span className="course-sticky-thumb__micro-pad">{ac}</span>
      </div>
    );
  }

  const label = getStickyThumbnailLabel(courseName);
  const lines = String(label).split("\n");

  return (
    <div
      className={`course-sticky-thumb course-sticky-thumb--${variant} ${className}`.trim()}
      role="img"
      aria-label={courseName}
    >
      <div className="course-sticky-thumb__scene" aria-hidden>
        <div className="course-sticky-thumb__blur" />
        <div className="course-sticky-thumb__bokeh" />
        <div className="course-sticky-thumb__monitor" />
        <div className="course-sticky-thumb__note">
          {lines.map((line, i) => (
            <span key={i} className="course-sticky-thumb__ink-line">
              {line}
            </span>
          ))}
          <span className="course-sticky-thumb__underline" />
        </div>
      </div>
    </div>
  );
}

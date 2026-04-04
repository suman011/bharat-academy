import React from "react";
import CourseBannerGraphic from "./CourseBannerGraphic";
import { getTechBannerMeta, getTechMicroAcronym } from "../utils/courseTechBanner";

/**
 * Dark tech-banner thumbnails (two-line title + topic graphic), AI Fundamentals style.
 * @param {"card"|"compact"|"detail"|"micro"} variant
 */
export default function CourseStickyThumbnail({ courseName, variant = "card", className = "" }) {
  if (variant === "micro") {
    const ac = getTechMicroAcronym(courseName);
    const { mark, glyph } = getTechBannerMeta(courseName, "compact");
    return (
      <div
        className={`course-tech-banner course-tech-banner--micro ${className}`.trim()}
        role="img"
        aria-label={courseName}
      >
        <div className="course-tech-banner__micro-bg" aria-hidden />
        <div className="course-tech-banner__micro-bokeh" aria-hidden />
        <span className="course-tech-banner__micro-watermark" aria-hidden>
          {mark}
        </span>
        <span className="course-tech-banner__micro-ac">{ac}</span>
        <div className="course-tech-banner__micro-graphic" aria-hidden>
          <CourseBannerGraphic glyph={glyph} />
        </div>
      </div>
    );
  }

  const { top, bottom, glyph, mark } = getTechBannerMeta(courseName, variant);

  return (
    <div
      className={`course-tech-banner course-tech-banner--${variant} ${className}`.trim()}
      role="img"
      aria-label={courseName}
    >
      <div className="course-tech-banner__scene" aria-hidden>
        <div className="course-tech-banner__bg" />
        <div className="course-tech-banner__bokeh" />
        <div className="course-tech-banner__watermark">{mark}</div>
        <div className="course-tech-banner__inner">
          <div className="course-tech-banner__text">
            <span className="course-tech-banner__line1">{top}</span>
            <span className="course-tech-banner__line2">{bottom}</span>
          </div>
          <div className="course-tech-banner__art">
            <CourseBannerGraphic glyph={glyph} />
          </div>
        </div>
      </div>
    </div>
  );
}

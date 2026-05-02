/**
 * Course video library.
 *
 * How to use local videos:
 * 1) Put your .mp4 files in: client/public/videos/<course-slug>/
 * 2) Reference them below with src starting with "/videos/..."
 *
 * Example local src:
 *   /videos/ai-foundations-for-beginners/lesson-1-intro.mp4
 *
 * How to use YouTube:
 *   type: "youtube", src: "<videoId>" (e.g. dQw4w9WgXcQ)
 */

import { apiUrl } from "../utils/apiBase";

export const courseVideosBySlug = {
  // Course slug: ai-foundations-for-beginners
  "ai-foundations-for-beginners": [
    // Source folder (private): server/private-videos/AI Fundamentals/WEEK 1..5
    // `src` here is a RELATIVE path under the course folder, not a public URL.
    { type: "file", src: "WEEK 1/AI Foundations for Beginners_Day 1.mp4" },
    { type: "file", src: "WEEK 1/History and Evolution of AI_Day_2.mp4" },
    { type: "file", src: "WEEK 1/AI vs. ML vs. Data Science_ Simplified_Day_3.mp4" },
    { type: "file", src: "WEEK 1/Types of AI_ Narrow vs. General AI Simplified_Day_4.mp4" },
    { type: "file", src: "WEEK 1/Real-World AI Applications_Day_5.mp4" },
    { type: "file", src: "WEEK 1/AI Tools Demo_ Getting Started_Day_6.mp4" },
    { type: "file", src: "WEEK 1/Weekly Recap_ Foundations of AI_Day_7.mp4" },

    { type: "file", src: "WEEK 2/What is Data_ Week2_DAY1.mp4" },
    { type: "file", src: "WEEK 2/Types of Data (AI Series)_Day_2.mp4" },
    { type: "file", src: "WEEK 2/The Data Lifecycle_Day3.mp4" },
    { type: "file", src: "WEEK 2/Structured vs Unstructured Data_DAY4.mp4" },
    { type: "file", src: "WEEK 2/Introduction to Datasets_DAY5.mp4" },
    { type: "file", src: "WEEK 2/AI Thinking (Problem-Solving Approach)_DAY6.mp4" },
    { type: "file", src: "WEEK 2/AI Fundamentals_ Recap & Assignment_DAY7.mp4" },

    { type: "file", src: "WEEK 3/WEEK3_DAY1.mp4" },
    { type: "file", src: "WEEK 3/Introduction to Machine Learning Types_DAY2.mp4" },
    { type: "file", src: "WEEK 3/Supervised Learning Deep Dive_DAY3.mp4" },
    { type: "file", src: "WEEK 3/Unsupervised Learning Deep_DAY4.mp4" },
    { type: "file", src: "WEEK 3/Machine Learning in the Real World_DAY5.mp4" },
    { type: "file", src: "WEEK 3/Model vs Algorithm_ Key Differences_DAY6.mp4" },
    { type: "file", src: "WEEK 3/Weekly Recap & Assignment_ Machine Learning_DAY7.mp4" },

    { type: "file", src: "WEEK 4/Basic Python + AI Connection.mp4" },
    { type: "file", src: "WEEK 4/Google Teachable Machine.mp4" },
    { type: "file", src: "WEEK 4/Image Classification Demo.mp4" },
    { type: "file", src: "WEEK 4/Introduction to Python (Basics).mp4" },
    { type: "file", src: "WEEK 4/Jupyter Notebook Introduction.mp4" },
    { type: "file", src: "WEEK 4/Prediction Example.mp4" },
    { type: "file", src: "WEEK 4/Recap + Assignment.mp4" },

    { type: "file", src: "WEEK 5/AI in Industry.mp4" },
    { type: "file", src: "WEEK 5/Dataset + Python Setup.mp4" },
    { type: "file", src: "WEEK 5/Final Recap + Confidence Boost.mp4" },
    { type: "file", src: "WEEK 5/Mini Project Introduction.mp4" },
    { type: "file", src: "WEEK 5/Model Training.mp4" },
    { type: "file", src: "WEEK 5/Prediction + Output.mp4" },
    { type: "file", src: "WEEK 5/Roadmap + Resume + Interview Tips.mp4" },
  ],
};

function deriveTitleFromSrc(src) {
  const s = String(src || "").trim();
  if (!s) return "";
  const decoded = decodeURIComponent(s);
  const base = decoded.split("/").pop() || decoded;
  const noExt = base.replace(/\.(mp4|webm|mov)$/i, "");
  return noExt
    .replace(/_+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getCourseVideos(course) {
  const slug = String(course?.slug || "").trim().toLowerCase();
  if (!slug) return [];
  const list = courseVideosBySlug[slug];
  if (!Array.isArray(list)) return [];

  // If you rename files in `client/public/...`, titles will automatically reflect the filename.
  return list.map((v) => {
    const type = String(v?.type || "file").toLowerCase();
    const src = String(v?.src || "").trim();
    const filenameTitle = type === "file" ? deriveTitleFromSrc(src) : "";
    const title = filenameTitle || String(v?.title || "").trim();
    const protectedSrc =
      type === "file" && slug
        ? apiUrl(`/video/${encodeURIComponent(slug)}?path=${encodeURIComponent(src)}`)
        : src;
    return { ...v, title, src: protectedSrc };
  });
}


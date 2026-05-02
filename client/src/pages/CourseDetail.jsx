import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCertificate,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaExclamationCircle,
  FaFileAlt,
  FaGlobe,
  FaGraduationCap,
  FaHeart,
  FaLaptopCode,
  FaPhone,
  FaPlayCircle,
  FaRegHeart,
  FaRupeeSign,
  FaShoppingCart,
  FaStar,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import { courseCategories } from "../data/courses";
import { getCourseVideos } from "../data/courseVideos";
import { apiUrl } from "../utils/apiBase";
import { getCourseImage, getCourseImageFallback } from "../utils/courseImages";
import { getCurrentUser, onAuthChanged } from "../utils/authStore";
import { useCart } from "../context/CartContext";
import { createPortal } from "react-dom";

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const DOMAIN_LIBRARY = {
  basic: {
    summary:
      "Build strong digital confidence with practical day-to-day computer skills, office tools, and safe internet usage.",
    skills: ["Computer Basics", "Typing", "File Handling", "MS Office", "Digital Safety"],
    tools: ["Windows", "MS Office", "Chrome", "Gmail"],
    careers: "Office Assistant, Data Entry Support, Back-Office Executive",
    modules: [
      "Foundations & Setup",
      "Core Concepts",
      "Hands-on Practice",
      "Applied Workflows",
      "Mini Projects",
      "Assessment & Certification",
    ],
  },
  web: {
    summary:
      "Learn modern web development from fundamentals to real project delivery using industry workflows.",
    skills: ["HTML/CSS", "JavaScript", "Git Workflow", "Responsive UI", "Deployment"],
    tools: ["VS Code", "GitHub", "Browser DevTools", "Node.js"],
    careers: "Frontend Developer, Web Designer, Junior Full Stack Developer",
    modules: [
      "Web Fundamentals",
      "Core Development",
      "Component Architecture",
      "API Integration",
      "Project Build",
      "Deployment & Portfolio",
    ],
  },
  programming: {
    summary:
      "Develop strong problem-solving ability with structured programming and real coding exercises.",
    skills: ["Programming Logic", "Data Structures", "Debugging", "Code Quality", "Problem Solving"],
    tools: ["Compiler/Runtime", "IDE", "Git", "Practice Platforms"],
    careers: "Software Developer, Support Engineer, Junior Programmer",
    modules: [
      "Language Basics",
      "Control Flow & Functions",
      "Data Handling",
      "Advanced Concepts",
      "Problem Solving Lab",
      "Capstone & Evaluation",
    ],
  },
  data_ai: {
    summary:
      "Master data workflows from analysis to intelligent models with practical business-focused examples.",
    skills: ["Data Analysis", "Visualization", "Model Building", "Evaluation", "Reporting"],
    tools: ["Python", "Pandas", "Power BI", "Jupyter"],
    careers: "Data Analyst, ML Associate, BI Executive",
    modules: [
      "Data Foundations",
      "Data Preparation",
      "Analysis & Insights",
      "Modeling / Automation",
      "Case Studies",
      "Final Project",
    ],
  },
  cloud_devops: {
    summary:
      "Understand modern cloud and DevOps workflows to build, ship, and maintain production-ready systems.",
    skills: ["Cloud Basics", "CI/CD", "Monitoring", "Infrastructure Concepts", "Release Management"],
    tools: ["AWS/Azure", "GitHub Actions", "Docker", "CLI"],
    careers: "Cloud Associate, DevOps Trainee, Platform Support Engineer",
    modules: [
      "Cloud Fundamentals",
      "Core Services",
      "Automation Pipelines",
      "Security & Reliability",
      "Deployment Workshop",
      "Assessment",
    ],
  },
  security: {
    summary:
      "Gain practical cybersecurity knowledge for identifying, preventing, and handling modern digital threats.",
    skills: ["Threat Awareness", "Secure Practices", "Testing Basics", "Incident Response", "Risk Controls"],
    tools: ["Security Tools", "Postman", "Network Utilities", "Logs/Reports"],
    careers: "Security Analyst Trainee, SOC Intern, QA Security Associate",
    modules: [
      "Security Fundamentals",
      "Threat Landscape",
      "Testing & Validation",
      "Hardening Practices",
      "Incident Simulation",
      "Certification Prep",
    ],
  },
  industry40: {
    summary:
      "Design, integrate, and secure smart manufacturing systems spanning PLC/SCADA, IIoT, robotics, analytics, and Automation and Robotics architectures.",
    skills: [
      "Automation & controls",
      "Industrial networks & protocols",
      "IIoT & edge/cloud patterns",
      "Robotics & vision systems",
      "OT security & reliability",
    ],
    tools: ["PLC/SCADA stacks", "Industrial networks", "Python & analytics", "Simulators & twins", "Documentation & SOPs"],
    careers: "Automation Engineer, IIoT Engineer, Smart Factory Architect, OT Security Specialist",
    modules: [
      "Automation and Robotics context & architecture",
      "Automation & integration lab",
      "Data, analytics & visualization",
      "OT security & reliability",
      "Capstone use case",
      "Assessment & certification",
    ],
  },
  job: {
    summary:
      "Placement-focused curriculum designed to make learners interview-ready with project-backed practical skills.",
    skills: ["Job Skills", "Projects", "Interview Prep", "Resume Building", "Professional Readiness"],
    tools: ["GitHub", "Resume Templates", "Mock Interviews", "Project Repos"],
    careers: "Entry-level IT roles, Analyst roles, Developer tracks",
    modules: [
      "Skill Foundation",
      "Practical Work",
      "Real Projects",
      "Industry Standards",
      "Interview Readiness",
      "Placement Sprint",
    ],
  },
};

const detectDomain = (course) => {
  const name = (course.name || "").toLowerCase();
  const cat = (course.category || "").toLowerCase();
  if (cat.includes("industry 4.0") || cat.includes("automation and robotics")) return "industry40";
  if (name.includes("security") || name.includes("hacking") || name.includes("testing")) return "security";
  if (name.includes("cloud") || name.includes("devops") || name.includes("aws") || name.includes("ci/cd")) return "cloud_devops";
  if (name.includes("data") || name.includes("machine learning") || name.includes("ai")) return "data_ai";
  if (name.includes("html") || name.includes("css") || name.includes("react") || name.includes("next.js") || name.includes("web")) return "web";
  if (name.includes("java") || name.includes("python") || name.includes("c++") || name.includes("c programming") || name.includes("dsa") || name.includes("api")) return "programming";
  if (cat.includes("job")) return "job";
  return "basic";
};

const getOverviewData = (course) => {
  const domain = DOMAIN_LIBRARY[detectDomain(course)];
  const defaultPrereq =
    course.level === "Beginner"
      ? "No prior experience required; basic computer familiarity is enough."
      : course.level === "Intermediate"
      ? "Basic understanding of fundamentals is recommended before starting."
      : course.level === "Expert"
      ? "Prior advanced coursework or substantial professional experience in this domain is expected."
      : "Prior project or foundational knowledge in this domain is recommended.";

  return {
    summary: course.summary ?? domain.summary,
    skills: course.skills ?? domain.skills,
    tools: course.tools ?? domain.tools,
    careers: course.careers ?? domain.careers,
    prerequisites: course.prerequisites ?? defaultPrereq,
  };
};

const PRACTICALS_BY_DOMAIN = {
  basic: ["Desktop navigation", "Typing drills", "File management tasks", "Office document creation", "Email assignment", "Final practical test"],
  web: ["Build static pages", "Responsive layout lab", "Component-based UI", "Git workflow", "API integration", "Deploy portfolio project"],
  programming: ["Coding exercises", "Function practice", "Debugging lab", "Problem-solving tasks", "Mini coding contest", "Capstone program"],
  data_ai: ["Dataset cleanup", "Visualization tasks", "Analysis notebook", "Model practice", "Case-study report", "End-to-end mini project"],
  cloud_devops: ["Service setup", "Pipeline creation", "Container practice", "Deployment drills", "Monitoring checklist", "Production simulation"],
  security: ["Threat simulation", "Secure config checklist", "Testing tasks", "API security checks", "Incident playbook", "Final audit report"],
  industry40: [
    "Safety & documentation lab",
    "Hardware / simulation exercise",
    "Configuration & integration workshop",
    "Protocol or data pipeline drill",
    "HMI / analytics mini lab",
    "Troubleshooting case study",
    "Line or cell integration sprint",
    "Capstone demonstration",
  ],
  job: ["Career task set", "Portfolio milestone", "Mock interview", "Resume review", "Real project sprint", "Placement prep evaluation"],
};

const LESSON_ICON = {
  video: FaPlayCircle,
  reading: FaFileAlt,
  practice: FaLaptopCode,
};

const formatMinutes = (totalMin) => {
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

const buildAccordionModules = (course) => {
  const dKey = detectDomain(course);
  const domain = DOMAIN_LIBRARY[dKey];
  const practicals = PRACTICALS_BY_DOMAIN[dKey];
  const courseShort =
    course.name.length > 48 ? `${course.name.slice(0, 45).trim()}...` : course.name;
  const moduleTitles =
    Array.isArray(course.modules) && course.modules.length > 0 ? course.modules : domain.modules;

  return moduleTitles.map((moduleTitle, idx) => {
    const practicalTitle = practicals[idx % practicals.length] || "Guided hands-on exercise";
    const lessons = [
      { type: "video", title: `Introduction: ${moduleTitle}`, min: 5 + (idx % 4) },
      { type: "reading", title: "Concepts, standards & checkpoints", min: 7 + (idx % 3) },
      { type: "video", title: `${courseShort} - walkthrough (section ${idx + 1})`, min: 11 + (idx % 5) },
      { type: "practice", title: practicalTitle, min: 14 + (idx % 6) },
      { type: "reading", title: "Recap & assignment briefing", min: 5 + (idx % 2) },
    ];
    const totalMin = lessons.reduce((sum, l) => sum + l.min, 0);
    return {
      moduleTitle,
      moduleIndex: idx,
      lessons,
      totalMin,
      lectureCount: lessons.length,
    };
  });
};

export default function CourseDetail() {
  const { courseSlug } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedModules, setExpandedModules] = useState(() => new Set([0]));
  const [expandedVideoWeeks, setExpandedVideoWeeks] = useState(() => new Set([0]));
  const [activeVideoKey, setActiveVideoKey] = useState(null);
  const [videoDurations, setVideoDurations] = useState(() => ({})); // videoKey -> seconds (number)
  const [activeVideoLoadStatus, setActiveVideoLoadStatus] = useState(null); // null | { ok:boolean, status?:number, message?:string }
  const [addedOpen, setAddedOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueMessage, setIssueMessage] = useState("");
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [hasNotPaidDecision, setHasNotPaidDecision] = useState(false);
  const [wish, setWish] = useState(false);
  const [progress, setProgress] = useState(() => new Set());
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: "", mobile: "", message: "" });
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackResult, setCallbackResult] = useState(null);
  const [alsoBought, setAlsoBought] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { add } = useCart();
  const loginRedirect = `/login?redirect=${encodeURIComponent(location.pathname)}`;
  const tabsSectionRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const autoCompletedLessonKeysRef = useRef(new Set());

  const AUTO_COMPLETE_THRESHOLD = 0.9;

  useEffect(() => {
    let alive = true;
    async function refreshUser() {
      try {
        const u = await getCurrentUser();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      }
    }
    refreshUser();
    const off = onAuthChanged(() => refreshUser());
    return () => {
      alive = false;
      off();
    };
  }, []);

  useEffect(() => {
    if (!addedOpen && !issueOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [addedOpen, issueOpen]);

  useEffect(() => {
    if (!callbackOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [callbackOpen]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl("/enrollments"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        if (!alive) return;
        setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
      } catch {
        // Ignore: user may not be logged in yet.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const allCourses = useMemo(
    () =>
      courseCategories.flatMap((category) =>
        category.items.map((course) => ({
          ...course,
          category: category.title,
          categoryColor: category.color,
          slug: slugify(course.name),
        }))
      ),
    []
  );

  const normalizedSlug = decodeURIComponent(courseSlug || "").toLowerCase().trim();
  const course =
    allCourses.find((item) => item.slug === normalizedSlug) ||
    allCourses.find((item) => normalizedSlug.startsWith(item.slug));

  const courseVideos = useMemo(() => getCourseVideos(course), [course]);
  const [serverVideoWeeks, setServerVideoWeeks] = useState(null); // null | [{label, items:[{path,title}]}]
  const [serverVideosLoading, setServerVideosLoading] = useState(false);
  const [serverVideosError, setServerVideosError] = useState(null);
  const hasCourseVideos = courseVideos.length > 0;

  const currentEnrollment = useMemo(() => {
    const courseSlugKey = String(course?.slug || "").toLowerCase().trim();
    const urlKey = String(normalizedSlug || "").toLowerCase().trim();
    if (!courseSlugKey && !urlKey) return null;
    return (
      enrollments.find((e) => {
        const k = String(e?.courseKey || "").toLowerCase().trim();
        if (!k) return false;
        if (courseSlugKey && k === courseSlugKey) return true;
        // tolerate legacy/partial slugs or extra URL suffixes
        if (courseSlugKey && (k.startsWith(courseSlugKey) || courseSlugKey.startsWith(k))) return true;
        if (urlKey && (urlKey.startsWith(k) || k.startsWith(urlKey))) return true;
        return false;
      }) || null
    );
  }, [course?.slug, enrollments, normalizedSlug]);

  // Paid access gate for video content (server exposes enrollments only for paid orders).
  const hasVideoAccess = Boolean(currentEnrollment);

  const markLessonCompleted = useCallback(
    async (lessonKey, totalLessons) => {
      const key = String(lessonKey || "").trim();
      if (!key) return;
      if (!currentEnrollment) return;
      if (progress.has(key)) return;

      setProgress((prev) => {
        const s = new Set(prev);
        s.add(key);
        return s;
      });

      try {
        await fetch(apiUrl(`/progress/${encodeURIComponent(course.slug)}`), {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonKey: key,
            completed: true,
            totalLessons: Number(totalLessons || 0),
          }),
        });
      } catch {
        // ignore
      }
    },
    [course?.slug, currentEnrollment, progress]
  );

  const renderCourseVideo = (v, idx) => {
    const title = String(v?.title || `Video ${idx + 1}`);
    const type = String(v?.type || "file").toLowerCase();
    const src = String(v?.src || "").trim();

    if (!src) return null;

    if (type === "youtube") {
      const id = src.replace(/^.*v=([^&]+).*$/i, "$1").replace(/^.*youtu\.be\/([^?]+).*$/i, "$1");
      const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      return (
        <div key={`${type}-${idx}`} className="cd-video-player">
          <div className="cd-video-player__frame">
            <iframe
              title={title}
              src={embedUrl}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="cd-video-player__title">{title}</div>
        </div>
      );
    }

    // `src` may already be a fully encoded protected URL (e.g. /api/video/...?...%20...).
    // Avoid double-encoding (which turns %20 into %2520 and breaks file lookup).
    const safeSrc = src.includes("?") ? src : encodeURI(src);
    const lessonKey = String(v?.lessonKey || "").trim();
    return (
      <div key={`${type}-${idx}`} className="cd-video-player">
        <div className="cd-video-player__frame">
          <video
            controls
            preload="metadata"
            src={safeSrc}
            onTimeUpdate={(e) => {
              if (!lessonKey) return;
              if (autoCompletedLessonKeysRef.current.has(lessonKey)) return;
              if (!currentEnrollment) return;
              if (progress.has(lessonKey)) {
                autoCompletedLessonKeysRef.current.add(lessonKey);
                return;
              }
              const el = e.currentTarget;
              const dur = Number(el?.duration);
              const cur = Number(el?.currentTime);
              if (!Number.isFinite(dur) || dur <= 0) return;
              if (!Number.isFinite(cur) || cur < 0) return;
              const ratio = cur / dur;
              if (ratio >= AUTO_COMPLETE_THRESHOLD) {
                autoCompletedLessonKeysRef.current.add(lessonKey);
                markLessonCompleted(lessonKey, totalVideoLessons);
              }
            }}
            onEnded={() => {
              if (!lessonKey) return;
              if (autoCompletedLessonKeysRef.current.has(lessonKey)) return;
              autoCompletedLessonKeysRef.current.add(lessonKey);
              markLessonCompleted(lessonKey, totalVideoLessons);
            }}
            onError={() => {
              setActiveVideoLoadStatus((prev) => prev || { ok: false, message: "Failed to load video." });
            }}
          />
        </div>
        <div className="cd-video-player__title">{title}</div>
      </div>
    );
  };

  const cleanVideoTitle = useCallback((t) => {
    const s0 = String(t || "").trim();
    const s1 = s0.replace(/^week\s*\d+\s*[\u2014\u2013-]\s*/i, "");
    const normalize = (s) =>
      String(s || "")
        .replace(/_+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

    // Try removing Day suffixes (good for titles like "... (Day 1)"),
    // but keep "Day 1" when that is the entire title (Week 4/5 filenames).
    const stripped = normalize(
      s1
        .replace(/\(\s*day\s*(\d+)\s*\)\s*$/i, "")
        .replace(/[_\s-]*day[_\s-]*(\d+)\s*$/i, "")
    );

    if (stripped) return stripped;

    // If we stripped everything, fall back to a clean Lesson label when present.
    const m = normalize(s1).match(/\bday\s*(\d+)\b/i);
    if (m) return `Lesson ${m[1]}`;

    return normalize(s1);
  }, []);

  const formatVideoDuration = useCallback((sec) => {
    const n = Number(sec);
    if (!Number.isFinite(n) || n <= 0) return "";
    const total = Math.round(n);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, []);

  const videoWeeks = useMemo(() => {
    // Prefer server index when user has paid access.
    if (hasVideoAccess && Array.isArray(serverVideoWeeks) && serverVideoWeeks.length && course?.slug) {
      return serverVideoWeeks.map((w) => {
        const label = String(w?.label || "Videos");
        const m = label.match(/(\d+)/);
        const weekNumber = m ? Number(m[1]) : 0;
        const items = (Array.isArray(w?.items) ? w.items : []).map((it, idx) => {
          const rel = String(it?.path || "").trim();
          const title = String(it?.title || rel.split("/").pop() || `Video ${idx + 1}`);
          const src = apiUrl(`/video/${encodeURIComponent(course.slug)}?path=${encodeURIComponent(rel)}`);
          return { type: "file", title, src, rel, lessonKey: `video:${rel}`, _key: `${label}:${idx}:file:${rel}` };
        });
        return { weekNumber, label, items };
      });
    }

    const items = Array.isArray(courseVideos) ? courseVideos : [];
    if (!items.length) return [];

    const groups = new Map(); // weekNumber -> { weekNumber, label, items: [{...v, _key}] }
    for (let i = 0; i < items.length; i += 1) {
      const v = items[i] || {};
      const title = String(v.title || "");
      const src = String(v.src || "");
      const m =
        title.match(/week\s*(\d+)/i) ||
        src.match(/\/week\s*(\d+)\//i) ||
        src.match(/\\week\s*(\d+)\\/i);
      const weekNumber = m ? Number(m[1]) : 0;
      const label = weekNumber ? `WEEK ${weekNumber}` : "Videos";
      const key = `${weekNumber}:${i}:${String(v.type || "file")}:${src}`;

      if (!groups.has(weekNumber)) groups.set(weekNumber, { weekNumber, label, items: [] });
      groups.get(weekNumber).items.push({ ...v, _key: key });
    }

    return Array.from(groups.values()).sort((a, b) => a.weekNumber - b.weekNumber);
  }, [course?.slug, courseVideos, hasVideoAccess, serverVideoWeeks]);

  const hasAnyVideos = videoWeeks.length > 0;
  const totalVideoLessons = useMemo(
    () => (Array.isArray(videoWeeks) ? videoWeeks.reduce((n, w) => n + (Array.isArray(w?.items) ? w.items.length : 0), 0) : 0),
    [videoWeeks]
  );
  const videoLessonKeys = useMemo(() => {
    const keys = [];
    for (const w of Array.isArray(videoWeeks) ? videoWeeks : []) {
      for (const it of Array.isArray(w?.items) ? w.items : []) {
        const k = String(it?.lessonKey || "").trim();
        if (k) keys.push(k);
      }
    }
    return keys;
  }, [videoWeeks]);
  const completedVideoCount = useMemo(() => {
    if (!videoLessonKeys.length) return 0;
    let n = 0;
    for (const k of videoLessonKeys) if (progress.has(k)) n += 1;
    return n;
  }, [progress, videoLessonKeys]);

  useEffect(() => {
    if (!hasAnyVideos) return;
    // Reset selection when switching course
    setExpandedVideoWeeks(new Set([0]));
    const first = videoWeeks?.[0]?.items?.[0]?._key || null;
    setActiveVideoKey((prev) => prev || first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.slug, videoWeeks]);

  const toggleVideoWeek = useCallback((idx) => {
    setExpandedVideoWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const activeVideo = useMemo(() => {
    if (!activeVideoKey) return null;
    const all = Array.isArray(videoWeeks) ? videoWeeks.flatMap((w) => w.items) : [];
    return all.find((v) => v._key === activeVideoKey) || null;
  }, [activeVideoKey, videoWeeks]);

  useEffect(() => {
    // Probe the protected stream endpoint so we can show a clear message (403 payment required / 404 missing).
    if (!activeVideo?.src) {
      setActiveVideoLoadStatus(null);
      return;
    }

    let cancelled = false;
    setActiveVideoLoadStatus(null);

    (async () => {
      try {
        const res = await fetch(activeVideo.src, {
          method: "GET",
          credentials: "include",
          headers: { Range: "bytes=0-1" },
        });
        if (cancelled) return;
        if (res.ok || res.status === 206) {
          setActiveVideoLoadStatus({ ok: true, status: res.status });
          return;
        }
        const txt = await res.text().catch(() => "");
        setActiveVideoLoadStatus({
          ok: false,
          status: res.status,
          message: txt || (res.status === 403 ? "Payment required." : "Video not available."),
        });
      } catch (e) {
        if (cancelled) return;
        setActiveVideoLoadStatus({ ok: false, message: String(e?.message || "Failed to load video.") });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeVideo?.src]);

  useEffect(() => {
    if (!hasAnyVideos) return;

    const openWeekIdxs = Array.from(expandedVideoWeeks.values());
    if (!openWeekIdxs.length) return;

    let cancelled = false;
    const pending = [];

    const loadDuration = async (v) => {
      const key = v?._key;
      if (!key || videoDurations[key] != null) return;

      const type = String(v?.type || "file").toLowerCase();
      if (type === "youtube") return; // could be added later via API, skip for now

      const src = String(v?.src || "").trim();
      if (!src) return;

      const safeSrc = src.includes("?") ? src : encodeURI(src);
      await new Promise((resolve) => {
        try {
          const el = document.createElement("video");
          el.preload = "metadata";
          el.muted = true;
          el.playsInline = true;
          el.src = safeSrc;

          const cleanup = () => {
            el.removeAttribute("src");
            try {
              el.load();
            } catch {
              // ignore
            }
          };

          el.onloadedmetadata = () => {
            const d = Number(el.duration);
            cleanup();
            if (!cancelled && Number.isFinite(d) && d > 0) {
              setVideoDurations((prev) => (prev[key] == null ? { ...prev, [key]: d } : prev));
            }
            resolve();
          };
          el.onerror = () => {
            cleanup();
            resolve();
          };
        } catch {
          resolve();
        }
      });
    };

    for (const idx of openWeekIdxs) {
      const week = videoWeeks[idx];
      if (!week?.items?.length) continue;
      for (const v of week.items) pending.push(loadDuration(v));
    }

    Promise.allSettled(pending);
    return () => {
      cancelled = true;
    };
  }, [expandedVideoWeeks, hasAnyVideos, videoDurations, videoWeeks]);

  useEffect(() => {
    if (!course?.slug) return;
    let alive = true;

    const normalizeCourseKeyFromItem = (it) => {
      const c = it?.course || it || {};
      const direct = String(c?.slug || "").trim().toLowerCase();
      if (direct) return direct;
      const rawName = String(c?.name || it?.name || "");
      return rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .trim();
    };

    (async () => {
      try {
        const res = await fetch(apiUrl("/orders"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data) return;

        const ck = String(course?.slug || "").trim().toLowerCase();
        const orders = Array.isArray(data.orders) ? data.orders : [];
        const pending = orders.some(
          (o) =>
            o?.paymentStatus === "pending_manual" &&
            Array.isArray(o?.items) &&
            o.items.some((it) => normalizeCourseKeyFromItem(it) === ck)
        );
        const notPaid = orders.some(
          (o) =>
            o?.paymentStatus === "not_paid" &&
            Array.isArray(o?.items) &&
            o.items.some((it) => normalizeCourseKeyFromItem(it) === ck)
        );

        if (alive) {
          setHasPendingApplication(Boolean(pending));
          setHasNotPaidDecision(Boolean(notPaid));
        }
      } catch {
        if (!alive) return;
        setHasPendingApplication(false);
        setHasNotPaidDecision(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [course?.slug]);

  const similarCourses = useMemo(() => {
    if (!course) return [];
    const sameCategory = allCourses.filter((c) => c.slug !== course.slug && c.category === course.category);
    const sameLevel = allCourses.filter((c) => c.slug !== course.slug && c.level === course.level);
    const pool = [...sameCategory, ...sameLevel];
    const uniq = new Map();
    for (const c of pool) uniq.set(c.slug, c);
    return Array.from(uniq.values()).slice(0, 6);
  }, [allCourses, course]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!course?.slug) return;
        const res = await fetch(apiUrl("/recommendations/also-bought"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseKeys: [course.slug] }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        const list = Array.isArray(data.recs?.[course.slug]) ? data.recs[course.slug] : [];
        const mapped = list
          .map((x) => allCourses.find((c) => c.slug === x.courseKey))
          .filter(Boolean)
          .slice(0, 6);
        if (!alive) return;
        setAlsoBought(mapped);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [course?.slug, allCourses]);

  useEffect(() => {
    if (!course?.slug) return;
    if (!hasVideoAccess) {
      setServerVideoWeeks(null);
      setServerVideosLoading(false);
      setServerVideosError(null);
      return;
    }

    let cancelled = false;
    setServerVideosLoading(true);
    setServerVideosError(null);

    (async () => {
      try {
        const res = await fetch(apiUrl(`/videos/${encodeURIComponent(course.slug)}/index`), {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setServerVideoWeeks(null);
          setServerVideosError(String(data?.error || `Failed to load videos (HTTP ${res.status}).`));
          setServerVideosLoading(false);
          return;
        }
        setServerVideoWeeks(Array.isArray(data.weeks) ? data.weeks : []);
        setServerVideosLoading(false);
      } catch (e) {
        if (cancelled) return;
        setServerVideoWeeks(null);
        setServerVideosError(String(e?.message || "Failed to load videos."));
        setServerVideosLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [course?.slug, hasVideoAccess]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl("/wishlist"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        const keys = new Set((data.items || []).map((x) => String(x.courseKey || "").toLowerCase()).filter(Boolean));
        if (!alive) return;
        setWish(Boolean(course?.slug && keys.has(course.slug)));
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [course?.slug]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!course?.slug) return;
        const res = await fetch(apiUrl(`/progress/${encodeURIComponent(course.slug)}`), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        const arr = Array.isArray(data.row?.completedLessonKeys) ? data.row.completedLessonKeys : [];
        if (!alive) return;
        setProgress(new Set(arr.map((x) => String(x))));
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [course?.slug]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!course?.slug) return;
        const res = await fetch(apiUrl(`/reviews/${encodeURIComponent(course.slug)}`));
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        if (!alive) return;
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setAvgRating(Number(data.avgRating || 0));
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [course?.slug]);

  const overview = useMemo(() => {
    if (!course) {
      return {
        summary: "",
        skills: [],
        tools: [],
        careers: "",
        prerequisites: "",
      };
    }
    return getOverviewData(course);
  }, [course]);

  const accordionModules = useMemo(() => {
    if (!course) return [];
    return buildAccordionModules(course);
  }, [course]);

  const curriculumSummary = useMemo(() => {
    const sections = accordionModules.length;
    const lectures = accordionModules.reduce((n, m) => n + m.lectureCount, 0);
    const totalMin = accordionModules.reduce((n, m) => n + m.totalMin, 0);
    return { sections, lectures, totalMin };
  }, [accordionModules]);

  const nextIncompleteLesson = useMemo(() => {
    if (!currentEnrollment) return null;
    if (!accordionModules.length) return null;

    for (let moduleIndex = 0; moduleIndex < accordionModules.length; moduleIndex++) {
      const mod = accordionModules[moduleIndex];
      for (let li = 0; li < mod.lessons.length; li++) {
        const lessonKey = `${moduleIndex}:${li}`;
        if (!progress.has(lessonKey)) {
          return { moduleIndex, lessonIndex: li };
        }
      }
    }
    return null; // all lessons done
  }, [currentEnrollment, accordionModules, progress]);

  const toggleModule = useCallback((idx) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleResumeLearning = useCallback(() => {
    if (!currentEnrollment) return;

    if (nextIncompleteLesson) {
      if (hasAnyVideos && hasVideoAccess) {
        setActiveTab("videos");
      } else {
        setActiveTab("curriculum");
        setExpandedModules(new Set([nextIncompleteLesson.moduleIndex]));
      }
    } else {
      setActiveTab("reviews");
    }

    // Nudge the user to the tabs section (especially useful on mobile).
    requestAnimationFrame(() => {
      tabsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [currentEnrollment, nextIncompleteLesson, hasAnyVideos, hasVideoAccess]);

  useEffect(() => {
    if (!hasAnyVideos) return;
    if (!hasVideoAccess) return;
    if (activeTab === "curriculum") setActiveTab("videos");
  }, [activeTab, hasAnyVideos, hasVideoAccess]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="tab-content-card cd-overview-card">
            <h3 className="cd-overview-title">About this course</h3>
            <p className="cd-overview-lead">{overview.summary}</p>

            <div className="cd-overview-stats">
              <div className="cd-stat">
                <FaClock className="cd-stat-icon" aria-hidden />
                <div>
                  <span className="cd-stat-label">Duration</span>
                  <span className="cd-stat-value">{course.duration}</span>
                </div>
              </div>
              <div className="cd-stat">
                <FaGraduationCap className="cd-stat-icon" aria-hidden />
                <div>
                  <span className="cd-stat-label">Level</span>
                  <span className="cd-stat-value">{course.level}</span>
                </div>
              </div>
              <div className="cd-stat">
                <FaRupeeSign className="cd-stat-icon" aria-hidden />
                <div>
                  <span className="cd-stat-label">Fee</span>
                  <span className="cd-stat-value">INR {course.price.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="cd-stat">
                <FaGlobe className="cd-stat-icon" aria-hidden />
                <div>
                  <span className="cd-stat-label">Language</span>
                  <span className="cd-stat-value">English (with support)</span>
                </div>
              </div>
            </div>

            <div className="cd-meta-compact-section cd-meta-and-learn">
              <div className="cd-meta-compact">
                <div>
                  <span className="cd-meta-label">Category</span>
                  <p>{course.category}</p>
                </div>
                <div>
                  <span className="cd-meta-label">Tools</span>
                  <p>{overview.tools.join(", ")}</p>
                </div>
                <div>
                  <span className="cd-meta-label">Requirements</span>
                  <p>{overview.prerequisites}</p>
                </div>
                <div>
                  <span className="cd-meta-label">Who it&apos;s for</span>
                  <p>
                    {course.level === "Beginner"
                      ? "New learners starting in this area."
                      : "Learners ready to go deeper with guided projects."}{" "}
                    <span className="cd-meta-muted">{overview.careers}</span>
                  </p>
                </div>
              </div>
              <div className="cd-learn-block cd-learn-block--aside">
                <h4 className="cd-subheading">What you&apos;ll learn</h4>
                <ul className="cd-learn-grid">
                  {overview.skills.map((item, index) => (
                    <li key={index}>
                      <FaCheck className="cd-check" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="cd-includes">
              <h4 className="cd-subheading">This course includes</h4>
              <ul className="cd-includes-list">
                <li>
                  <FaPlayCircle aria-hidden /> Live + recorded concept sessions
                </li>
                <li>
                  <FaLaptopCode aria-hidden /> Hands-on labs and assignments
                </li>
                <li>
                  <FaFileAlt aria-hidden /> Module notes and recap briefs
                </li>
                <li>
                  <FaCertificate aria-hidden /> Certificate after assessment
                </li>
              </ul>
            </div>

            <div className="cd-meta-compact-toolbar cd-meta-compact-toolbar--below">
              <button
                type="button"
                className="primary-btn cd-overview-buy-now"
                aria-label={user ? "Buy now and go to checkout" : "Log in to purchase"}
                onClick={() => {
                  if (!user) {
                    navigate(loginRedirect);
                    return;
                  }
                  add(course);
                  navigate("/checkout");
                }}
              >
                {user ? "Buy Now" : "Log in to buy"}
              </button>
            </div>
          </div>
        );

      case "videos":
        if (!hasVideoAccess) {
          return (
            <div className="tab-content-card">
              <h3>Course Videos</h3>
              <p style={{ marginTop: 6, color: "#64748b", fontWeight: 650 }}>
                Videos are available after payment confirmation.
              </p>
              <div className="cd-empty-videos">
                {user ? (
                  <>
                    Please purchase this course to unlock videos.{" "}
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ marginLeft: 10 }}
                      onClick={() => {
                        add(course);
                        navigate("/checkout");
                      }}
                    >
                      Buy now
                    </button>
                  </>
                ) : (
                  <>
                    Please log in and purchase this course to unlock videos.{" "}
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ marginLeft: 10 }}
                      onClick={() => navigate(loginRedirect)}
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="tab-content-card">
            <h3>Course Videos</h3>
            <p style={{ marginTop: 6, color: "#64748b", fontWeight: 650 }}>
              Watch lessons and walkthroughs for this course.
            </p>

            {hasAnyVideos ? (
              <div className="checkout-card" style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ color: "#334155", fontWeight: 750 }}>
                  Progress: <strong>{completedVideoCount}/{totalVideoLessons}</strong>
                </div>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={totalVideoLessons <= 0 || completedVideoCount < totalVideoLessons}
                  onClick={() => navigate(`/courses/${course.slug}/final-test`)}
                >
                  Final Test
                </button>
              </div>
            ) : null}

            {serverVideosLoading ? (
              <div className="cd-empty-videos">Loading videos…</div>
            ) : serverVideosError ? (
              <div className="cd-empty-videos">Unable to load videos: {serverVideosError}</div>
            ) : videoWeeks.length ? (
              <div className="cd-videos">
                {activeVideo ? (
                  <div className="cd-videos__player" ref={videoPlayerRef} key={activeVideoKey || "player"}>
                    {renderCourseVideo(activeVideo, 0)}
                  </div>
                ) : null}

                {activeVideoLoadStatus && activeVideoLoadStatus.ok === false ? (
                  <div className="cd-empty-videos" style={{ marginTop: 0 }}>
                    {activeVideoLoadStatus.status ? (
                      <strong style={{ marginRight: 8 }}>Error {activeVideoLoadStatus.status}:</strong>
                    ) : null}
                    {activeVideoLoadStatus.message || "Video failed to load."}
                  </div>
                ) : null}

                <div className="cd-curriculum-accordion cd-video-accordion" role="list">
                  {videoWeeks.map((week, weekIdx) => {
                    const open = expandedVideoWeeks.has(weekIdx);
                    const count = week.items.length;
                    return (
                      <div
                        key={week.label}
                        className={`cd-acc-section${open ? " is-open" : ""}`}
                        role="listitem"
                      >
                        <button
                          type="button"
                          className="cd-acc-trigger"
                          onClick={() => toggleVideoWeek(weekIdx)}
                          aria-expanded={open}
                          aria-controls={`cd-video-panel-${weekIdx}`}
                          id={`cd-video-heading-${weekIdx}`}
                        >
                          <FaChevronDown className="cd-acc-chevron" aria-hidden />
                          <span className="cd-acc-trigger-text">
                            <span className="cd-acc-section-title">{week.label}</span>
                          </span>
                        </button>

                        <div
                          className="cd-acc-panel"
                          id={`cd-video-panel-${weekIdx}`}
                          role="region"
                          aria-labelledby={`cd-video-heading-${weekIdx}`}
                          aria-hidden={!open}
                        >
                          <ul className="cd-lesson-list">
                            {week.items.map((v, vi) => {
                              const title = cleanVideoTitle(v?.title || `Video ${vi + 1}`);
                              const isActive = activeVideoKey === v._key;
                              const dur = formatVideoDuration(videoDurations[v._key]);
                              const lessonKey = String(v?.lessonKey || `video:${v._key}`);
                              const done = progress.has(lessonKey);
                              return (
                                <li key={v._key} className={`cd-video-row${isActive ? " is-active" : ""}`}>
                                  <button
                                    type="button"
                                    className="cd-video-pick"
                                    onClick={() => {
                                      setActiveVideoKey(v._key);
                                      requestAnimationFrame(() => {
                                        videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                      });
                                    }}
                                  >
                                    {title}
                                  </button>
                                  <button
                                    type="button"
                                    className={`cd-lesson-done${done ? " is-done" : ""}`}
                                    disabled={!currentEnrollment}
                                    onClick={async () => {
                                      const next = !done;
                                      setProgress((prev) => {
                                        const s = new Set(prev);
                                        if (next) s.add(lessonKey);
                                        else s.delete(lessonKey);
                                        return s;
                                      });
                                      try {
                                        await fetch(apiUrl(`/progress/${encodeURIComponent(course.slug)}`), {
                                          method: "PUT",
                                          credentials: "include",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            lessonKey,
                                            completed: next,
                                            totalLessons: totalVideoLessons || 0,
                                          }),
                                        });
                                      } catch {
                                        // ignore
                                      }
                                    }}
                                  >
                                    {done ? "Done" : "Mark"}
                                  </button>
                                  {dur ? <span className="cd-video-duration">{dur}</span> : null}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="cd-empty-videos">
                No videos uploaded for this course yet.
              </div>
            )}
          </div>
        );

      case "curriculum":
        if (hasAnyVideos && hasVideoAccess) {
          return (
            <div className="tab-content-card">
              <h3>Course content</h3>
              <p style={{ marginTop: 6, color: "#64748b", fontWeight: 650 }}>
                This course uses week-wise video lessons. Please check the Videos tab.
              </p>
            </div>
          );
        }
        return (
          <div className="tab-content-card cd-curriculum-card">
            <div className="cd-curriculum-head">
              <h3 className="cd-curriculum-title">Course content</h3>
              <p className="cd-curriculum-sub">
                {curriculumSummary.sections} sections{" \u00B7 "}
                {curriculumSummary.lectures} lessons{" \u00B7 "}
                {formatMinutes(curriculumSummary.totalMin)} total
              </p>
              <p className="cd-curriculum-hint">
                Expand each section to see lessons, content types, and durations.
              </p>
                    </div>
            <div className="cd-curriculum-accordion" role="list">
              {accordionModules.map((mod, moduleIndex) => {
                const open = expandedModules.has(moduleIndex);
                return (
                  <div
                    key={moduleIndex}
                    className={`cd-acc-section${open ? " is-open" : ""}`}
                    role="listitem"
                  >
                    <button
                      type="button"
                      className="cd-acc-trigger"
                      onClick={() => toggleModule(moduleIndex)}
                      aria-expanded={open}
                      aria-controls={`cd-acc-panel-${moduleIndex}`}
                      id={`cd-acc-heading-${moduleIndex}`}
                    >
                      <FaChevronDown className="cd-acc-chevron" aria-hidden />
                      <span className="cd-acc-trigger-text">
                        <span className="cd-acc-section-title">
                          Section {moduleIndex + 1}: {mod.moduleTitle}
                        </span>
                        <span className="cd-acc-section-meta">
                          {mod.lectureCount} lessons{" \u00B7 "}
                          {formatMinutes(mod.totalMin)}
                        </span>
                      </span>
                    </button>
                    <div
                      className="cd-acc-panel"
                      id={`cd-acc-panel-${moduleIndex}`}
                      role="region"
                      aria-labelledby={`cd-acc-heading-${moduleIndex}`}
                      aria-hidden={!open}
                    >
                      <ul className="cd-lesson-list">
                        {mod.lessons.map((lesson, li) => {
                          const Icon = LESSON_ICON[lesson.type] || FaFileAlt;
                          const showPreview = moduleIndex === 0 && li === 0 && lesson.type === "video";
                          const lessonKey = `${moduleIndex}:${li}`;
                          const done = progress.has(lessonKey);
                          return (
                            <li key={li} className="cd-lesson-row">
                              <Icon className={`cd-lesson-type cd-lesson-type--${lesson.type}`} aria-hidden />
                              <span className="cd-lesson-name">
                                {lesson.title}
                                {showPreview ? (
                                  <span className="cd-lesson-preview">Preview</span>
                                ) : null}
                              </span>
                              <button
                                type="button"
                                className={`cd-lesson-done${done ? " is-done" : ""}`}
                                disabled={!currentEnrollment}
                                onClick={async () => {
                                  const next = !done;
                                  setProgress((prev) => {
                                    const s = new Set(prev);
                                    if (next) s.add(lessonKey);
                                    else s.delete(lessonKey);
                                    return s;
                                  });
                                  try {
                                    await fetch(apiUrl(`/progress/${encodeURIComponent(course.slug)}`), {
                                      method: "PUT",
                                      credentials: "include",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        lessonKey,
                                        completed: next,
                                        totalLessons: curriculumSummary.lectures,
                                      }),
                                    });
                                  } catch {
                                    // ignore
                                  }
                                }}
                              >
                                {done ? "Done" : "Mark"}
                              </button>
                              <span className="cd-lesson-time">{lesson.min} min</span>
                          </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
              </div>
          </div>
        );

      case "reviews":
        return (
          <div className="tab-content-card">
            <h3>Student Reviews</h3>
            <p style={{ marginTop: 6, color: "#64748b", fontWeight: 750 }}>
              ★ {avgRating ? avgRating.toFixed(1) : "0.0"} ({reviews.length})
            </p>

            {currentEnrollment ? (
              <div className="checkout-card" style={{ marginTop: 14 }}>
                <h4 style={{ margin: 0, fontWeight: 900 }}>Write a review</h4>
                {reviewError ? (
                  <p style={{ margin: "10px 0 0", color: "#b91c1c", fontWeight: 850 }}>{reviewError}</p>
                ) : null}
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900, color: "#334155" }}>Rating</div>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="secondary-btn small-btn"
                          aria-label={`${n} star`}
                          onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}
                          style={{
                            width: 44,
                            justifyContent: "center",
                            borderColor: reviewForm.rating === n ? "rgba(245,158,11,0.55)" : undefined,
                            background: reviewForm.rating === n ? "rgba(245,158,11,0.12)" : undefined,
                            color: reviewForm.rating === n ? "#92400e" : undefined,
                            fontWeight: 950,
                          }}
                        >
                          ★ {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(15,23,42,0.12)" }}
                  />
                  <textarea
                    placeholder="Your experience (optional)"
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm((p) => ({ ...p, body: e.target.value }))}
                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(15,23,42,0.12)", minHeight: 90 }}
                  />
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={reviewSubmitting}
                    onClick={async () => {
                      setReviewSubmitting(true);
                      setReviewError("");
                      try {
                        const res = await fetch(apiUrl(`/reviews/${encodeURIComponent(course.slug)}`), {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(reviewForm),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok || !data.ok) throw new Error(data.error || "Review failed.");
                        const rRes = await fetch(apiUrl(`/reviews/${encodeURIComponent(course.slug)}`));
                        const rData = await rRes.json().catch(() => ({}));
                        setReviews(Array.isArray(rData.reviews) ? rData.reviews : []);
                        setAvgRating(Number(rData.avgRating || 0));
                        setReviewForm((p) => ({ ...p, title: "", body: "" }));
                      } catch (e) {
                        setReviewError(e?.message || "Review failed.");
                      } finally {
                        setReviewSubmitting(false);
                      }
                    }}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit review"}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: 12, color: "#64748b", fontWeight: 750 }}>
                Only enrolled learners can write a review. Complete enrollment to unlock reviews.
              </p>
            )}

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {reviews.map((r, idx) => (
                <div key={idx} className="checkout-card">
                  <div style={{ fontWeight: 950 }}>
                    ★ {Number(r.rating || 0)}{" "}
                    <span style={{ color: "#64748b", fontWeight: 700, marginLeft: 8 }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  {r.title ? (
                    <div style={{ marginTop: 6, fontWeight: 900 }}>{r.title}</div>
                  ) : null}
                  {r.body ? (
                    <div style={{ marginTop: 8, color: "#334155", fontWeight: 650, whiteSpace: "pre-wrap" }}>
                      {r.body}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!course) {
    return (
      <section className="section-page course-detail-page">
        <Helmet>
          <title>Course not found | Bharat Skill Development Academy</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="container">
          <h2>Course not found</h2>
          <p>The course you are looking for does not exist.</p>
          <Link className="primary-btn" to="/courses">
            Back to courses
          </Link>
        </div>
      </section>
    );
  }

  const detailDesc = `${course.name} — ${course.level} level, ${course.duration}. ${course.category}. Enrol at Bharat Skill Development Academy.`;
  const detailUrl = `https://bharatskillacademy.com/courses/${encodeURIComponent(course.slug)}`;

  return (
    <section className="section-page course-detail-page">
      <Helmet>
        <title>{`${course.name} | Bharat Skill Development Academy`}</title>
        <meta name="description" content={detailDesc.slice(0, 160)} />
        <link rel="canonical" href={detailUrl} />
      </Helmet>
      <div className="container">
        <div className="course-detail-header">
          <h1>{course.name}</h1>
          <div className="course-meta-row course-meta-row--cta">
            <div className="course-meta-chips" aria-label="Course details">
            <div className="meta-item">
                <FaRupeeSign /> INR {course.price.toLocaleString("en-IN")}
            </div>
            <div className="meta-item">
              <FaClock /> {course.duration}
            </div>
            <div className="meta-item">
              <FaGraduationCap /> {course.level}
            </div>
            <div className="meta-item">
                <span className="category-badge">{course.category}</span>
              </div>
            </div>
            <div className="course-meta-actions" role="toolbar" aria-label="Course actions">
                {currentEnrollment ? (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleResumeLearning}
                    style={{ whiteSpace: "nowrap", paddingLeft: 18, paddingRight: 18 }}
                    aria-label={nextIncompleteLesson ? "Resume learning" : "Go to reviews"}
                  >
                    {nextIncompleteLesson ? "Resume learning" : "Write a review"}
                  </button>
                ) : hasPendingApplication ? (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => navigate("/orders")}
                    style={{ whiteSpace: "nowrap", paddingLeft: 18, paddingRight: 18 }}
                    aria-label="Application pending, view order history"
                  >
                    Application pending
                  </button>
                ) : hasNotPaidDecision ? (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => navigate("/orders")}
                    style={{ whiteSpace: "nowrap", paddingLeft: 18, paddingRight: 18 }}
                    aria-label="Not paid, view order history"
                  >
                    Not paid
                  </button>
                ) : null}
              <a
                className="secondary-btn course-buy-now-btn course-buy-now-btn--icon"
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hi! I want details about "${course.name}" from Bharat Skill Development Academy.`
                )}`}
                target="_blank"
                rel="noreferrer"
                title="WhatsApp chat"
                aria-label={`WhatsApp chat about ${course.name}`}
              >
                <FaWhatsapp aria-hidden className="course-detail-action-icon" />
              </a>
              <button
                type="button"
                className="secondary-btn course-buy-now-btn course-buy-now-btn--icon"
                onClick={() => {
                  setCallbackOpen(true);
                  setCallbackResult(null);
                }}
                title="Request callback"
                aria-label="Request a callback for this course"
              >
                <FaPhone aria-hidden className="course-detail-action-icon" />
              </button>
              <button
                type="button"
                className="secondary-btn course-buy-now-btn course-buy-now-btn--icon"
                onClick={async () => {
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
                title={wish ? "Remove from wishlist" : "Add to wishlist"}
                aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wish}
              >
                {wish ? (
                  <FaHeart aria-hidden className="course-detail-action-icon" />
                ) : (
                  <FaRegHeart aria-hidden className="course-detail-action-icon" />
                )}
              </button>
              {user ? (
                <>
                  <button
                    type="button"
                    className="secondary-btn course-buy-now-btn course-buy-now-btn--icon"
                    onClick={() => {
                      if (hasPendingApplication) {
                        navigate("/orders");
                        return;
                      }
                      add(course);
                      setAddedOpen(true);
                    }}
                    title="Add to cart"
                    aria-label="Add course to cart"
                    disabled={hasPendingApplication}
                  >
                    <FaShoppingCart aria-hidden className="course-detail-action-icon" />
                  </button>
                  <button
                    type="button"
                    className="primary-btn course-buy-now-btn course-buy-now-btn--icon"
                    onClick={() => {
                      if (hasPendingApplication) {
                        navigate("/orders");
                        return;
                      }
                      add(course);
                      navigate("/checkout");
                    }}
                    title="Proceed to checkout"
                    aria-label="Proceed to checkout"
                    disabled={hasPendingApplication}
                  >
                    <FaArrowRight aria-hidden className="course-detail-action-icon" />
                  </button>
                </>
              ) : (
                <Link
                  to={loginRedirect}
                  className="primary-btn course-buy-now-btn course-buy-now-btn--login-cta"
                  title="Log in to add courses to cart and checkout"
                >
                  Log in to buy
                </Link>
              )}
              <button
                type="button"
                className="secondary-btn course-buy-now-btn course-buy-now-btn--icon"
                onClick={() => {
                  setIssueOpen(true);
                  setIssueMessage("");
                  setIssueResult(null);
                }}
                title="Report an issue"
                aria-label="Report an issue with this course"
              >
                <FaExclamationCircle aria-hidden className="course-detail-action-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="course-detail-content">
          <div className="course-image-section">
            <div className="course-detail-image course-detail-image--cover">
              <img
                src={getCourseImage(course.name, "detail")}
                alt={`${course.name} — course cover`}
                className="course-detail-cover-img"
                loading="eager"
                decoding="async"
                width={1280}
                height={720}
                onError={(e) => {
                  e.currentTarget.src = getCourseImageFallback(course.name, "detail");
                }}
              />
            </div>
          </div>

          <div className="tabs-section" ref={tabsSectionRef}>
            <div className="tabs">
              <button className={activeTab === "overview" ? "tab active" : "tab"} onClick={() => setActiveTab("overview")}>Overview</button>
              {(hasCourseVideos || (hasVideoAccess && (serverVideosLoading || serverVideosError || Array.isArray(serverVideoWeeks)))) ? (
                <button className={activeTab === "videos" ? "tab active" : "tab"} onClick={() => setActiveTab("videos")}>Videos</button>
              ) : null}
              {(!hasAnyVideos || !hasVideoAccess) ? (
                <button className={activeTab === "curriculum" ? "tab active" : "tab"} onClick={() => setActiveTab("curriculum")}>Curriculum</button>
              ) : null}
              <button className={activeTab === "reviews" ? "tab active" : "tab"} onClick={() => setActiveTab("reviews")}>Reviews</button>
            </div>
            <div className="tab-content">{renderTabContent()}</div>
          </div>
        </div>

        {alsoBought.length > 0 ? (
          <section className="catalog-module-section" style={{ marginTop: 26 }}>
            <div className="catalog-module-head">
              <h2>People also bought</h2>
              <span>{alsoBought.length} suggestions</span>
            </div>
            <div className="course-catalog-grid">
              {alsoBought.map((c, idx) => (
                <Link key={`also-${c.slug}-${idx}`} to={`/courses/${c.slug}`} className="course-card-link">
                  <article className="course-card course-card-udemy">
                    <div className="course-card-content">
                      <span className="course-category-badge">{c.category}</span>
                      <h3 className="course-title">{c.name}</h3>
                      <div style={{ marginTop: 10, fontWeight: 950 }}>₹{Number(c.price || 0).toLocaleString("en-IN")}</div>
                      <div className="course-card-footer" style={{ marginTop: 14 }}>
                        <span className="btn-primary btn-sm">View Details</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {similarCourses.length > 0 ? (
          <section className="catalog-module-section" style={{ marginTop: 18 }}>
            <div className="catalog-module-head">
              <h2>Similar courses</h2>
              <span>{similarCourses.length} courses</span>
            </div>
            <div className="course-catalog-grid">
              {similarCourses.map((c, idx) => (
                <Link key={`sim-${c.slug}-${idx}`} to={`/courses/${c.slug}`} className="course-card-link">
                  <article className="course-card course-card-udemy">
                    <div className="course-card-content">
                      <span className="course-category-badge">{c.category}</span>
                      <h3 className="course-title">{c.name}</h3>
                      <div style={{ marginTop: 10, fontWeight: 950 }}>₹{Number(c.price || 0).toLocaleString("en-IN")}</div>
                      <div className="course-card-footer" style={{ marginTop: 14 }}>
                        <span className="btn-primary btn-sm">View Details</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {addedOpen ? (
          createPortal(
            <div
              className="course-modal-overlay"
              role="presentation"
              onClick={() => setAddedOpen(false)}
            >
              <div
                className="course-modal"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setAddedOpen(false)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
                <h2 className="upi-modal-heading">Added to cart</h2>
                <p className="upi-course-line">{course.name}</p>
                <div className="action-buttons">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setAddedOpen(false);
                      navigate("/courses");
                    }}
                  >
                    Continue browsing
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => navigate("/cart")}
                  >
                    Go to cart
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        ) : null}

        {issueOpen ? (
          createPortal(
            <div
              className="course-modal-overlay"
              role="presentation"
              onClick={() => setIssueOpen(false)}
            >
              <div
                className="course-modal"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setIssueOpen(false)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>

                <h2 className="upi-modal-heading">Report an issue</h2>
                <p className="upi-course-line">{course.name}</p>
                {currentEnrollment?.orderId ? (
                  <p style={{ margin: "0 0 12px", color: "#64748b", fontWeight: 700 }}>
                    Order ID: {currentEnrollment.orderId}
                  </p>
                ) : (
                  <p style={{ margin: "0 0 12px", color: "#64748b", fontWeight: 700 }}>
                    Order ID: Not found (optional)
                  </p>
                )}

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 800, color: "#0f172a" }}>
                    Describe the issue
                  </label>
                  <textarea
                    value={issueMessage}
                    onChange={(e) => setIssueMessage(e.target.value)}
                    placeholder="Example: Access not working, video not playing, wrong content, etc."
                    style={{
                      width: "100%",
                      minHeight: 110,
                      resize: "vertical",
                      borderRadius: 14,
                      border: "1px solid rgba(15, 23, 42, 0.12)",
                      background: "#fff",
                      padding: 12,
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>

                {issueResult ? (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: issueResult.ok ? "#065f46" : "#b91c1c",
                      fontWeight: 850,
                    }}
                  >
                    {issueResult.ok ? "Sent to support successfully." : issueResult.error}
                  </p>
                ) : null}

                <div className="action-buttons" style={{ marginTop: 18 }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIssueOpen(false)}
                    disabled={issueSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={issueSubmitting || issueMessage.trim().length < 3}
                    onClick={async () => {
                      setIssueSubmitting(true);
                      setIssueResult(null);
                      try {
                        const res = await fetch(apiUrl("/issues/report"), {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            courseKey: course.slug,
                            courseName: course.name,
                            orderId: currentEnrollment?.orderId || null,
                            message: issueMessage,
                          }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok || !data.ok) {
                          throw new Error(data.error || "Could not send issue.");
                        }
                        setIssueResult({ ok: true });
                        setTimeout(() => setIssueOpen(false), 900);
                      } catch (e) {
                        setIssueResult({ ok: false, error: e?.message || "Could not send issue." });
                      } finally {
                        setIssueSubmitting(false);
                      }
                    }}
                  >
                    {issueSubmitting ? "Sending..." : "Send to Support"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        ) : null}

        {callbackOpen ? (
          createPortal(
            <div className="course-modal-overlay" role="presentation" onClick={() => setCallbackOpen(false)}>
              <div className="course-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="modal-close" onClick={() => setCallbackOpen(false)} aria-label="Close">
                  <FaTimes />
                </button>
                <h2 className="upi-modal-heading">Request a callback</h2>
                <p className="upi-course-line">{course.name}</p>

                <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                  <input
                    value={callbackForm.name}
                    onChange={(e) => setCallbackForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(15,23,42,0.12)" }}
                  />
                  <input
                    value={callbackForm.mobile}
                    onChange={(e) => setCallbackForm((p) => ({ ...p, mobile: e.target.value }))}
                    placeholder="Mobile number"
                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(15,23,42,0.12)" }}
                  />
                  <textarea
                    value={callbackForm.message}
                    onChange={(e) => setCallbackForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Message (optional)"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      minHeight: 90,
                    }}
                  />
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={callbackSubmitting || callbackForm.name.trim().length < 2 || callbackForm.mobile.trim().length < 8}
                    onClick={async () => {
                      setCallbackSubmitting(true);
                      setCallbackResult(null);
                      try {
                        const res = await fetch(apiUrl("/leads/callback"), {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...callbackForm, courseKey: course.slug }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok || !data.ok) throw new Error(data.error || "Request failed.");
                        setCallbackResult({ ok: true });
                        setCallbackForm({ name: "", mobile: "", message: "" });
                      } catch (e) {
                        setCallbackResult({ ok: false, error: e?.message || "Request failed." });
                      } finally {
                        setCallbackSubmitting(false);
                      }
                    }}
                  >
                    {callbackSubmitting ? "Submitting..." : "Submit request"}
                  </button>
                  {callbackResult ? (
                    <p style={{ margin: 0, color: callbackResult.ok ? "#065f46" : "#b91c1c", fontWeight: 850 }}>
                      {callbackResult.ok ? "Request submitted. We will contact you soon." : callbackResult.error}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body
          )
        ) : null}
      </div>
    </section>
  );
}

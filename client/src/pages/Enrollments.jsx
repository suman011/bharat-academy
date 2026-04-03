import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/apiBase";

export default function Enrollments() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [error, setError] = useState("");
  const [remindingKey, setRemindingKey] = useState("");
  const [remindResult, setRemindResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/enrollments"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            navigate(`/login?next=${encodeURIComponent("/enrollments")}`);
            return;
          }
          throw new Error(data.error || "Failed to load enrollments.");
        }
        const pRes = await fetch(apiUrl("/progress/summary"), { credentials: "include" });
        const pData = await pRes.json().catch(() => ({}));
        const pRows = Array.isArray(pData?.rows) ? pData.rows : [];
        const nextMap = {};
        for (const r of pRows) {
          const arr = Array.isArray(r.completedLessonKeys) ? r.completedLessonKeys : [];
          const total = Number(r.totalLessons || 0) || 0;
          const pct = total > 0 ? Math.min(100, Math.round((arr.length / total) * 100)) : 0;
          nextMap[String(r.courseKey || "").toLowerCase()] = { completed: arr.length, total, pct };
        }
        if (!alive) return;
        setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
        setProgressMap(nextMap);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load enrollments.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <section className="section-page">
      <div className="container">
        <div className="page-head theme-section-head">
          <span>My Courses</span>
          <h1>My Enrollments</h1>
          <p>Access your purchased courses anytime.</p>
        </div>

        {loading ? <p>Loading...</p> : null}
        {error ? <p style={{ color: "#b91c1c", fontWeight: 800 }}>{error}</p> : null}

        {!loading && enrollments.length === 0 ? (
          <div className="cart-empty">
            <p>You have no enrollments yet.</p>
            <Link to="/courses" className="primary-btn">
              Browse courses
            </Link>
          </div>
        ) : null}

        {enrollments.length > 0 ? (
          <div className="course-catalog-grid" style={{ marginTop: 18 }}>
            {enrollments.map((e) => (
              <div key={e.courseKey} className="cart-summary__box">
                <div style={{ fontWeight: 950, color: "#0f172a", fontSize: "1.05rem" }}>
                  {e.courseName}
                </div>
                <div style={{ marginTop: 6, color: "#64748b", fontWeight: 700 }}>
                  Order: {e.orderId} · {e.paymentMethod}
                </div>
                <div style={{ marginTop: 10, fontWeight: 950 }}>
                  ₹{Number(e.price || 0).toLocaleString("en-IN")}
                </div>
                <div style={{ marginTop: 10, color: "#334155", fontWeight: 850 }}>
                  Progress:{" "}
                  <strong>{progressMap[String(e.courseKey || "").toLowerCase()]?.pct ?? 0}%</strong>{" "}
                  <span style={{ color: "#64748b", fontWeight: 750 }}>
                    ({progressMap[String(e.courseKey || "").toLowerCase()]?.completed ?? 0}/
                    {progressMap[String(e.courseKey || "").toLowerCase()]?.total ?? 0} lessons)
                  </span>
                </div>
                <div style={{ marginTop: 14 }}>
                  <Link to={`/courses/${e.courseKey}`} className="primary-btn small-btn" style={{ width: "100%" }}>
                    Continue Learning
                  </Link>
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  <button
                    type="button"
                    className="secondary-btn small-btn"
                    disabled={remindingKey === e.courseKey}
                    onClick={async () => {
                      setRemindingKey(e.courseKey);
                      setRemindResult(null);
                      try {
                        const res = await fetch(apiUrl("/notifications/reminder"), {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ courseKey: e.courseKey, courseName: e.courseName }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok || !data.ok) throw new Error(data.error || "Reminder failed.");
                        setRemindResult({ ok: true, courseKey: e.courseKey, email: data.email });
                      } catch (err) {
                        setRemindResult({ ok: false, courseKey: e.courseKey, error: err?.message || "Reminder failed." });
                      } finally {
                        setRemindingKey("");
                      }
                    }}
                  >
                    {remindingKey === e.courseKey ? "Sending reminder..." : "Send reminder (Email)"}
                  </button>

                  <a
                    className="secondary-btn small-btn"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hi! Reminder from Bharat Skill Development Academy: Continue your course "${e.courseName}". Login and continue: ${window.location.origin}/login`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Share reminder on WhatsApp
                  </a>
                </div>

                {remindResult && remindResult.courseKey === e.courseKey ? (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: remindResult.ok ? "#065f46" : "#b91c1c",
                      fontWeight: 850,
                    }}
                  >
                    {remindResult.ok
                      ? `Reminder ${remindResult.email === "sent" ? "email sent" : "created (SMTP not configured)"}`
                      : remindResult.error}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}


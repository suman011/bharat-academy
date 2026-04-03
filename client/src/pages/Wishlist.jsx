import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/apiBase";

export default function Wishlist() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const courses = useMemo(
    () =>
      (items || []).map((x) => ({
        courseKey: x.courseKey,
        course: x.course || {},
      })),
    [items]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/wishlist"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            navigate(`/login?next=${encodeURIComponent("/wishlist")}`);
            return;
          }
          throw new Error(data.error || "Failed to load wishlist.");
        }
        if (!alive) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load wishlist.");
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
          <span>Saved for later</span>
          <h1>Wishlist</h1>
          <p>Courses you bookmarked to buy later.</p>
        </div>

        {loading ? <p>Loading...</p> : null}
        {error ? <p style={{ color: "#b91c1c", fontWeight: 850 }}>{error}</p> : null}

        {!loading && courses.length === 0 ? (
          <div className="cart-empty">
            <p>Your wishlist is empty.</p>
            <Link to="/courses" className="primary-btn">
              Browse courses
            </Link>
          </div>
        ) : null}

        {courses.length > 0 ? (
          <div className="course-catalog-grid" style={{ marginTop: 16 }}>
            {courses.map((x, idx) => (
              <Link
                key={`${x.courseKey}-${idx}`}
                to={`/courses/${x.courseKey}`}
                className="course-card-link"
              >
                <article className="course-card course-card-udemy">
                  <div className="course-card-content">
                    <span className="course-category-badge">
                      {x.course?.category || "Course"}
                    </span>
                    <h3 className="course-title">{x.course?.name || "Course"}</h3>
                    <div style={{ marginTop: 10, fontWeight: 950 }}>
                      ₹{Number(x.course?.price || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="course-card-footer" style={{ marginTop: 14 }}>
                      <span className="btn-primary btn-sm">View Details</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}


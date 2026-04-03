import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/apiBase";

const KIND_LABEL = {
  update: "Update",
  batch: "New batch",
  offer: "Offer",
  maintenance: "Maintenance",
};

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const sRes = await fetch(apiUrl("/notifications/summary"), { credentials: "include" });
        const sData = await sRes.json().catch(() => ({}));
        if (!sRes.ok || !sData.ok) {
          if (sRes.status === 401) {
            navigate(`/login?next=${encodeURIComponent("/notifications")}`);
            return;
          }
          throw new Error(sData.error || "Failed to load notifications.");
        }

        const aRes = await fetch(apiUrl("/announcements?take=30"), { credentials: "include" });
        const aData = await aRes.json().catch(() => ({}));
        if (!aRes.ok || !aData.ok) throw new Error(aData.error || "Failed to load announcements.");

        // Mark as seen when user visits the page.
        await fetch(apiUrl("/notifications/seen"), { method: "POST", credentials: "include" }).catch(() => null);

        if (!alive) return;
        setUnread(Number(sData.unreadCount || 0));
        setItems(Array.isArray(aData.announcements) ? aData.announcements : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load notifications.");
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
          <span>Updates</span>
          <h1>Announcements</h1>
          <p>
            Latest updates from Bharat Skill Development Academy
            {unread ? ` · ${unread} new` : ""}.
          </p>
        </div>

        {loading ? <p>Loading...</p> : null}
        {error ? <p style={{ color: "#b91c1c", fontWeight: 900 }}>{error}</p> : null}

        {!loading && !error && items.length === 0 ? <p>No announcements yet.</p> : null}

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {items.map((a) => (
            <div key={a.id} className="checkout-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong style={{ fontSize: "1.05rem" }}>{a.title}</strong>
                <span style={{ color: "#64748b", fontWeight: 750 }}>
                  {new Date(a.publishAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ marginTop: 6, color: "#0f766e", fontWeight: 850 }}>
                {KIND_LABEL[String(a.kind || "update")] || "Update"}
              </div>
              <div style={{ marginTop: 10, whiteSpace: "pre-wrap", color: "#334155", fontWeight: 650 }}>
                {a.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


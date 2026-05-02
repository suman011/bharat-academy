import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../utils/apiBase";
import { getCurrentUser } from "../utils/authStore";

function formatClock(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function FinalTest() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const courseKey = useMemo(() => String(courseSlug || "").trim().toLowerCase(), [courseSlug]);
  const storageKey = useMemo(() => `finalTestState:${courseKey}`, [courseKey]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState(null); // quiz metadata + questions
  const [answers, setAnswers] = useState([]); // array aligned to questions
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null); // { sessionToken, startedAtMs, durationSec, expiresAtMs }
  const [remainingSec, setRemainingSec] = useState(0);
  const autoSubmittedRef = useRef(false);

  const hasPassed = Boolean(meta?.alreadyPassed || result?.passed);
  const questionCount = Array.isArray(meta?.questions) ? meta.questions.length : 0;
  const answeredCount = useMemo(
    () => (Array.isArray(answers) ? answers.filter((x) => Number.isInteger(x)).length : 0),
    [answers]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        setResult(null);

        const res = await fetch(apiUrl(`/final-test/${encodeURIComponent(courseKey)}`), {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (!res.ok || !data.ok) {
          setMeta(null);
          setLoading(false);
          setError(String(data?.error || `Failed to load (HTTP ${res.status}).`));
          return;
        }

        setMeta(data);
        const qLen = Array.isArray(data.questions) ? data.questions.length : 0;
        // restore draft if possible
        try {
          const raw = sessionStorage.getItem(storageKey);
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && Array.isArray(parsed.answers) && parsed.answers.length === qLen) {
            setAnswers(parsed.answers);
            if (parsed.session && parsed.session.expiresAtMs && Date.now() < parsed.session.expiresAtMs) {
              setSession(parsed.session);
              setRemainingSec(Math.ceil((parsed.session.expiresAtMs - Date.now()) / 1000));
            } else {
              setSession(null);
            }
          } else {
            setAnswers(new Array(qLen).fill(null));
            setSession(null);
          }
        } catch {
          setAnswers(new Array(qLen).fill(null));
          setSession(null);
        }
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setMeta(null);
        setLoading(false);
        setError(String(e?.message || "Failed to load."));
      }
    })();
    return () => {
      alive = false;
    };
  }, [courseKey, storageKey]);

  // Persist draft answers + session token (reliable across refresh)
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ answers, session }));
    } catch {
      // ignore
    }
  }, [answers, session, storageKey]);

  // Timer tick
  useEffect(() => {
    if (!session?.expiresAtMs) return undefined;
    autoSubmittedRef.current = false;
    const tick = () => {
      const left = Math.ceil((session.expiresAtMs - Date.now()) / 1000);
      setRemainingSec(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [session?.expiresAtMs]);

  // Warn if user tries to leave during an active timed attempt.
  useEffect(() => {
    const active = Boolean(session?.expiresAtMs) && remainingSec > 0 && !hasPassed;
    if (!active) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasPassed, remainingSec, session?.expiresAtMs]);

  const canSubmit = useMemo(() => {
    if (!meta?.unlocked) return false;
    if (!Array.isArray(meta?.questions) || !meta.questions.length) return false;
    return answers.every((x) => Number.isInteger(x));
  }, [answers, meta]);

  const downloadHref = useMemo(() => apiUrl(`/certificate/${encodeURIComponent(courseKey)}/download`), [courseKey]);

  const startTest = async () => {
    setError("");
    try {
      const res = await fetch(apiUrl(`/final-test/${encodeURIComponent(courseKey)}/start`), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(String(data?.error || `Failed to start (HTTP ${res.status}).`));
        return null;
      }
      if (data.alreadyPassed) return { alreadyPassed: true, certificate: data.certificate || null };
      const next = {
        sessionToken: data.sessionToken,
        startedAtMs: data.startedAtMs,
        durationSec: data.durationSec,
        expiresAtMs: data.expiresAtMs,
      };
      setSession(next);
      setRemainingSec(Math.ceil((next.expiresAtMs - Date.now()) / 1000));
      return next;
    } catch (e) {
      setError(String(e?.message || "Failed to start."));
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    const active = session || (await startTest());
    if (!active || active.alreadyPassed) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl(`/final-test/${encodeURIComponent(courseKey)}/submit`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswers: answers, sessionToken: active.sessionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setResult({ ok: false, message: String(data?.error || `Submit failed (HTTP ${res.status}).`) });
        setSubmitting(false);
        return;
      }
      if (data.alreadyPassed) {
        setResult({ ok: true, passed: true, alreadyPassed: true, certificate: data.certificate || null });
      } else {
        setResult({ ok: true, ...(data.result || {}), certificate: data.certificate || null, attemptsUsed: data.attemptsUsed, maxAttempts: data.maxAttempts });
      }
      setSubmitting(false);
    } catch (e) {
      setResult({ ok: false, message: String(e?.message || "Submit failed.") });
      setSubmitting(false);
    }
  };

  // Auto-submit on timeout (best-effort). If not all answered, still submits and will likely fail/pass based on chosen answers.
  useEffect(() => {
    if (!session?.expiresAtMs) return;
    if (submitting) return;
    if (result && result.ok !== false) return;
    if (remainingSec > 0) return;
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    (async () => {
      const active = session;
      if (!active?.sessionToken) return;
      setSubmitting(true);
      setResult({ ok: false, message: "Time is over. Submitting your answers…" });
      try {
        const res = await fetch(apiUrl(`/final-test/${encodeURIComponent(courseKey)}/submit`), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAnswers: answers, sessionToken: active.sessionToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setResult({ ok: false, message: String(data?.error || `Submit failed (HTTP ${res.status}).`) });
          setSubmitting(false);
          return;
        }
        setResult({ ok: true, ...(data.result || {}), certificate: data.certificate || null, attemptsUsed: data.attemptsUsed, maxAttempts: data.maxAttempts });
        setSubmitting(false);
      } catch (e) {
        setResult({ ok: false, message: String(e?.message || "Submit failed.") });
        setSubmitting(false);
      }
    })();
  }, [answers, courseKey, remainingSec, result, session, submitting]);

  if (!user) {
    return (
      <div className="site-container" style={{ padding: "28px 0" }}>
        <div className="tab-content-card">
          <h3>Final Test</h3>
          <p style={{ marginTop: 8, color: "#64748b", fontWeight: 650 }}>Please log in to take the final test.</p>
          <button type="button" className="primary-btn" style={{ marginTop: 12 }} onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/courses/${courseKey}/final-test`)}`)}>
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container" style={{ padding: "28px 0" }}>
      <div className="tab-content-card" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            position: "sticky",
            // Header is already sticky at top:0; offset this bar below it.
            top: 84,
            zIndex: 5,
            background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(248,250,252,0.92))",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(148,163,184,0.25)",
            paddingTop: 10,
            paddingBottom: 12,
            marginBottom: 12,
            borderRadius: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0 }}>{meta?.quizTitle || "Final Test"}</h3>
              {meta ? (
                <p style={{ marginTop: 8, color: "#64748b", fontWeight: 650 }}>
                  Pass: {meta.passPercentage}% · Attempts: {meta.attemptsUsed}/{meta.maxAttempts} · Time:{" "}
                  <strong style={{ color: session && remainingSec <= 30 ? "#b91c1c" : "#0f172a" }}>
                    {session ? formatClock(remainingSec) : formatClock(meta.durationSec || 600)}
                  </strong>
                  {questionCount ? (
                    <>
                      {" "}
                      · Answered: <strong>{answeredCount}/{questionCount}</strong>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {session && !hasPassed ? (
                <button type="button" className="primary-btn" disabled={!canSubmit || submitting || remainingSec <= 0} onClick={handleSubmit}>
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              ) : null}
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  const active = Boolean(session?.expiresAtMs) && remainingSec > 0 && !hasPassed;
                  if (active) {
                    const ok = window.confirm("Your test timer is running. Are you sure you want to leave this page?");
                    if (!ok) return;
                  }
                  navigate(`/courses/${courseKey}`);
                }}
              >
                Back to course
              </button>
            </div>
          </div>

          {meta && meta.unlocked && questionCount ? (
            <div style={{ height: 6, borderRadius: 999, background: "rgba(148,163,184,0.25)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.round((answeredCount / Math.max(1, questionCount)) * 100)}%`,
                  background: answeredCount === questionCount ? "linear-gradient(90deg,#16a34a,#22c55e)" : "linear-gradient(90deg,#4f46e5,#7c3aed)",
                  transition: "width 220ms ease",
                }}
              />
            </div>
          ) : null}
        </div>

        {loading ? <div className="cd-empty-videos" style={{ marginTop: 14 }}>Loading…</div> : null}
        {error ? <div className="cd-empty-videos" style={{ marginTop: 14 }}>Unable to load: {error}</div> : null}

        {meta && !meta.unlocked ? (
          <div className="cd-empty-videos" style={{ marginTop: 14 }}>
            Final test is locked until all videos are completed.
            {meta.completion ? (
              <div style={{ marginTop: 8, color: "#64748b", fontWeight: 650 }}>
                Completed {meta.completion.completedCount}/{meta.completion.totalLessons}
              </div>
            ) : null}
          </div>
        ) : null}

        {meta?.alreadyPassed ? (
          <div className="checkout-card" style={{ marginTop: 14 }}>
            <h4 style={{ margin: 0, fontWeight: 900 }}>You passed. Certificate is ready.</h4>
            <p style={{ marginTop: 10, color: "#64748b", fontWeight: 650 }}>
              Certificate code: <strong>{meta.certificate?.certCode}</strong>
            </p>
            <a className="primary-btn" href={downloadHref}>
              Download certificate (PDF)
            </a>
          </div>
        ) : null}

        {meta?.unlocked && Array.isArray(meta?.questions) && meta.questions.length && !meta?.alreadyPassed && !result?.passed ? (
          <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
            {!session ? (
              <div className="checkout-card">
                <div style={{ fontWeight: 900, color: "#0f172a" }}>Ready to start?</div>
                <div style={{ marginTop: 8, color: "#64748b", fontWeight: 650 }}>
                  You have <strong>{formatClock(meta.durationSec || 600)}</strong> to answer <strong>{questionCount}</strong> questions. The timer starts when you click Start.
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                  <button type="button" className="primary-btn" onClick={startTest}>
                    Start Test
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setAnswers(new Array(questionCount).fill(null));
                      try {
                        sessionStorage.removeItem(storageKey);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Clear answers
                  </button>
                </div>
              </div>
            ) : null}
            {meta.questions.map((q, idx) => {
              const selected = answers[idx];
              return (
                <div key={q.id} className="checkout-card">
                  <div style={{ fontWeight: 900, color: "#0f172a" }}>
                    {idx + 1}. {q.question}
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {q.options.map((opt, oi) => (
                      <label key={oi} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={selected === oi}
                          disabled={!session || submitting || Boolean(result?.passed)}
                          onChange={() => {
                            setAnswers((prev) => {
                              const next = prev.slice();
                              next[idx] = oi;
                              return next;
                            });
                          }}
                        />
                        <span style={{ color: "#334155", fontWeight: 650 }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {result ? (
              <div className="checkout-card">
                {result.ok === false ? (
                  <div style={{ color: "#b91c1c", fontWeight: 850 }}>{result.message}</div>
                ) : result.passed ? (
                  <div style={{ color: "#166534", fontWeight: 900 }}>
                    Passed ({result.percentage}%).
                    <div style={{ marginTop: 10 }}>
                      <a className="primary-btn" href={downloadHref}>
                        Download certificate (PDF)
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#0f172a", fontWeight: 850 }}>
                    Not passed ({result.percentage}%). Please try again.
                    {Number.isFinite(result.attemptsUsed) ? (
                      <div style={{ marginTop: 8, color: "#64748b", fontWeight: 650 }}>
                        Attempts used: {result.attemptsUsed}/{result.maxAttempts}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}


import React, { useEffect, useRef, useState } from "react";
import { apiUrl } from "../utils/apiBase";
import { createPortal } from "react-dom";

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingId, setReplyingId] = useState("");
  const [replyResult, setReplyResult] = useState(null);
  const [leadUpdatingId, setLeadUpdatingId] = useState("");
  const [orderVerifyId, setOrderVerifyId] = useState("");
  const [orderNotPaidId, setOrderNotPaidId] = useState("");
  const [orderVerifyMsg, setOrderVerifyMsg] = useState(null);
  const [verifyModalMsg, setVerifyModalMsg] = useState(null);
  const [verifyModalOrder, setVerifyModalOrder] = useState(null);
  const [verifyPaymentRef, setVerifyPaymentRef] = useState("");
  const [verifyStatementAck, setVerifyStatementAck] = useState(false);
  const verifyRefInput = useRef(null);

  async function readApiError(res) {
    try {
      const text = await res.text();
      if (!text) return `HTTP ${res.status}`;
      try {
        const json = JSON.parse(text);
        const msg = json?.error || json?.message;
        return msg ? `${msg} (HTTP ${res.status})` : `${text} (HTTP ${res.status})`;
      } catch {
        return `${text} (HTTP ${res.status})`;
      }
    } catch {
      return `HTTP ${res.status}`;
    }
  }

  const closeVerifyModal = () => {
    if (orderVerifyId || orderNotPaidId) return;
    setVerifyModalOrder(null);
    setVerifyPaymentRef("");
    setVerifyStatementAck(false);
    setVerifyModalMsg(null);
  };

  useEffect(() => {
    if (!verifyModalOrder) return;
    const t = window.setTimeout(() => verifyRefInput.current?.focus?.(), 60);
    return () => window.clearTimeout(t);
  }, [verifyModalOrder]);

  useEffect(() => {
    if (!verifyModalOrder) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeVerifyModal();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [verifyModalOrder, orderVerifyId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [oRes, iRes, lRes] = await Promise.all([
          fetch(apiUrl("/admin/orders"), { credentials: "include" }),
          fetch(apiUrl("/admin/issues"), { credentials: "include" }),
          fetch(apiUrl("/admin/leads/callbacks"), { credentials: "include" }),
        ]);

        const oData = await oRes.json().catch(() => ({}));
        const iData = await iRes.json().catch(() => ({}));
        const lData = await lRes.json().catch(() => ({}));

        if (!oRes.ok) throw new Error(oData.error || "Failed to load orders.");
        if (!iRes.ok) throw new Error(iData.error || "Failed to load issues.");
        if (!lRes.ok) throw new Error(lData.error || "Failed to load leads.");

        if (!alive) return;
        setOrders(Array.isArray(oData.orders) ? oData.orders : []);
        setIssues(Array.isArray(iData.issues) ? iData.issues : []);
        setLeads(Array.isArray(lData.leads) ? lData.leads : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Admin failed.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const refreshIssues = async () => {
    const iRes = await fetch(apiUrl("/admin/issues"), { credentials: "include" });
    const iData = await iRes.json().catch(() => ({}));
    if (!iRes.ok) throw new Error(iData.error || "Failed to load issues.");
    setIssues(Array.isArray(iData.issues) ? iData.issues : []);
  };

  const refreshLeads = async () => {
    const lRes = await fetch(apiUrl("/admin/leads/callbacks"), { credentials: "include" });
    const lData = await lRes.json().catch(() => ({}));
    if (!lRes.ok) throw new Error(lData.error || "Failed to load leads.");
    setLeads(Array.isArray(lData.leads) ? lData.leads : []);
  };

  const refreshOrders = async () => {
    const oRes = await fetch(apiUrl("/admin/orders"), { credentials: "include" });
    const oData = await oRes.json().catch(() => ({}));
    if (!oRes.ok) throw new Error(oData.error || "Failed to load orders.");
    setOrders(Array.isArray(oData.orders) ? oData.orders : []);
  };

  return (
    <section className="section-page">
      <div className="container">
        <div className="page-head theme-section-head">
          <span>Admin</span>
          <h1>Admin Panel</h1>
          <p>Manage orders and issue reports.</p>
        </div>

        {loading ? <p>Loading...</p> : null}
        {error ? <p className="ui-alert ui-alert--danger" style={{ marginBottom: 16 }}>{error}</p> : null}

        {!loading && !error ? (
          <>
            <h2 style={{ marginTop: 18 }}>Orders</h2>
            <p style={{ marginTop: 6, color: "#475569", fontWeight: 650, maxWidth: 720 }}>
              UPI checkouts stay <strong>pending</strong> until you match the payment in your bank/UPI statement.{" "}
              <strong>Verify payment</strong> is a <strong>manual staff action</strong>: it does not read the bank — you must
              enter the reference you matched, then confirm. That marks the order paid, unlocks courses, and sends the
              enrollment email.
            </p>
            {orderVerifyMsg ? (
              <p
                style={{
                  marginTop: 10,
                  color: orderVerifyMsg.ok ? "#065f46" : "#b91c1c",
                  fontWeight: 800,
                }}
              >
                {orderVerifyMsg.text}
              </p>
            ) : null}
            {orders.length === 0 ? <p>No orders.</p> : null}
            {orders.map((o) => (
              <div key={o.orderId} className="checkout-card" style={{ marginTop: 12 }}>
                <div className="ui-meta-row">
                  <strong>Order {o.orderId}</strong>
                  <span className="ui-meta-sub">
                    {new Date(o.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ marginTop: 6, color: "#334155", fontWeight: 700 }}>
                  Learner: {o.user?.email || o.userId || "—"}
                  {o.user?.name ? ` · ${o.user.name}` : ""}
                </div>
                <div style={{ marginTop: 8, color: "#0f172a", fontWeight: 850 }}>
                  ₹{Number(o.amountPaid || 0).toLocaleString("en-IN")} · {o.paymentMethod}
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span
                    className={`ui-pill ${
                      o.paymentStatus === "paid"
                        ? "ui-pill--paid"
                        : o.paymentStatus === "not_paid"
                          ? "ui-pill--notPaid"
                          : "ui-pill--pending"
                    }`}
                  >
                    {o.paymentStatus === "paid"
                      ? "Paid / enrolled"
                      : o.paymentStatus === "not_paid"
                        ? "Not paid"
                        : "Pending UPI verification"}
                  </span>
                </div>
                <div style={{ marginTop: 4, color: "#0f766e", fontWeight: 800 }}>
                  Discount: {Number(o.discountPct || 0)}%
                </div>
                {o.paymentStatus === "paid" && o.verifiedAt ? (
                  <div style={{ marginTop: 10, fontSize: "0.88rem", color: "#475569", fontWeight: 650 }}>
                    Verified {new Date(o.verifiedAt).toLocaleString("en-IN")}
                    {o.verifiedByEmail ? ` · by ${o.verifiedByEmail}` : ""}
                    {o.paymentReference ? ` · ref: ${o.paymentReference}` : ""}
                  </div>
                ) : null}
                {o.paymentStatus !== "paid" ? (
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="primary-btn small-btn"
                      disabled={orderVerifyId === o.orderId}
                      onClick={() => {
                        setVerifyModalOrder(o);
                        setVerifyPaymentRef("");
                        setVerifyStatementAck(false);
                        setOrderVerifyMsg(null);
                        setVerifyModalMsg(null);
                      }}
                    >
                      Verify payment…
                    </button>
                  </div>
                ) : null}
              </div>
            ))}

            <h2 style={{ marginTop: 28 }}>Issue Reports</h2>
            {issues.length === 0 ? <p>No issues.</p> : null}
            {issues.map((i) => (
              <div key={i.id} className="checkout-card" style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{i.courseName}</strong>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    {new Date(i.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ marginTop: 8, color: "#64748b", fontWeight: 750 }}>
                  Course key: {i.courseKey} · Status: {i.status}
                </div>
                <div style={{ marginTop: 8, color: "#0f172a", fontWeight: 650 }}>
                  Order ID: {i.orderId || "N/A"}
                </div>
                <div style={{ marginTop: 10, whiteSpace: "pre-wrap", color: "#334155", fontWeight: 600 }}>
                  {i.message}
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontWeight: 900, marginBottom: 6 }}>
                    Reply to user (email)
                  </label>
                  <textarea
                    value={replyDrafts[i.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [i.id]: e.target.value }))
                    }
                    placeholder="Write a helpful reply…"
                    style={{
                      width: "100%",
                      minHeight: 90,
                      borderRadius: 14,
                      border: "1px solid rgba(15, 23, 42, 0.12)",
                      padding: 12,
                      fontWeight: 650,
                      color: "#0f172a",
                      background: "#fff",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="primary-btn small-btn"
                      disabled={replyingId === i.id || (replyDrafts[i.id] || "").trim().length < 2}
                      onClick={async () => {
                        setReplyingId(i.id);
                        setReplyResult(null);
                        try {
                          const res = await fetch(apiUrl(`/admin/issues/${i.id}/reply`), {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              reply: replyDrafts[i.id] || "",
                              status: "resolved",
                            }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok || !data.ok) throw new Error(data.error || "Reply failed.");
                          setReplyResult({ ok: true, id: i.id });
                          await refreshIssues();
                        } catch (e) {
                          setReplyResult({ ok: false, id: i.id, error: e?.message || "Reply failed." });
                        } finally {
                          setReplyingId("");
                        }
                      }}
                    >
                      {replyingId === i.id ? "Sending..." : "Send reply & resolve"}
                    </button>
                    <button
                      type="button"
                      className="secondary-btn small-btn"
                      onClick={() => setReplyDrafts((prev) => ({ ...prev, [i.id]: "" }))}
                      disabled={replyingId === i.id}
                    >
                      Clear
                    </button>
                  </div>
                  {replyResult && replyResult.id === i.id ? (
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: replyResult.ok ? "#065f46" : "#b91c1c",
                        fontWeight: 850,
                      }}
                    >
                      {replyResult.ok ? "Reply sent." : replyResult.error}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}

            <h2 style={{ marginTop: 28 }}>Callback Requests</h2>
            {leads.length === 0 ? <p>No callback requests.</p> : null}
            {leads.map((l) => (
              <div key={l.id} className="checkout-card" style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{l.name}</strong>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    {new Date(l.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ marginTop: 8, color: "#0f172a", fontWeight: 850 }}>
                  Mobile: {l.mobile} · Status: {l.status}
                </div>
                <div style={{ marginTop: 6, color: "#64748b", fontWeight: 750 }}>
                  Course: {l.courseKey || "N/A"}
                </div>
                {l.message ? (
                  <div style={{ marginTop: 10, whiteSpace: "pre-wrap", color: "#334155", fontWeight: 600 }}>
                    {l.message}
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                  {["new", "contacted", "closed"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={l.status === s ? "primary-btn small-btn" : "secondary-btn small-btn"}
                      disabled={leadUpdatingId === l.id}
                      onClick={async () => {
                        setLeadUpdatingId(l.id);
                        try {
                          const res = await fetch(apiUrl(`/admin/leads/callbacks/${l.id}/status`), {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: s }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok || !data.ok) throw new Error(data.error || "Update failed.");
                          await refreshLeads();
                        } catch {
                          // ignore
                        } finally {
                          setLeadUpdatingId("");
                        }
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {verifyModalOrder
              ? (() => {
                  const portalTarget = typeof document !== "undefined" ? document.body : null;
                  if (!portalTarget) return null;
                  return createPortal(
                    <div
                      className="course-modal-overlay"
                      role="presentation"
                      onClick={closeVerifyModal}
                    >
                      <div
                        className="course-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h2 className="upi-modal-heading" style={{ marginTop: 0 }}>
                          Confirm manual payment verification
                        </h2>
                        <p className="upi-course-line" style={{ marginBottom: 12 }}>
                          This will mark the order <strong>paid</strong>, unlock courses for the learner, and send the{" "}
                          <strong>enrollment email</strong>. The app does not contact the bank — you are confirming what you
                          saw in your statement.
                        </p>
                        <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, background: "rgba(234,88,12,0.08)" }}>
                          <div style={{ fontWeight: 900 }}>Order {verifyModalOrder.orderId}</div>
                          <div style={{ marginTop: 6, fontWeight: 750 }}>
                            ₹{Number(verifyModalOrder.amountPaid || 0).toLocaleString("en-IN")} · {verifyModalOrder.paymentMethod}
                          </div>
                          <div style={{ marginTop: 6, color: "#334155", fontWeight: 650 }}>
                            Learner: {verifyModalOrder.user?.email || verifyModalOrder.userId || "—"}
                          </div>
                        </div>

                        <label style={{ display: "block", fontWeight: 850, marginBottom: 6 }}>
                          UPI / bank reference you matched (UTR, ref no., or note — min 6 characters)
                        </label>
                        <input
                          ref={verifyRefInput}
                          value={verifyPaymentRef}
                          onChange={(e) => setVerifyPaymentRef(e.target.value)}
                          placeholder="e.g. UTR or statement line you matched"
                          style={{
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.12)",
                            marginBottom: 12,
                          }}
                        />

                        <label
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            cursor: "pointer",
                            fontWeight: 650,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={verifyStatementAck}
                            onChange={(e) => setVerifyStatementAck(e.target.checked)}
                            style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
                          />
                          <span>
                            I matched this <strong>exact amount</strong> for this <strong>order ID</strong> in our bank/UPI statement.
                            I understand clicking confirm will enroll the learner and email them.
                          </span>
                        </label>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                          <button
                            type="button"
                            className="secondary-btn small-btn"
                            disabled={Boolean(orderVerifyId) || Boolean(orderNotPaidId)}
                            onClick={() => {
                              closeVerifyModal();
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="secondary-btn small-btn"
                            disabled={Boolean(orderVerifyId) || Boolean(orderNotPaidId)}
                            onClick={async () => {
                              const oid = verifyModalOrder.orderId;
                              setOrderNotPaidId(oid);
                              setOrderVerifyMsg(null);
                              setVerifyModalMsg(null);
                              try {
                                const res = await fetch(
                                  apiUrl(`/admin/orders/${encodeURIComponent(oid)}/mark-not-paid`),
                                  {
                                    method: "POST",
                                    credentials: "include",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({}),
                                  }
                                );
                                const data = await res.json().catch(() => null);
                                if (!res.ok || !data?.ok) {
                                  throw new Error((data && data.error) ? data.error : await readApiError(res));
                                }
                                await refreshOrders();
                                const msg = `${oid} marked as not paid.`;
                                setOrderVerifyMsg({ ok: true, text: msg });
                                setVerifyModalMsg({ ok: true, text: msg });
                                setVerifyModalOrder(null);
                                setVerifyPaymentRef("");
                                setVerifyStatementAck(false);
                              } catch (e) {
                                const msg = e?.message || "Update failed.";
                                setOrderVerifyMsg({ ok: false, text: msg });
                                setVerifyModalMsg({ ok: false, text: msg });
                              } finally {
                                setOrderNotPaidId("");
                              }
                            }}
                            style={{ borderColor: "rgba(239, 68, 68, 0.35)", color: "#b91c1c" }}
                          >
                            {orderNotPaidId === verifyModalOrder.orderId ? "Marking…" : "Mark as not paid"}
                          </button>
                          <button
                            type="button"
                            className="primary-btn small-btn"
                            disabled={
                              orderVerifyId === verifyModalOrder.orderId ||
                              verifyPaymentRef.trim().length < 6 ||
                              !verifyStatementAck
                            }
                            onClick={async () => {
                              const oid = verifyModalOrder.orderId;
                              setOrderVerifyId(oid);
                              setOrderVerifyMsg(null);
                              setVerifyModalMsg(null);
                              try {
                                const res = await fetch(
                                  apiUrl(`/admin/orders/${encodeURIComponent(oid)}/verify-payment`),
                                  {
                                    method: "POST",
                                    credentials: "include",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      paymentReference: verifyPaymentRef.trim(),
                                      matchedInStatement: verifyStatementAck,
                                    }),
                                  }
                                );
                                const data = await res.json().catch(() => ({}));
                                if (!res.ok || !data.ok) throw new Error(data.error || "Verify failed.");
                                await refreshOrders();
                                const msg = data.alreadyVerified
                                  ? `${oid} was already verified.`
                                  : data.email === "sent"
                                    ? `${oid} verified. Enrollment email sent to ${data.emailedTo || "learner"}.`
                                    : `${oid} verified. Email not sent: ${data.emailReason || "unknown"}.`;
                                setOrderVerifyMsg({ ok: true, text: msg });
                                setVerifyModalMsg({ ok: true, text: msg });
                                setVerifyModalOrder(null);
                                setVerifyPaymentRef("");
                                setVerifyStatementAck(false);
                              } catch (e) {
                                const msg = e?.message || "Verify failed.";
                                setOrderVerifyMsg({ ok: false, text: msg });
                                setVerifyModalMsg({ ok: false, text: msg });
                              } finally {
                                setOrderVerifyId("");
                              }
                            }}
                          >
                            {orderVerifyId === verifyModalOrder.orderId
                              ? "Verifying…"
                              : "Confirm — send enrollment email"}
                          </button>
                        </div>

                        {verifyModalMsg ? (
                          <div
                            role="status"
                            aria-live="polite"
                            style={{
                              marginTop: 12,
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: `1px solid ${
                                verifyModalMsg.ok ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"
                              }`,
                              background: verifyModalMsg.ok ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                              color: verifyModalMsg.ok ? "#065f46" : "#b91c1c",
                              fontWeight: 800,
                            }}
                          >
                            {verifyModalMsg.text}
                          </div>
                        ) : null}
                      </div>
                    </div>,
                    portalTarget
                  );
                })()
              : null}
          </>
        ) : null}
      </div>
    </section>
  );
}


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCreditCard, FaUniversity, FaWallet, FaQrcode, FaTimes } from "react-icons/fa";
import { getCurrentUser } from "../utils/authStore";
import { apiUrl } from "../utils/apiBase";
import { useCart } from "../context/CartContext";
import CheckoutUpiPanel from "../components/CheckoutUpiPanel";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [method, setMethod] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [alsoBought, setAlsoBought] = useState([]);
  const [courseOrderStatus, setCourseOrderStatus] = useState({ pending: new Set(), notPaid: new Set() });
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: "", mobile: "", message: "" });
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackResult, setCallbackResult] = useState(null);
  /** UPI: explicit learner confirmation — static QR cannot be verified by the server (use Razorpay etc. for that). */
  const [upiPaymentConfirmed, setUpiPaymentConfirmed] = useState(false);
  const completingRef = useRef(false);
  const enrollmentDoneRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (alive) setUser(u);
      } catch {
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate, location.pathname]);

  const summaryLines = useMemo(() => {
    const lines = items.map((x) => {
      const price = Number(x.course?.price || 0);
      const qty = Number(x.qty || 1);
      const lineTotal = price * qty;
      return {
        key: x.course?.slug || x.course?.name || String(Math.random()),
        name: x.course?.name || "Course",
        qty,
        price,
        lineTotal,
      };
    });
    const computedTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    return { lines, computedTotal };
  }, [items]);

  useEffect(() => {
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
        const keys = (items || []).map((x) => String(x.course?.slug || "").toLowerCase()).filter(Boolean);
        if (keys.length === 0) {
          if (alive) setCourseOrderStatus({ pending: new Set(), notPaid: new Set() });
          return;
        }
        const res = await fetch(apiUrl("/orders"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;

        const pending = new Set();
        const notPaid = new Set();
        const orders = Array.isArray(data.orders) ? data.orders : [];
        for (const o of orders) {
          const status = String(o?.paymentStatus || "");
          if (!Array.isArray(o?.items)) continue;
          for (const it of o.items) {
            const ck = normalizeCourseKeyFromItem(it);
            if (!ck || !keys.includes(ck)) continue;
            if (status === "pending_manual") pending.add(ck);
            if (status === "not_paid") notPaid.add(ck);
          }
        }
        if (!alive) return;
        setCourseOrderStatus({ pending, notPaid });
      } catch {
        if (!alive) return;
        setCourseOrderStatus({ pending: new Set(), notPaid: new Set() });
      }
    })();

    return () => {
      alive = false;
    };
  }, [items]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const keys = (items || []).map((x) => String(x.course?.slug || "").toLowerCase()).filter(Boolean);
        if (keys.length === 0) return;
        const res = await fetch(apiUrl("/recommendations/also-bought"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseKeys: keys.slice(0, 4) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        const flat = [];
        for (const k of keys) {
          const list = Array.isArray(data.recs?.[k]) ? data.recs[k] : [];
          for (const r of list) flat.push(r);
        }
        const seen = new Set(keys);
        const uniq = [];
        for (const r of flat.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))) {
          const ck = String(r.courseKey || "").toLowerCase();
          if (!ck || seen.has(ck)) continue;
          seen.add(ck);
          uniq.push(ck);
          if (uniq.length >= 6) break;
        }
        if (!alive) return;
        setAlsoBought(uniq);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [items]);

  const pricing = useMemo(() => {
    const finalTotal = Number(total || summaryLines.computedTotal || 0);
    const discountOptions = [0.15, 0.25, 0.35, 0.45];
    const seedString = summaryLines.lines
      .map((l) => `${l.name}#${l.qty}#${l.price}`)
      .join("|");
    let hash = 0;
    for (let i = 0; i < seedString.length; i += 1) {
      hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
    }
    const discountRate =
      discountOptions.length > 0 ? discountOptions[hash % discountOptions.length] : 0.15;
    const originalPrice = Math.max(finalTotal, Math.round(finalTotal / (1 - discountRate)));
    const discountAmount = Math.max(0, originalPrice - finalTotal);
    return { finalTotal, discountRate, originalPrice, discountAmount };
  }, [summaryLines.computedTotal, total]);

  const paymentLabel = useMemo(() => {
    if (method === "upi") return "UPI (QR / UPI app)";
    if (method === "card") return "Cards";
    if (method === "net") return "Net Banking";
    return "Wallets";
  }, [method]);

  const handleComplete = useCallback(async () => {
    if (enrollmentDoneRef.current || !items || items.length === 0 || completingRef.current) return;
    if (method === "upi" && !upiPaymentConfirmed) return;
    completingRef.current = true;
    setPlacing(true);
    setPlaced(null);
    try {
      const res = await fetch(apiUrl("/orders/complete"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod: paymentLabel,
          amountPaid: pricing.finalTotal,
          discountPct: Math.round(pricing.discountRate * 100),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Order failed");
      enrollmentDoneRef.current = true;
      clear({ persistToServer: false }); // server clears cart already
      const pendingManual = data.paymentStatus === "pending_manual";
      setPlaced({
        ok: true,
        orderId: data.orderId,
        paymentStatus: data.paymentStatus,
        email: data.email,
        emailReason: data.emailReason,
        emailedTo: data.emailedTo,
      });
      window.setTimeout(() => navigate(pendingManual ? "/orders" : "/courses"), pendingManual ? 6000 : 4500);
    } catch (e) {
      const msg = String(e?.message || "");
      const net =
        e instanceof TypeError ||
        e?.name === "TypeError" ||
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("networkerror") ||
        msg.toLowerCase().includes("network error") ||
        msg.toLowerCase().includes("connection");
      setPlaced({
        ok: false,
        error: net
          ? "Cannot reach the API (network error). Start the server on port 5002, use npm run dev or npm run preview from the client folder, or set VITE_API_BASE in client/.env and rebuild."
          : e?.message || "Order failed",
      });
    } finally {
      completingRef.current = false;
      setPlacing(false);
    }
  }, [items, paymentLabel, pricing.finalTotal, pricing.discountRate, clear, navigate, method, upiPaymentConfirmed]);

  useEffect(() => {
    enrollmentDoneRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    setUpiPaymentConfirmed(false);
  }, [method, items]);

  if (!user) return null;

  const upiConfirmBlocked = method === "upi" && !upiPaymentConfirmed;
  const hasPendingForCart = courseOrderStatus.pending.size > 0;

  return (
    <section className="section-page checkout-page">
      <div className="container checkout-container">
        <div className="checkout-grid">
          <div className="checkout-head">
            <h1 className="checkout-title">Checkout</h1>
            <p className="checkout-subtitle">Account details ({user.email})</p>
          </div>

          <div className="checkout-left">
            <div className="checkout-card">
              <h2 className="checkout-card__title">Billing address & payment method</h2>

              <div className="pay-methods" role="radiogroup" aria-label="Payment method">
                <label className={`pay-method ${method === "upi" ? "active" : ""}`}>
                  <input type="radio" name="pay-method" checked={method === "upi"} onChange={() => setMethod("upi")} />
                  <FaQrcode aria-hidden />
                  <span>UPI (QR / UPI app)</span>
                </label>
                <label className={`pay-method ${method === "card" ? "active" : ""}`}>
                  <input type="radio" name="pay-method" checked={method === "card"} onChange={() => setMethod("card")} />
                  <FaCreditCard aria-hidden />
                  <span>Cards (coming soon)</span>
                </label>
                <label className={`pay-method ${method === "net" ? "active" : ""}`}>
                  <input type="radio" name="pay-method" checked={method === "net"} onChange={() => setMethod("net")} />
                  <FaUniversity aria-hidden />
                  <span>Net Banking (coming soon)</span>
                </label>
                <label className={`pay-method ${method === "wallet" ? "active" : ""}`}>
                  <input type="radio" name="pay-method" checked={method === "wallet"} onChange={() => setMethod("wallet")} />
                  <FaWallet aria-hidden />
                  <span>Wallets (coming soon)</span>
                </label>
              </div>

              {method === "upi" ? (
                <>
                  {hasPendingForCart ? (
                    <div className="ui-alert ui-alert--warn" role="status" aria-live="polite">
                      You already have a payment request pending for this course. Please check{" "}
                      <Link to="/orders" className="ui-inline-link" style={{ color: "inherit" }}>
                        Order History
                      </Link>{" "}
                      instead of submitting again.
                    </div>
                  ) : null}
                  {courseOrderStatus.notPaid.size > 0 ? (
                    <div className="ui-alert ui-alert--warn" role="status" aria-live="polite" style={{ color: "#b45309" }}>
                      This course was previously marked <strong>Not paid</strong>. If you actually paid, contact support
                      with your UTR/reference. Otherwise, you may submit a new payment request below.
                    </div>
                  ) : null}
                  <p
                    className="upi-payment-truth-hint"
                    style={{
                      margin: "0 0 12px",
                      padding: "12px 14px",
                      fontSize: "0.88rem",
                      color: "#334155",
                      lineHeight: 1.55,
                      background: "rgba(234, 88, 12, 0.08)",
                      border: "1px solid rgba(234, 88, 12, 0.25)",
                      borderRadius: 12,
                    }}
                  >
                    <strong>Important:</strong> This page cannot see your bank or UPI app. Submitting sends a <strong>payment request</strong> only.
                    Staff verify UPI receipts before you get course access or the enrollment email. For instant auto-confirm, use a payment gateway (e.g. Razorpay).
                  </p>
                  <CheckoutUpiPanel items={items} />
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginTop: 14,
                      cursor: "pointer",
                      fontSize: "0.92rem",
                      color: "#0f172a",
                      fontWeight: 650,
                      lineHeight: 1.45,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={upiPaymentConfirmed}
                      onChange={(e) => setUpiPaymentConfirmed(e.target.checked)}
                      style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
                    />
                    <span>
                      I understand I am <strong>not</strong> enrolled until staff verify the UPI payment (₹
                      {Number(pricing.finalTotal || 0).toLocaleString("en-IN")}) in their statement. This button only submits my
                      request — it does not prove payment.
                    </span>
                  </label>
                </>
              ) : (
                <div className="pay-placeholder">
                  This payment option will be enabled in the next update. Please use UPI for now.
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="primary-btn full-btn"
                  disabled={placing || items.length === 0 || method !== "upi" || upiConfirmBlocked || hasPendingForCart}
                  onClick={handleComplete}
                  title={
                    method !== "upi"
                      ? "Select UPI to check out"
                      : upiConfirmBlocked
                        ? "Confirm the acknowledgement checkbox first"
                        : hasPendingForCart
                          ? "You already have a pending payment request for this course"
                        : undefined
                  }
                >
                  {placing ? "Submitting..." : "Submit payment request"}
                </button>
                {method !== "upi" ? (
                  <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Choose <strong>UPI</strong> above — other methods are not enabled yet.
                  </p>
                ) : null}
                {method === "upi" && upiConfirmBlocked ? (
                  <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Tick the acknowledgement above to enable this button.
                  </p>
                ) : null}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                  <a
                    className="secondary-btn small-btn"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      "Hi! I need help with course enrollment / payment. Bharat Skill Development Academy."
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp chat
                  </a>
                  <button
                    type="button"
                    className="secondary-btn small-btn"
                    onClick={() => {
                      setCallbackOpen(true);
                      setCallbackResult(null);
                    }}
                  >
                    Request callback
                  </button>
                </div>
                {placed && !placed.ok ? (
                  <p style={{ margin: "10px 0 0", color: "#b91c1c", fontWeight: 700 }}>
                    {placed.error}
                  </p>
                ) : null}
                {placed && placed.ok ? (
                  <div style={{ margin: "12px 0 0", padding: 12, borderRadius: 12, background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)" }}>
                    <p style={{ margin: 0, color: "#0f172a", fontWeight: 800 }}>
                      {placed.paymentStatus === "pending_manual"
                        ? `Order ${placed.orderId} received — payment pending verification`
                        : `Order ${placed.orderId} confirmed.`}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#334155", fontWeight: 650, fontSize: "0.95rem" }}>
                      {placed.paymentStatus === "pending_manual" ? (
                        <>
                          We have <strong>not</strong> sent an enrollment email yet. After staff confirm your UPI payment in the bank statement, they will verify the order and you will get the confirmation email and course access.
                        </>
                      ) : placed.email === "sent" ? (
                        <>
                          Confirmation email sent to <strong>{placed.emailedTo || "your account email"}</strong>. Check inbox and spam.
                        </>
                      ) : (
                        <>
                          Email was <strong>not sent</strong>
                          {placed.emailReason ? ` (${placed.emailReason})` : ""}. If you already paid, contact support. Otherwise use My Courses after verification.
                        </>
                      )}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                      {placed.paymentStatus === "pending_manual"
                        ? "Redirecting to your order history…"
                        : "Redirecting to courses in a few seconds…"}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="checkout-right">
            <div className="order-summary">
              <h2 className="order-summary__title">Order summary</h2>
              <div className="order-summary__line">
                <span>
                  {items.length} course{items.length === 1 ? "" : "s"}
                </span>
                <strong>₹{Number(summaryLines.computedTotal || 0).toLocaleString("en-IN")}</strong>
              </div>

              <div className="order-summary__breakdown" aria-label="Price breakdown">
                <div className="order-summary__row">
                  <span>Original Price:</span>
                  <strong>₹{pricing.originalPrice.toLocaleString("en-IN")}</strong>
                </div>
                <div className="order-summary__row order-summary__row--discount">
                  <span>Discounts ({Math.round(pricing.discountRate * 100)}% Off):</span>
                  <strong>-₹{pricing.discountAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="order-summary__items" aria-label="Order items">
                {summaryLines.lines.map((l) => (
                  <div className="order-item" key={l.key}>
                    <div className="order-item__name">
                      {l.name}
                      {l.qty > 1 ? <span className="order-item__qty"> × {l.qty}</span> : null}
                    </div>
                    <div className="order-item__price">₹{Number(l.lineTotal || 0).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>

              <div className="order-summary__total">
                <span>Total</span>
                <strong>₹{pricing.finalTotal.toLocaleString("en-IN")}</strong>
              </div>

              <Link to="/cart" className="order-summary__link">
                Back to cart
              </Link>
            </div>

            {alsoBought.length > 0 ? (
              <div className="order-summary" style={{ marginTop: 14 }}>
                <h2 className="order-summary__title">People also bought</h2>
                <div className="order-summary__items" aria-label="Recommended courses">
                  {alsoBought.map((k) => (
                    <div className="order-item" key={k}>
                      <div className="order-item__name" style={{ fontWeight: 850 }}>
                        <Link to={`/courses/${k}`} className="order-summary__link" style={{ display: "inline-block" }}>
                          View {k.replace(/-/g, " ")}
                        </Link>
                      </div>
                      <div className="order-item__price" style={{ color: "#64748b" }}>
                        Suggested
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      {callbackOpen ? (
        <div className="course-modal-overlay" role="presentation" onClick={() => setCallbackOpen(false)}>
          <div className="course-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setCallbackOpen(false)} aria-label="Close">
              <FaTimes />
            </button>
            <h2 className="upi-modal-heading">Request a callback</h2>
            <p className="upi-course-line">We will contact you to help with enrollment.</p>

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
                    const courseKey = items?.[0]?.course?.slug || null;
                    const res = await fetch(apiUrl("/leads/callback"), {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...callbackForm, courseKey }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data.ok) throw new Error(data.error || "Request failed.");
                    setCallbackResult({ ok: true });
                    setCallbackForm({ name: "", mobile: "", message: "" });
                  } catch (e) {
                    const msg = String(e?.message || "");
                    const net =
                      e instanceof TypeError ||
                      e?.name === "TypeError" ||
                      msg.toLowerCase().includes("failed to fetch") ||
                      msg.toLowerCase().includes("networkerror") ||
                      msg.toLowerCase().includes("network error") ||
                      msg.toLowerCase().includes("connection");
                    setCallbackResult({
                      ok: false,
                      error: net
                        ? "Cannot reach the API. Start the backend on port 5002 and reload the page."
                        : e?.message || "Request failed.",
                    });
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
        </div>
      ) : null}
    </section>
  );
}


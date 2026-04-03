import React, { useEffect, useState } from "react";
import { apiUrl } from "../utils/apiBase";
import { Link, useNavigate } from "react-router-dom";

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/orders"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            navigate(`/login?next=${encodeURIComponent("/orders")}`);
            return;
          }
          throw new Error(data.error || "Failed to load orders.");
        }
        if (!alive) return;
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load orders.");
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
          <span>Account</span>
          <h1>Order History</h1>
          <p>Find your order IDs and course access details.</p>
        </div>

        {loading ? <p>Loading...</p> : null}
        {error ? <p className="ui-alert ui-alert--danger" style={{ marginBottom: 16 }}>{error}</p> : null}

        {!loading && orders.length === 0 ? (
          <div className="cart-empty">
            <p>No orders found.</p>
            <Link to="/courses" className="primary-btn">
              Browse courses
            </Link>
          </div>
        ) : null}

        {orders.map((o) => (
          <div key={o.orderId} className="checkout-card" style={{ marginTop: 16 }}>
            <h2 className="checkout-card__title" style={{ marginBottom: 10 }}>
              Order {o.orderId}
            </h2>
            <div className="ui-meta-row" style={{ marginBottom: 10 }}>
              <div className="ui-meta-sub">
                {new Date(o.createdAt).toLocaleString("en-IN")} · {o.paymentMethod}
              </div>
              <div className="ui-amount-strong">₹{Number(o.amountPaid || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
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
                  ? "Paid — you have course access"
                  : o.paymentStatus === "not_paid"
                    ? "Not paid"
                    : "Payment verification pending"}
              </span>
            </div>
            {o.paymentStatus === "pending_manual" ? (
              <p className="ui-muted" style={{ margin: "0 0 10px", fontWeight: 650, fontSize: "0.92rem", lineHeight: 1.5 }}>
                We will confirm your UPI payment shortly. You will receive the enrollment email once the order is marked paid.
              </p>
            ) : null}
            {o.paymentStatus === "not_paid" ? (
              <p className="ui-muted" style={{ margin: "0 0 10px", fontWeight: 650, fontSize: "0.92rem", lineHeight: 1.5 }}>
                Marked as not paid by staff. If you actually paid, contact support with your UTR/reference.
              </p>
            ) : null}
            <div style={{ color: "#0f766e", fontWeight: 800 }}>
              Discount: {Number(o.discountPct || 0)}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


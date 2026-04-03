import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, remove, total } = useCart();
  const navigate = useNavigate();

  return (
    <section className="section-page cart-page">
      <div className="container cart-container">
        <div className="cart-head">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{items.length} course{items.length === 1 ? "" : "s"} in cart</p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/courses" className="primary-btn">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              {items.map(({ course }) => (
                <div className="cart-item" key={course.slug || course.name}>
                  <div className="cart-item__meta">
                    <strong className="cart-item__name">{course.name}</strong>
                    <span className="cart-item__sub">{course.category} · {course.level} · {course.duration}</span>
                  </div>
                  <div className="cart-item__actions">
                    <span className="cart-item__price">₹{Number(course.price || 0).toLocaleString("en-IN")}</span>
                    <button className="cart-item__remove" type="button" onClick={() => remove(course)} aria-label="Remove from cart">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <div className="cart-summary__box">
                <h2 className="cart-summary__title">Total</h2>
                <div className="cart-summary__total">₹{Number(total || 0).toLocaleString("en-IN")}</div>
                <button className="primary-btn full-btn" type="button" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout →
                </button>
                <Link to="/courses" className="cart-summary__link">
                  Continue browsing
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}


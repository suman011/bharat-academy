import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaHeart, FaShoppingCart, FaTimes } from "react-icons/fa";
import { getCurrentUser, logout, onAuthChanged } from "../utils/authStore";
import { apiUrl } from "../utils/apiBase";
import { useCart } from "../context/CartContext";

const BRAND_LOGO_SRC = "/bharat-logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const { items, clear } = useCart();

  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const u = await getCurrentUser();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      }
    }

    refresh();
    const off = onAuthChanged(() => refresh());
    return () => {
      alive = false;
      off();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadMeta() {
      if (!user) {
        setHasEnrollments(false);
        setHasOrders(false);
        setIsAdmin(false);
        setNotifCount(0);
        return;
      }
      try {
        const [eRes, oRes, aRes] = await Promise.all([
          fetch(apiUrl("/enrollments"), { credentials: "include" }),
          fetch(apiUrl("/orders"), { credentials: "include" }),
          fetch(apiUrl("/auth/is-admin"), { credentials: "include" }),
        ]);

        const eData = await eRes.json().catch(() => ({}));
        const oData = await oRes.json().catch(() => ({}));
        const aData = await aRes.json().catch(() => ({}));
        const wRes = await fetch(apiUrl("/wishlist"), { credentials: "include" });
        const wData = await wRes.json().catch(() => ({}));
        const nRes = await fetch(apiUrl("/notifications/summary"), { credentials: "include" });
        const nData = await nRes.json().catch(() => ({}));

        if (!alive) return;
        setHasEnrollments(Boolean(eData?.enrollments?.length));
        setHasOrders(Boolean(oData?.orders?.length));
        setIsAdmin(Boolean(aData?.isAdmin));
        setWishlistCount(Array.isArray(wData?.items) ? wData.items.length : 0);
        setNotifCount(Number(nData?.unreadCount || 0) || 0);
      } catch {
        if (!alive) return;
        setHasEnrollments(false);
        setHasOrders(false);
        setIsAdmin(false);
        setWishlistCount(0);
        setNotifCount(0);
      }
    }

    loadMeta();
    return () => {
      alive = false;
    };
  }, [user]);

  const closeMenu = () => setOpen(false);

  async function handleLogout() {
    // Do NOT clear server cart on logout.
    // Cart UI will reset automatically when auth becomes logged out.
    try {
      await logout();
    } catch {
      // ignore
    }
    setUser(null);
    navigate("/");
    closeMenu();
  }

  return (
    <>
      <header className="site-header">
        <div className="container custom-nav">
        <Link className="brand brand--RasterLogo" to="/" onClick={closeMenu}>
          <span className="brand-logo-wrap">
            <img
              className="brand-logo-img"
              src={BRAND_LOGO_SRC}
              height={52}
              width={52}
              alt="Bharat Skill Development Academy"
              decoding="async"
            />
          </span>
          <div className="brand-text-block">
            <div className="brand-title-single">
              <span className="brand-name-accent">Bharat</span>{" "}
              <span className="brand-name-rest">Skill Development Academy</span>
            </div>
            <p className="brand-subtitle">Empowering careers with industry-ready skills</p>
          </div>
        </Link>

        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="toggle menu">
          {open ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-links ${open ? "show" : ""}`}>
          <NavLink to="/" onClick={closeMenu} end>
            Home
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/courses" onClick={closeMenu}>
            Courses
          </NavLink>
          <NavLink
            to="/notifications"
            onClick={closeMenu}
            className="nav-cart-link nav-icon-only"
            title="Updates"
            aria-label={`Updates, ${notifCount} unread`}
          >
            <FaBell aria-hidden />
            <span className="nav-cart-badge">{notifCount}</span>
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/wishlist"
                onClick={closeMenu}
                className="nav-cart-link nav-icon-only"
                title="Wishlist"
                aria-label={`Wishlist, ${wishlistCount} saved`}
              >
                <FaHeart aria-hidden />
                <span className="nav-cart-badge">{wishlistCount}</span>
              </NavLink>
              <NavLink
                to="/cart"
                onClick={closeMenu}
                className="nav-cart-link nav-icon-only"
                title="Cart"
                aria-label={`Shopping cart, ${items.length} items`}
              >
                <FaShoppingCart aria-hidden />
                <span className="nav-cart-badge">{items.length}</span>
              </NavLink>
            </>
          ) : null}
          {user ? (
            <>
              {hasEnrollments ? (
                <NavLink to="/enrollments" onClick={closeMenu}>My Courses</NavLink>
              ) : null}
              {hasOrders ? (
                <NavLink to="/orders" onClick={closeMenu}>Orders</NavLink>
              ) : null}
              {isAdmin ? (
                <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>
              ) : null}
            </>
          ) : null}
          {user ? (
            <button className="nav-cta" type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/signup" onClick={closeMenu}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
        </div>
      </header>
    </>
  );
}

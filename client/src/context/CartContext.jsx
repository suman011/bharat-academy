import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, onAuthChanged } from "../utils/authStore";
import { apiUrl } from "../utils/apiBase";

const CartContext = createContext(null);

function toKey(course) {
  return String(course?.slug || course?.name || "").trim().toLowerCase();
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const loadFromServer = async () => {
    const res = await fetch(apiUrl("/cart"), { method: "GET", credentials: "include" });
    if (res.status === 401) return { ok: false, unauthorized: true, items: [] };
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load cart.");
    const loaded = Array.isArray(data.items)
      ? data.items.map((r) => ({ course: r.course, qty: r.qty || 1 }))
      : [];
    return { ok: true, items: loaded };
  };

  const saveToServer = async (nextItems) => {
    const res = await fetch(apiUrl("/cart"), {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: nextItems.map((x) => ({
          courseKey: toKey(x.course),
          course: x.course,
          qty: x.qty || 1,
        })),
      }),
    });
    if (res.status === 401) return { ok: false, unauthorized: true };
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save cart.");
    return { ok: true };
  };

  useEffect(() => {
    let alive = true;

    const syncWithAuth = async () => {
      try {
        await getCurrentUser(); // throws if not logged in
        if (!alive) return;

        const result = await loadFromServer();
        if (!alive) return;
        if (result.ok) setItems(result.items);
      } catch {
        if (!alive) return;
        // Logged out => clear in-memory cart.
        setItems([]);
      }
    };

    syncWithAuth();
    const off = onAuthChanged(() => syncWithAuth());
    return () => {
      alive = false;
      off();
    };
  }, []);

  const api = useMemo(() => {
    function add(course) {
      const key = toKey(course);
      if (!key) return;
      setItems((prev) => {
        const exists = prev.some((x) => toKey(x.course) === key);
        if (exists) return prev;
        const next = [...prev, { course, qty: 1 }];
        saveToServer(next)
          .then(() => loadFromServer())
          .then((r) => {
            if (r && r.ok) setItems(r.items);
          })
          .catch((err) => console.warn("[cart] save failed", err));
        return next;
      });
    }

    function remove(courseOrKey) {
      const key = typeof courseOrKey === "string" ? courseOrKey : toKey(courseOrKey);
      if (!key) return;
      setItems((prev) => {
        const next = prev.filter((x) => toKey(x.course) !== key);
        saveToServer(next)
          .then(() => loadFromServer())
          .then((r) => {
            if (r && r.ok) setItems(r.items);
          })
          .catch((err) => console.warn("[cart] save failed", err));
        return next;
      });
    }

    function clear(options = { persistToServer: true }) {
      setItems((prev) => {
        const next = [];
        if (!options || options.persistToServer !== false) {
          saveToServer(next)
            .then(() => loadFromServer())
            .then((r) => {
              if (r && r.ok) setItems(r.items);
            })
            .catch((err) => console.warn("[cart] save failed", err));
        }
        return next;
      });
    }

    const total = items.reduce((sum, x) => sum + Number(x.course?.price || 0) * (x.qty || 1), 0);

    return { items, add, remove, clear, total };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


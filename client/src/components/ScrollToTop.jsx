import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls window to top on navigation (SPA default keeps previous scroll).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

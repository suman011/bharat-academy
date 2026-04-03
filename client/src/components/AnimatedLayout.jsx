import React from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function AnimatedLayout() {
  const { pathname } = useLocation();

  return (
    <div className="page-transition" key={pathname}>
      <Outlet />
    </div>
  );
}

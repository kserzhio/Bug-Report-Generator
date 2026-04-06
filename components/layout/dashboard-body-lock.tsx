"use client";

import { useEffect } from "react";

export function DashboardBodyLock() {
  useEffect(() => {
    document.documentElement.classList.add("dashboard-lock-scroll");
    document.body.classList.add("dashboard-lock-scroll");

    return () => {
      document.documentElement.classList.remove("dashboard-lock-scroll");
      document.body.classList.remove("dashboard-lock-scroll");
    };
  }, []);

  return null;
}

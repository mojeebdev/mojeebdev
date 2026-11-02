"use client";

import { useEffect } from "react";
import { isLagosNight } from "@/lib/lagos";

/** Day or night for the whole site: ?time= wins, then the visitor's choice, then the Lagos clock. */
export function applyTimeOfDay() {
  let pick: string | null = null;
  try { pick = localStorage.getItem("theme"); } catch {}
  const forced = new URLSearchParams(location.search).get("time");
  const theme = forced === "day" || forced === "night" ? forced
    : pick === "day" || pick === "light" ? "day"
      : pick === "night" || pick === "dark" ? "night"
        : isLagosNight() ? "night" : "day";
  if (document.documentElement.getAttribute("data-theme") !== theme) document.documentElement.setAttribute("data-theme", theme);
}

/** Keeps the theme on Lagos time while the page stays open: at 6am the Den wakes up, at 6pm night falls. */
export default function TimeOfDay() {
  useEffect(() => {
    applyTimeOfDay();
    const t = window.setInterval(applyTimeOfDay, 60_000);
    return () => window.clearInterval(t);
  }, []);
  return null;
}

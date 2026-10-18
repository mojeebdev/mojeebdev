"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const order: Mode[] = ["system", "light", "dark"];
const labels: Record<Mode, string> = { system: "Auto", light: "Light", dark: "Dark" };

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Mode | null;
      if (saved && order.includes(saved)) setMode(saved);
    } catch {}
  }, []);

  const cycle = () => {
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <button type="button" className="theme-toggle" onClick={cycle} aria-label={`Colour theme: ${labels[mode]}. Change theme`}>
      <span className="theme-toggle__dot" data-mode={mode} aria-hidden="true" />
      <span>{labels[mode]}</span>
    </button>
  );
}

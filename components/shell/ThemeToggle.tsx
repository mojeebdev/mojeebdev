"use client";

import { useStorageValue, writeStorage } from "@/lib/useExternal";

type Mode = "system" | "light" | "dark";
const order: Mode[] = ["system", "light", "dark"];
const labels: Record<Mode, string> = { system: "Auto", light: "Light", dark: "Dark" };

export default function ThemeToggle() {
  const saved = useStorageValue("theme", "local", "system") as Mode;
  const mode: Mode = order.includes(saved) ? saved : "system";

  const cycle = () => {
    const next = order[(order.indexOf(mode) + 1) % order.length];
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    writeStorage("theme", next);
  };

  return (
    <button type="button" className="theme-toggle" onClick={cycle} aria-label={`Colour theme: ${labels[mode]}. Change theme`}>
      <span className="theme-toggle__dot" data-mode={mode} aria-hidden="true" />
      <span>{labels[mode]}</span>
    </button>
  );
}

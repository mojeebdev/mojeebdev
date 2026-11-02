"use client";

import { applyTimeOfDay } from "@/components/shell/TimeOfDay";
import { useStorageValue, writeStorage } from "@/lib/useExternal";

/** "Lagos time" (default) follows the clock in Lagos: day 6am–6pm, night otherwise. Day and Night pin one. */
type Mode = "auto" | "day" | "night";
const order: Mode[] = ["auto", "day", "night"];
const labels: Record<Mode, string> = { auto: "Lagos time", day: "Day", night: "Night" };
const normalise = (v: string): Mode => (v === "day" || v === "light" ? "day" : v === "night" || v === "dark" ? "night" : "auto");

export default function ThemeToggle() {
  const mode = normalise(useStorageValue("theme", "local", "auto"));

  const cycle = () => {
    const next = order[(order.indexOf(mode) + 1) % order.length];
    writeStorage("theme", next);
    applyTimeOfDay();
  };

  return (
    <button type="button" className="theme-toggle" onClick={cycle} aria-label={`Theme: ${labels[mode]}. Switch to ${labels[order[(order.indexOf(mode) + 1) % order.length]]}`}>
      <span className="theme-toggle__dot" data-mode={mode} aria-hidden="true" />
      <span>{labels[mode]}</span>
    </button>
  );
}

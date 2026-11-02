"use client";

import { useSyncExternalStore } from "react";
import { isLagosNight } from "./lagos";

/** Subscribe to browser-only values (storage, media queries, DOM classes) without setState-in-effect. */
export function useStorageValue(key: string, store: "local" | "session" = "local", fallback = "") {
  return useSyncExternalStore(
    (cb) => {
      const on = (e: Event) => { if (!(e instanceof StorageEvent) || e.key === key) cb(); };
      window.addEventListener("storage", on);
      window.addEventListener("mojeeb:storage", on);
      return () => { window.removeEventListener("storage", on); window.removeEventListener("mojeeb:storage", on); };
    },
    () => { try { return (store === "local" ? localStorage : sessionStorage).getItem(key) ?? fallback; } catch { return fallback; } },
    () => fallback,
  );
}

export function writeStorage(key: string, value: string, store: "local" | "session" = "local") {
  try { (store === "local" ? localStorage : sessionStorage).setItem(key, value); } catch {}
  window.dispatchEvent(new Event("mojeeb:storage"));
}

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(query).matches,
    () => serverValue,
  );
}

export function useRootClass(name: string) {
  return useSyncExternalStore(
    (cb) => { const o = new MutationObserver(cb); o.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); return () => o.disconnect(); },
    () => document.documentElement.classList.contains(name),
    () => false,
  );
}

/**
 * True at night in Lagos (8pm–6am). `?time=night` or `?time=day` overrides it, for demos and testing.
 * Re-checks every minute; the server snapshot is "day" so server HTML never depends on the clock.
 */
export function useLagosNight() {
  return useSyncExternalStore(
    (cb) => { const t = window.setInterval(cb, 60_000); return () => window.clearInterval(t); },
    () => {
      const o = new URLSearchParams(location.search).get("time");
      if (o === "night") return true;
      if (o === "day") return false;
      return isLagosNight();
    },
    () => false,
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { lagosTimeLabel } from "./lagos";

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
 * True when the site is in its night theme: 6pm–6am in Lagos by default, or whatever the visitor or ?time= chose.
 * The boot script and TimeOfDay set data-theme on <html>; this follows it. The server snapshot is "day".
 */
export function useLagosNight() {
  return useSyncExternalStore(
    (cb) => { const o = new MutationObserver(cb); o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); return () => o.disconnect(); },
    () => document.documentElement.getAttribute("data-theme") === "night",
    () => false,
  );
}

/** The time in Lagos, e.g. "7:42pm". Empty on the server so markup never depends on the clock. */
export function useLagosTime() {
  return useSyncExternalStore(
    (cb) => { const t = window.setInterval(cb, 30_000); return () => window.clearInterval(t); },
    () => lagosTimeLabel(),
    () => "",
  );
}

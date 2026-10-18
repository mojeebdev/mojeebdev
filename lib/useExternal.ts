"use client";

import { useSyncExternalStore } from "react";

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

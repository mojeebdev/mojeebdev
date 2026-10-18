"use client";

import { useEffect, useState } from "react";
import { useMediaQuery, useStorageValue, writeStorage } from "@/lib/useExternal";

/** Paw-print transition into the lab: a short trail crosses the top of the page once per session. */
export default function PawTrail() {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const seen = useStorageValue("lab:paws", "session", "");
  const [done, setDone] = useState(false);
  const show = !reduce && seen === "" && !done;
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => { setDone(true); writeStorage("lab:paws", "1", "session"); }, 2400);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div className="paw-trail" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <svg key={i} viewBox="0 0 40 40" style={{ animationDelay: `${i * 170}ms`, left: `${8 + i * 13}%`, top: i % 2 ? 26 : 6 }}>
          <ellipse cx="20" cy="25" rx="9" ry="7.5" /><circle cx="9" cy="14" r="4" /><circle cx="16" cy="8" r="4" /><circle cx="24" cy="8" r="4" /><circle cx="31" cy="14" r="4" />
        </svg>
      ))}
    </div>
  );
}

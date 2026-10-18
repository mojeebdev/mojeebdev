"use client";

import { useEffect, useState } from "react";

/** Paw-print transition into the lab: a short trail crosses the top of the page once per session. */
export default function PawTrail() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try { if (sessionStorage.getItem("lab:paws")) return; sessionStorage.setItem("lab:paws", "1"); } catch {}
    setShow(true);
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, []);
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

"use client";

import { useEffect, useRef, useState } from "react";
import { LeopardPeek, LeopardRest } from "@/components/mascot/Leopard";
import { lagosHour, lagosTimeLabel } from "@/lib/lagos";
import { openerFor } from "@/lib/leopard/lines";
import type { LeopardLine } from "@/lib/leopard/types";
import { useLagosNight, useRootClass } from "@/lib/useExternal";
import LeopardChat from "./LeopardChat";
import "./leopard.css";

/**
 * The homepage guide. Once the intro has closed, the leopard peeks in from the corner and says something true and
 * current: where you came from, what Mojeeb shipped this week, live Arcapush and npm figures. Visitors can ask it
 * questions. At night in Lagos it's asleep until you poke it.
 */
export default function LeopardGuide({ lines }: { lines: LeopardLine[] }) {
  const introOpen = useRootClass("den-pending");
  const night = useLagosNight();
  const [open, setOpen] = useState(false);
  const [opener, setOpener] = useState<string | null>(null);
  const [teaser, setTeaser] = useState(false);
  const greeted = useRef(false);
  const bubble = useRef<HTMLDivElement>(null);

  const makeOpener = () => {
    const now = new Date();
    return openerFor(document.referrer, location.host, lagosHour(now), lagosTimeLabel(now));
  };

  // Say hello once, shortly after the intro closes (or straight away when there was no intro). Not at night: it's asleep.
  useEffect(() => {
    if (introOpen || greeted.current || night) return;
    greeted.current = true;
    const t = window.setTimeout(() => {
      try { if (sessionStorage.getItem("leopard:closed")) return; } catch {}
      // On small screens a full bubble would cover the page: a small teaser invites a tap instead.
      if (!matchMedia("(min-width: 720px)").matches) { setTeaser(true); return; }
      setOpener(makeOpener());
      setOpen(true);
    }, 900);
    return () => window.clearTimeout(t);
  }, [introOpen, night]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    try { sessionStorage.setItem("leopard:closed", "1"); } catch {}
  }

  const toggle = () => {
    if (open) { close(); return; }
    setTeaser(false);
    setOpener((o) => o ?? makeOpener());
    setOpen(true);
    window.setTimeout(() => bubble.current?.querySelector<HTMLElement>("button, input")?.focus({ preventScroll: true }), 50);
  };

  const sleeping = night && !open;

  return (
    <aside className="lguide" data-open={open || undefined} aria-label="The leopard">
      {open && (
        <div ref={bubble} className="lguide__bubble" role="dialog" aria-label="The leopard says">
          <button type="button" className="lguide__close" onClick={close} aria-label="Close the leopard">×</button>
          <LeopardChat lines={lines} opener={opener} />
        </div>
      )}
      {teaser && !open && <span className="lguide__teaser" aria-hidden="true">Psst. Tap me.</span>}
      <button type="button" className={`lguide__cat${sleeping ? " is-asleep" : ""}`} onClick={toggle} aria-expanded={open}
        aria-label={open ? "Close the leopard" : sleeping ? "Poke the sleeping leopard" : "Talk to the leopard"}>
        {sleeping ? <LeopardRest size={84} /> : <LeopardPeek size={78} expression={open ? "happy" : "curious"} />}
      </button>
    </aside>
  );
}

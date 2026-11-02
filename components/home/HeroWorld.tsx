"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Leopard, { LeopardRest } from "@/components/mascot/Leopard";
import { denStations } from "@/components/den/denStations";
import type { DenWorldController } from "@/components/den/denWorldScene";
import type { PublicEntry } from "@/lib/guestbook/schema";
import type { Pulse } from "@/lib/leopard/types";
import { useLagosNight, useLagosTime, useRootClass } from "@/lib/useExternal";

/**
 * A live window into the Den in the homepage hero: the same Three.js island as /den, built from the same live data
 * (wall tiles, commit sparks, Arcapush beacon, guestbook lanterns), swaying slowly, in day or night with Lagos.
 * It starts only after the intro closes and pauses off screen. The whole window links to /den.
 */
export default function HeroWorld({ pulse }: { pulse: Pulse }) {
  const wrap = useRef<HTMLAnchorElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cat = useRef<HTMLDivElement>(null);
  const controller = useRef<DenWorldController | null>(null);
  const [state, setState] = useState<"idle" | "ready" | "fallback">("idle");
  const introOpen = useRootClass("den-pending");
  const night = useLagosNight();
  const time = useLagosTime();

  useEffect(() => {
    if (introOpen) return;
    const el = canvas.current;
    if (!el || controller.current) return;
    let cancelled = false;
    const start = () => {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) { setState("fallback"); return; }
      import("@/components/den/denWorldScene").then(({ createDenWorld }) => {
        if (cancelled || !el.isConnected) return;
        const world = createDenWorld(el, {
          onSelect: () => {},
          onProject: (points) => {
            const root = wrap.current;
            if (!root) return;
            for (const m of Array.from(root.querySelectorAll<HTMLElement>("[data-anchor]"))) {
              const p = points[m.dataset.anchor ?? ""];
              if (!p) continue;
              m.style.left = `${p.x}px`; m.style.top = `${p.y}px`; m.style.visibility = p.visible ? "visible" : "hidden";
            }
            const c = cat.current, p = points.leopard;
            if (c && p) { c.style.left = `${p.x}px`; c.style.top = `${p.y}px`; c.style.visibility = p.visible ? "visible" : "hidden"; }
          },
        }, {
          builds: pulse.projects,
          sparks: pulse.github.week,
          beacon: pulse.arcapush.visits ? Math.min(1, Math.log10(1 + pulse.arcapush.visits) / 5) : 0.25,
        }, { preview: true });
        controller.current = world;
        world.setNight(document.documentElement.getAttribute("data-theme") === "night");
        setState("ready");
        fetch("/api/guestbook?limit=30", { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => { if (!cancelled && d.active && Array.isArray(d.entries)) world.setLanterns((d.entries as PublicEntry[]).map((e) => e.id)); })
          .catch(() => {});
      }).catch(() => { if (!cancelled) setState("fallback"); });
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const handle = idle ? idle(start, { timeout: 900 }) : window.setTimeout(start, 300);
    return () => { cancelled = true; if (!idle) clearTimeout(handle); };
  }, [introOpen, pulse]);

  useEffect(() => () => { controller.current?.dispose(); controller.current = null; }, []);
  useEffect(() => { controller.current?.setNight(night); }, [night, state]);

  // Pause rendering while the hero is off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => controller.current?.setPaused(!e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, [state]);

  return (
    <Link ref={wrap} href="/den" className={`hero-world${state === "ready" ? " is-ready" : ""}`} aria-label="Enter the Leopard's Den, an interactive 3D workshop built from live data">
      <canvas ref={canvas} className="hero-world__gl" aria-hidden="true" />
      <span className="hero-world__top" aria-hidden="true">
        <span>The workshop · live</span>
        {time && <span>Lagos {time} · {night ? "night" : "day"}</span>}
      </span>
      {denStations.map((s) => (
        <span key={s.id} data-anchor={s.id} className="hero-world__anchor" aria-hidden="true"><b>{s.number}</b>{s.title}</span>
      ))}
      <div ref={cat} className="hero-world__cat" aria-hidden="true">
        {night ? <LeopardRest size={150} /> : <Leopard pose="look" expression="curious" size="100%" />}
      </div>
      {state === "fallback" && (
        <span className="hero-world__fallback" aria-hidden="true"><Leopard pose="sit" expression="happy" size={120} /></span>
      )}
      <span className="hero-world__cta">Enter the Den <span aria-hidden="true">→</span></span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Leopard from "@/components/mascot/Leopard";
import { denStations, type DenStationId } from "./denStations";
import type { DenWorldController } from "./denWorldScene";
import "./den-experience.css";

const BURST = 8;
const TOUR: DenStationId[] = ["beacon", "workbench", "research", "builds", "guestbook", "contact"];

export default function DenExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leopardRef = useRef<HTMLDivElement>(null);
  const controller = useRef<DenWorldController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pawRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  // The leopard greets every visit, the same way it does on the homepage: say hi, reach, high five, then the world opens.
  const [phase, setPhase] = useState<"greet" | "reach" | "five" | "entering" | "explore">("greet");
  const [active, setActive] = useState<DenStationId | null>(null);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "fallback">("loading");
  const [tour, setTour] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    import("./denWorldScene").then(({ createDenWorld }) => {
      if (cancelled) return;
      const instance = createDenWorld(canvas, {
        onSelect: (id) => setActive(id),
        onProject: (points) => {
          const stage = stageRef.current;
          if (!stage) return;
          for (const marker of Array.from(stage.querySelectorAll<HTMLElement>("[data-den-anchor]"))) {
            const key = marker.dataset.denAnchor;
            const p = key ? points[key] : undefined;
            if (!p) continue;
            marker.style.left = p.x + "px";
            marker.style.top = p.y + "px";
            marker.style.visibility = p.visible ? "visible" : "hidden";
          }
          const cat = leopardRef.current;
          const point = points.leopard;
          if (cat && point) {
            cat.style.left = point.x + "px";
            cat.style.top = point.y + "px";
            cat.style.visibility = point.visible ? "visible" : "hidden";
            cat.style.setProperty("--den-cat-zoom", String(Math.min(1.2, Math.max(0.7, point.scale))));
          }
        },
      });
      if (cancelled) { instance.dispose(); return; }
      controller.current = instance; setSceneState("ready");
    }).catch(() => { if (!cancelled) setSceneState("fallback"); });
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    controller.current?.focus(active);
    setCelebrate(true);
    const timeout = setTimeout(() => setCelebrate(false), 900);
    return () => clearTimeout(timeout);
  }, [active]);

  const later = (fn: () => void, ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };

  const highFive = useCallback(() => {
    if (phase !== "reach" && phase !== "greet") return;
    setPhase("five");
    later(() => { setPhase("entering"); later(() => setPhase("explore"), 700); }, 900);
  }, [phase]);

  const sayHi = useCallback(() => {
    if (phase === "greet") { setPhase("reach"); setTimeout(() => pawRef.current?.focus({ preventScroll: true }), 60); }
    else if (phase === "reach") highFive();
  }, [phase, highFive]);

  const skip = useCallback(() => { if (timer.current) clearTimeout(timer.current); setPhase("explore"); }, []);

  const inIntro = phase !== "explore";

  // While the leopard is greeting: Escape skips, Enter/Space act on the current step; the leopard's eyes follow the pointer.
  useEffect(() => {
    if (!inIntro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { skip(); return; }
      if ((e.key === "Enter" || e.key === " ") && !(e.target as HTMLElement).closest("button, a, input, textarea")) { e.preventDefault(); sayHi(); }
    };
    const onMove = (e: PointerEvent) => {
      const el = catRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--lx", Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2.2))).toFixed(3));
      el.style.setProperty("--ly", Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (innerHeight / 2.2))).toFixed(3));
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { document.removeEventListener("keydown", onKey); window.removeEventListener("pointermove", onMove); };
  }, [inIntro, skip, sayHi]);

  const reset = useCallback(() => {
    setTour(false); setActive(null); controller.current?.reset();
  }, []);

  const startTour = useCallback(() => {
    setTour(true);
    setActive(TOUR[0]);
    setPhase("explore");
  }, []);

  const nextTour = useCallback(() => {
    const index = TOUR.indexOf(active || TOUR[0]);
    if (index >= TOUR.length - 1) { reset(); return; }
    setActive(TOUR[index + 1]);
  }, [active, reset]);

  const replay = () => {
    reset(); setPhase("greet");
  };

  const current = denStations.find((s) => s.id === active) || null;
  const tourIndex = current ? TOUR.indexOf(current.id) : -1;

  return (
    <section className="denw" aria-label="The Leopard's Den interactive workshop">
      <header className="denw__header">
        <div><p className="denw__eyebrow">Mojeeb Titilayo · Creative engineering</p><h1>The Leopard&apos;s <em>Den.</em></h1></div>
        <div className="denw__header-actions">
          <button type="button" onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp} aria-controls="den-help">Controls</button>
          <Link href="/">Exit to portfolio <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <p className="denw__lede">A tiny world with a big imagination. Every corner leads to something I&apos;ve actually built.</p>
      <div className="denw__theatre" ref={stageRef}>
        <canvas className="denw__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="denw__vignette" aria-hidden="true" />
        {sceneState === "loading" && <p className="denw__loading" role="status">Preparing the workshop…</p>}
        {sceneState === "fallback" && (
          <div className="denw__fallback" role="status">
            <Leopard pose="sit" expression="happy" size={108} />
            <strong>The workshop is best explored with WebGL.</strong>
            <span>You can still visit every station below.</span>
          </div>
        )}
        <div ref={leopardRef} className={"denw__leopard " + (celebrate ? "is-happy" : "")} aria-hidden="true">
          <Leopard pose={celebrate ? "celebrate" : "look"} expression={celebrate ? "happy" : "curious"} size="100%" />
        </div>
        {denStations.map((station) => (
          <button key={station.id} type="button" data-den-anchor={station.id} className={"denw__anchor " + (active === station.id ? "is-active" : "")}
            onClick={() => setActive(station.id)} aria-label={"Focus " + station.title} tabIndex={phase === "explore" && sceneState === "ready" ? 0 : -1}>
            <span>{station.number}</span><strong>{station.title}</strong>
          </button>
        ))}
        {inIntro && (
          <div className={"denw__intro " + (phase === "entering" ? "is-entering" : "")} data-stage={phase}>
            <div className="denw__intro-copy">
              <span className="denw__eyebrow">A little world, made with curiosity.</span>
              <div className="denw__intro-stage">
                <button ref={catRef} type="button" className="denw__intro-cat" onClick={sayHi}
                  aria-label={phase === "greet" ? "Say hi to the leopard" : phase === "reach" ? "High-five the leopard and enter the Den" : "Entering the Den"}
                  aria-disabled={phase === "five" || phase === "entering" || undefined} tabIndex={phase === "reach" ? -1 : 0}>
                  <Leopard pose={phase === "greet" ? "look" : phase === "reach" ? "reach" : "celebrate"}
                    expression={phase === "greet" ? "curious" : phase === "reach" ? "playful" : "happy"} size="100%" />
                </button>
                {phase !== "greet" && (
                  <button ref={pawRef} type="button" className="denw__paw-hit" onClick={highFive}
                    aria-label="Tap the paw: high-five the leopard and enter the Den" aria-disabled={phase !== "reach" || undefined} />
                )}
                {(phase === "five" || phase === "entering") && (
                  <span className="denw__burst" aria-hidden="true">
                    {Array.from({ length: BURST }, (_, i) => (
                      <svg key={i} viewBox="0 0 40 40" style={{ ["--a" as string]: `${(360 / BURST) * i - 90}deg`, ["--d" as string]: `${i % 2 ? 78 : 104}px` }}>
                        {i % 2 ? <path d="M20 4 L24 16 L36 20 L24 24 L20 36 L16 24 L4 20 L16 16 Z" /> : <><ellipse cx="20" cy="25" rx="9" ry="7.5" /><circle cx="9" cy="14" r="4" /><circle cx="16" cy="8" r="4" /><circle cx="24" cy="8" r="4" /><circle cx="31" cy="14" r="4" /></>}
                      </svg>
                    ))}
                  </span>
                )}
              </div>
              <h2 aria-live="polite">{phase === "greet" ? "Say hi to the leopard." : phase === "reach" ? "High five? Tap the paw." : "Welcome to the Den."}</h2>
              <p>Explore the products, experiments and ideas inside my workshop.</p>
              <div className="denw__intro-actions">
                <button type="button" onClick={skip}>Skip intro</button>
              </div>
              <span className="denw__intro-help">Enter or Space works too · Esc skips.</span>
            </div>
          </div>
        )}
        {phase === "explore" && (
          <>
            <div className="denw__scene-top">
              <span>THE WORKSHOP / {current ? current.number : "OVERVIEW"}</span>
              {sceneState === "ready" && <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>}
            </div>
            <div className="denw__scene-controls" aria-label="Camera controls">
              <button type="button" onClick={() => controller.current?.zoom(1.2)} disabled={sceneState !== "ready"} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => controller.current?.zoom(1 / 1.2)} disabled={sceneState !== "ready"} aria-label="Zoom out">−</button>
              <button type="button" onClick={reset} aria-label="Reset camera">↺</button>
            </div>
            {!current && <div className="denw__overview-prompt">
              <h2>Welcome to my world.</h2>
              <p>Drag to look around. Tap anything that catches your eye.</p>
              <button type="button" onClick={startTour}>Take the short tour <span aria-hidden="true">↗</span></button>
            </div>}
            {current && (
              <aside className="denw__station-panel" aria-live="polite" aria-label="Selected station">
                <div className="denw__station-meta"><span>{current.number} / 06</span><button type="button" onClick={reset} aria-label="Close station">×</button></div>
                <p className="denw__eyebrow">{current.kicker}</p>
                <h2>{current.title}</h2>
                <p>{current.description}</p>
                <span className="denw__proof">{current.proof}</span>
                <Link href={current.href} className="denw__primary">{current.linkLabel} <span aria-hidden="true">↗</span></Link>
                {tour && <button type="button" className="denw__tour-next" onClick={nextTour}>{tourIndex === TOUR.length - 1 ? "End tour · Return to overview" : "Next stop · " + denStations.find((s) => s.id === TOUR[tourIndex + 1])?.title}</button>}
              </aside>
            )}
          </>
        )}
      </div>
      <div id="den-help" className="denw__help" hidden={!showHelp}>
        <strong>How to explore</strong>
        <p>Drag to rotate the workshop. Right-drag or two-finger drag to pan. Scroll or pinch to zoom. Click an object or choose a station below to focus. Use Reset to return to the overview. Everything is available through keyboard-operable links and buttons.</p>
      </div>
      <nav className="denw__directory" aria-label="Workshop stations" inert={phase !== "explore"}>
        <div className="denw__directory-intro">
          <span className="denw__eyebrow">Explore the workshop</span>
          <p>Select a station. The world will come to you.</p>
        </div>
        <div className="denw__directory-list">
          {denStations.map((station) => (
            <button type="button" key={station.id} onClick={() => { setPhase("explore"); setActive(station.id); }}
              aria-pressed={active === station.id} className={active === station.id ? "is-active" : ""}>
              <span>{station.number}</span><strong>{station.title}</strong><small>{station.kicker}</small>
            </button>
          ))}
        </div>
      </nav>
      <div className="denw__tail">
        <p>The leopard is just the guide. The work is real.</p>
        <div><button type="button" onClick={replay}>Meet the leopard again</button><Link href="/guestbook">Leave your mark ↗</Link><Link href="/contact">Build something together ↗</Link></div>
      </div>
    </section>
  );
}

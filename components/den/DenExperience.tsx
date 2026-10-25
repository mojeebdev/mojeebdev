"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Leopard from "@/components/mascot/Leopard";
import { denStations, type DenStationId } from "./denStations";
import type { DenWorldController } from "./denWorldScene";
import "./den-experience.css";

const FIRST_VISIT_KEY = "den:workshop:entered";
const TOUR: DenStationId[] = ["beacon", "workbench", "research", "builds", "guestbook", "contact"];

export default function DenExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leopardRef = useRef<HTMLDivElement>(null);
  const controller = useRef<DenWorldController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phase, setPhase] = useState<"intro" | "entering" | "explore">("intro");
  const [active, setActive] = useState<DenStationId | null>(null);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "fallback">("loading");
  const [tour, setTour] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(FIRST_VISIT_KEY)) setPhase("explore");
    } catch { /* Privacy settings may prohibit storage. */ }
  }, []);

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

  const enter = useCallback(() => {
    if (phase !== "intro") return;
    setPhase("entering");
    try { localStorage.setItem(FIRST_VISIT_KEY, "1"); } catch { /* Still works without storage. */ }
    timer.current = setTimeout(() => setPhase("explore"), 700);
  }, [phase]);

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
    reset(); setPhase("intro");
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
        {phase !== "explore" && (
          <div className={"denw__intro " + (phase === "entering" ? "is-entering" : "")}>
            <div className="denw__intro-copy">
              <span className="denw__eyebrow">A little world, made with curiosity.</span>
              <div className="denw__intro-cat"><Leopard pose={phase === "entering" ? "celebrate" : "reach"} expression="playful" size="100%" /></div>
              <h2>{phase === "entering" ? "Welcome to the Den." : "High five the leopard."}</h2>
              <p>Explore the products, experiments and ideas inside my workshop.</p>
              <div className="denw__intro-actions">
                <button type="button" onClick={enter} className="denw__primary" disabled={phase === "entering"}>High five & enter <span aria-hidden="true">✦</span></button>
                <button type="button" onClick={() => { try { localStorage.setItem(FIRST_VISIT_KEY, "1"); } catch {} setPhase("explore"); }}>Skip intro</button>
              </div>
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

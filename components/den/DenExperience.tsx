"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Leopard, { LeopardRest } from "@/components/mascot/Leopard";
import LeopardChat from "@/components/leopard/LeopardChat";
import type { PublicEntry } from "@/lib/guestbook/schema";
import { lagosHour, lagosTimeLabel } from "@/lib/lagos";
import { openerFor, pulseLines } from "@/lib/leopard/lines";
import type { Pulse } from "@/lib/leopard/types";
import { useLagosNight } from "@/lib/useExternal";
import { denStations, type DenStationId } from "./denStations";
import type { DenWorldController, DenWorldData } from "./denWorldScene";
import "./den-experience.css";

const BURST = 8;
const TOUR: DenStationId[] = ["beacon", "workbench", "research", "builds", "guestbook", "contact"];
type Phase = "greet" | "reach" | "five" | "entering" | "explore";

const count = (n: number) => new Intl.NumberFormat("en-GB").format(n);
const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

/** A live line for each station, from the same published figures the rest of the site shows. */
function stationNotes(p: Pulse, lanterns: number | null): Partial<Record<DenStationId, string>> {
  return {
    beacon: p.arcapush.indexed !== null ? `Live: Arcapush is indexing ${count(p.arcapush.indexed)} builds. The beacon glows brighter with platform traffic.` : undefined,
    workbench: p.github.week > 0 ? `Live: ${count(p.github.week)} public GitHub contributions in the last 7 days of the calendar, one spark each.` : undefined,
    builds: `Live: ${p.projects} tiles on the wall, one for every project in the archive.`,
    guestbook: lanterns ? `Live: ${lanterns} lantern${lanterns === 1 ? "" : "s"} overhead, one for every approved note.` : undefined,
  };
}

export default function DenExperience({ pulse }: { pulse: Pulse }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leopardRef = useRef<HTMLButtonElement>(null);
  const controller = useRef<DenWorldController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pawRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const entriesRef = useRef<PublicEntry[]>([]);
  const night = useLagosNight();
  // The leopard greets every visit, the same way it does on the homepage: say hi, reach, high five, then the world
  // opens. At night in Lagos it is asleep first, and a tap wakes it.
  const [phase, setPhase] = useState<Phase>("greet");
  const [woke, setWoke] = useState(false);
  const asleep = night && !woke && phase === "greet";
  const [active, setActive] = useState<DenStationId | null>(null);
  const [talking, setTalking] = useState(false);
  const [opener, setOpener] = useState<string | null>(null);
  const [lantern, setLantern] = useState<PublicEntry | null>(null);
  const [entries, setEntries] = useState<PublicEntry[] | null>(null);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "fallback">("loading");
  const [tour, setTour] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const lines = useMemo(() => pulseLines(pulse, { den: true }), [pulse]);
  const notes = stationNotes(pulse, entries?.length ?? null);

  const openStation = useCallback((id: DenStationId) => {
    setTalking(false); setLantern(null); setActive(id);
    controller.current?.focus(id);
    setCelebrate(true);
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    celebrateTimer.current = setTimeout(() => setCelebrate(false), 900);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const world: DenWorldData = {
      builds: pulse.projects,
      sparks: pulse.github.week,
      beacon: pulse.arcapush.visits ? Math.min(1, Math.log10(1 + pulse.arcapush.visits) / 5) : 0.25,
    };
    import("./denWorldScene").then(({ createDenWorld }) => {
      if (cancelled) return;
      const instance = createDenWorld(canvas, {
        onSelect: (id) => openStation(id),
        onLantern: (id) => {
          const entry = entriesRef.current.find((e) => e.id === id);
          if (entry) { setActive(null); setTalking(false); setLantern(entry); }
        },
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
      }, world);
      if (cancelled) { instance.dispose(); return; }
      controller.current = instance; setSceneState("ready");
    }).catch(() => { if (!cancelled) setSceneState("fallback"); });
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      controller.current?.dispose();
      controller.current = null;
    };
  }, [pulse, openStation]);

  // Guestbook notes become lanterns. Fetched in the browser so the page never depends on the database.
  useEffect(() => {
    let alive = true;
    fetch("/api/guestbook?limit=30", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (alive) { const list: PublicEntry[] = d.active && Array.isArray(d.entries) ? d.entries : []; entriesRef.current = list; setEntries(list); } })
      .catch(() => { if (alive) setEntries([]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (sceneState === "ready" && entries) controller.current?.setLanterns(entries.map((e) => e.id));
  }, [sceneState, entries]);

  useEffect(() => {
    if (sceneState === "ready") controller.current?.setNight(night);
  }, [sceneState, night]);

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
    if (asleep) { setWoke(true); return; }
    if (phase === "greet") { setPhase("reach"); setTimeout(() => pawRef.current?.focus({ preventScroll: true }), 60); }
    else if (phase === "reach") highFive();
  }, [asleep, phase, highFive]);

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
    setTour(false); setActive(null); setTalking(false); setLantern(null); controller.current?.reset();
  }, []);

  const talk = () => {
    const now = new Date();
    setOpener((o) => o ?? openerFor(document.referrer, location.host, lagosHour(now), lagosTimeLabel(now)));
    setActive(null); setLantern(null); setTour(false); setTalking(true);
    controller.current?.reset();
  };

  const startTour = useCallback(() => {
    setTour(true);
    setPhase("explore");
    openStation(TOUR[0]);
  }, [openStation]);

  const nextTour = useCallback(() => {
    const index = TOUR.indexOf(active || TOUR[0]);
    if (index >= TOUR.length - 1) { reset(); return; }
    openStation(TOUR[index + 1]);
  }, [active, reset, openStation]);

  const replay = () => { reset(); setWoke(false); setPhase("greet"); };

  const current = denStations.find((s) => s.id === active) || null;
  const tourIndex = current ? TOUR.indexOf(current.id) : -1;
  const lanternCount = entries?.length ?? 0;
  const introTitle = asleep ? "Shh. The leopard is asleep." : phase === "greet" ? "Say hi to the leopard." : phase === "reach" ? "High five? Tap the paw." : "Welcome to the Den.";
  const introText = asleep
    ? `It's ${lagosTimeLabel()} in Lagos. Tap the leopard to wake it up.`
    : phase === "five" || phase === "entering" ? lines[0]?.text ?? "Explore the products, experiments and ideas inside my workshop."
      : "Explore the products, experiments and ideas inside my workshop.";

  return (
    <section className={"denw" + (night ? " is-night" : "")} aria-label="The Leopard's Den interactive workshop">
      <header className="denw__header">
        <div><p className="denw__eyebrow">Mojeeb Titilayo · Creative engineering</p><h1>The Leopard&apos;s <em>Den.</em></h1></div>
        <div className="denw__header-actions">
          <button type="button" onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp} aria-controls="den-help">Controls</button>
          <Link href="/">Exit to portfolio <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <p className="denw__lede">A tiny world with a big imagination, built from live data. Every corner leads to something I&apos;ve actually built.</p>
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
        <button type="button" ref={leopardRef} className={"denw__leopard " + (celebrate || talking ? "is-happy" : "")} onClick={talk}
          aria-label="Talk to the leopard" tabIndex={phase === "explore" && sceneState === "ready" ? 0 : -1}>
          <Leopard pose={celebrate ? "celebrate" : talking ? "reach" : "look"} expression={celebrate || talking ? "happy" : "curious"} size="100%" />
          {phase === "explore" && !talking && !current && !lantern && (
            <span className="denw__speech" aria-hidden="true">{night ? "Still up? Ask me anything." : "Psst. Ask me anything."}</span>
          )}
        </button>
        {denStations.map((station) => (
          <button key={station.id} type="button" data-den-anchor={station.id} className={"denw__anchor " + (active === station.id ? "is-active" : "")}
            onClick={() => openStation(station.id)} aria-label={"Focus " + station.title} tabIndex={phase === "explore" && sceneState === "ready" ? 0 : -1}>
            <span>{station.number}</span><strong>{station.title}</strong>
          </button>
        ))}
        {inIntro && (
          <div className={"denw__intro " + (phase === "entering" ? "is-entering" : "")} data-stage={asleep ? "sleep" : phase}>
            <div className="denw__intro-copy">
              <span className="denw__eyebrow">A little world, made with curiosity.</span>
              <div className="denw__intro-stage">
                <button ref={catRef} type="button" className="denw__intro-cat" onClick={sayHi}
                  aria-label={asleep ? "Wake the sleeping leopard" : phase === "greet" ? "Say hi to the leopard" : phase === "reach" ? "High-five the leopard and enter the Den" : "Entering the Den"}
                  aria-disabled={phase === "five" || phase === "entering" || undefined} tabIndex={phase === "reach" ? -1 : 0}>
                  {asleep ? <LeopardRest size={260} /> : (
                    <Leopard pose={phase === "greet" ? "look" : phase === "reach" ? "reach" : "celebrate"}
                      expression={phase === "greet" ? "curious" : phase === "reach" ? "playful" : "happy"} size="100%" />
                  )}
                </button>
                {!asleep && phase !== "greet" && (
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
              <h2 aria-live="polite">{introTitle}</h2>
              <p>{introText}</p>
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
              <span>THE WORKSHOP / {current ? current.number : talking ? "THE LEOPARD" : lantern ? "A LANTERN" : "OVERVIEW"}</span>
              <span>LAGOS {lagosTimeLabel().toUpperCase()} · {night ? "NIGHT" : "DAY"}</span>
            </div>
            <div className="denw__scene-controls" aria-label="Camera controls">
              <button type="button" onClick={() => controller.current?.zoom(1.2)} disabled={sceneState !== "ready"} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => controller.current?.zoom(1 / 1.2)} disabled={sceneState !== "ready"} aria-label="Zoom out">−</button>
              <button type="button" onClick={reset} aria-label="Reset camera">↺</button>
            </div>
            {!current && !talking && !lantern && <div className="denw__overview-prompt">
              <h2>Welcome to my world.</h2>
              <p>Drag to look around. Tap anything that catches your eye, or ask the leopard. {lanternCount > 0
                ? `${lanternCount} lantern${lanternCount === 1 ? "" : "s"} float overhead, one for every guestbook note.`
                : entries ? "No lanterns yet: the first guestbook note lights one." : ""}</p>
              <div className="denw__overview-actions">
                <button type="button" onClick={startTour}>Take the short tour <span aria-hidden="true">↗</span></button>
                <Link href="/guestbook">Light a lantern <span aria-hidden="true">↗</span></Link>
              </div>
            </div>}
            {current && (
              <aside className="denw__station-panel" aria-live="polite" aria-label="Selected station">
                <div className="denw__station-meta"><span>{current.number} / 06</span><button type="button" onClick={reset} aria-label="Close station">×</button></div>
                <p className="denw__eyebrow">{current.kicker}</p>
                <h2>{current.title}</h2>
                <p>{current.description}</p>
                {notes[current.id] && <p className="denw__live">{notes[current.id]}</p>}
                <span className="denw__proof">{current.proof}</span>
                <Link href={current.href} className="denw__primary">{current.linkLabel} <span aria-hidden="true">↗</span></Link>
                {tour && <button type="button" className="denw__tour-next" onClick={nextTour}>{tourIndex === TOUR.length - 1 ? "End tour · Return to overview" : "Next stop · " + denStations.find((s) => s.id === TOUR[tourIndex + 1])?.title}</button>}
              </aside>
            )}
            {talking && (
              <aside className="denw__station-panel" aria-label="The leopard">
                <div className="denw__station-meta"><span>THE LEOPARD · LIVE</span><button type="button" onClick={reset} aria-label="Close">×</button></div>
                <LeopardChat lines={lines} opener={opener} tone="dark" />
              </aside>
            )}
            {lantern && (
              <aside className="denw__station-panel" aria-live="polite" aria-label="A guestbook lantern">
                <div className="denw__station-meta"><span>A LANTERN · {when(lantern.created_at).toUpperCase()}</span><button type="button" onClick={reset} aria-label="Close lantern">×</button></div>
                <p className="denw__eyebrow">Left by {lantern.name}</p>
                <p className="denw__note">{lantern.message}</p>
                {lantern.link && <a href={lantern.link} rel="ugc nofollow noopener noreferrer" target="_blank" className="denw__proof">{host(lantern.link)} ↗</a>}
                <Link href="/guestbook" className="denw__primary">Light your own lantern <span aria-hidden="true">↗</span></Link>
              </aside>
            )}
          </>
        )}
      </div>
      <div id="den-help" className="denw__help" hidden={!showHelp}>
        <strong>How to explore</strong>
        <p>Drag to rotate the workshop. Right-drag or two-finger drag to pan. Scroll or pinch to zoom. Click an object, a lantern or the leopard, or choose a station below. Use Reset to return to the overview. Everything is available through keyboard-operable links and buttons.</p>
        <p>The world is built from live data: one wall tile per project in the archive, one spark per public GitHub contribution this week, a beacon that glows with Arcapush traffic, and one lantern per approved guestbook note. After 8pm in Lagos it turns to night.</p>
      </div>
      <nav className="denw__directory" aria-label="Workshop stations" inert={phase !== "explore"}>
        <div className="denw__directory-intro">
          <span className="denw__eyebrow">Explore the workshop</span>
          <p>Select a station. The world will come to you.</p>
        </div>
        <div className="denw__directory-list">
          {denStations.map((station) => (
            <button type="button" key={station.id} onClick={() => { setPhase("explore"); openStation(station.id); }}
              aria-pressed={active === station.id} className={active === station.id ? "is-active" : ""}>
              <span>{station.number}</span><strong>{station.title}</strong><small>{station.kicker}</small>
            </button>
          ))}
          <button type="button" onClick={() => { setPhase("explore"); talk(); }} aria-pressed={talking} className={talking ? "is-active" : ""}>
            <span>✦</span><strong>Ask the leopard</strong><small>Live facts and questions</small>
          </button>
        </div>
      </nav>
      <div className="denw__tail">
        <p>The leopard is just the guide. The work is real.</p>
        <div><button type="button" onClick={replay}>Meet the leopard again</button><Link href="/guestbook">Leave your mark ↗</Link><Link href="/contact">Build something together ↗</Link></div>
      </div>
    </section>
  );
}

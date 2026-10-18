"use client";

/**
 * Enter the Den — the homepage introduction.
 * 1. The leopard walks into a near-empty canvas.  2. It notices the pointer/touch.
 * 3. The visitor is invited to interact.          4. First touch: a playful dodge, then a raised paw.
 * 5. Paw touch unlocks the homepage.              6. A circular reveal opens onto the profile.
 *
 * Shown only when the boot script in app/layout.tsx adds `den-pending` (first visit, motion allowed, or ?intro=1).
 * Always skippable (button or Escape). Three.js only adds depth (floor, soft shadow, dust, camera drift) and is
 * dynamically imported after first paint; without WebGL the CSS floor and shadow remain.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Leopard, { type LeopardExpression, type LeopardPose } from "@/components/mascot/Leopard";
import "./den.css";

type Stage = "enter" | "notice" | "dodge" | "reach" | "unlock" | "done";
const STORAGE_KEY = "den:v1";

export default function DenIntro() {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState<Stage>("enter");
  const [touch, setTouch] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLButtonElement>(null);
  const skipBtn = useRef<HTMLButtonElement>(null);
  const scene = useRef<{ setLook: (x: number, y: number) => void; setCatX: (x: number) => void; reveal: () => void; dispose: () => void } | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  // Boot: only run when the pre-paint script asked for the intro.
  useEffect(() => {
    (window as unknown as { __denReady?: boolean }).__denReady = true;
    const html = document.documentElement;
    if (!html.classList.contains("den-pending")) return;
    setActive(true);
    setTouch(matchMedia("(hover: none)").matches);
    // Hide everything else from assistive tech and keyboard while the den is open.
    const others = Array.from(document.querySelectorAll<HTMLElement>(".sidebar, .topbar, .site-footer, main > :not(.den)"));
    others.forEach((el) => el.setAttribute("inert", ""));
    later(() => setStage((s) => (s === "enter" ? "notice" : s)), 1500);
    return () => others.forEach((el) => el.removeAttribute("inert"));
  }, []);

  // Lazy Three.js environment after first paint.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const start = () => {
      const canvas = root.current?.querySelector<HTMLCanvasElement>(".den__gl");
      if (!canvas) return;
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
      import("./denScene").then(({ createDenScene }) => {
        if (cancelled || !canvas.isConnected) return;
        scene.current = createDenScene(canvas);
        root.current?.classList.add("has-gl");
      }).catch(() => {});
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const handle = idle ? idle(start, { timeout: 700 }) : window.setTimeout(start, 300);
    return () => { cancelled = true; if (!idle) clearTimeout(handle); };
  }, [active]);

  // Focus the skip control first (DESIGN.md §13), then the leopard once it has arrived.
  useEffect(() => { if (active) skipBtn.current?.focus({ preventScroll: true }); }, [active]);

  const finish = useCallback((instant = false) => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    const html = document.documentElement;
    const close = () => {
      html.classList.remove("den-pending");
      setActive(false);
      setStage("done");
      scene.current?.dispose();
      document.querySelectorAll<HTMLElement>("[inert]").forEach((el) => el.removeAttribute("inert"));
      document.getElementById("hero-name")?.setAttribute("tabindex", "-1");
      document.getElementById("hero-name")?.focus({ preventScroll: true });
      const url = new URL(location.href);
      if (url.searchParams.has("intro")) { url.searchParams.delete("intro"); history.replaceState(null, "", url.toString()); }
    };
    if (instant) { root.current?.classList.add("is-leaving"); later(close, 220); return; }
    close();
  }, []);

  // Escape skips at any time.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(true); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); timers.current.forEach(clearTimeout); };
  }, [active, finish]);

  // The leopard notices the pointer or touch.
  useEffect(() => {
    if (!active) return;
    const onMove = (e: PointerEvent) => {
      const el = cat.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2.2)));
      const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (innerHeight / 2.2)));
      el.style.setProperty("--lx", x.toFixed(3));
      el.style.setProperty("--ly", y.toFixed(3));
      scene.current?.setLook(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onMove); };
  }, [active]);

  const interact = () => {
    if (stage === "enter" || stage === "notice") {
      setStage("dodge");
      scene.current?.setCatX(0.34);
      later(() => { setStage("reach"); scene.current?.setCatX(0); cat.current?.focus({ preventScroll: true }); }, 620);
    } else if (stage === "reach") {
      setStage("unlock");
      const r = cat.current?.getBoundingClientRect();
      const paw = r ? { x: r.left + r.width * 0.79, y: r.top + r.height * 0.41 } : { x: innerWidth / 2, y: innerHeight / 2 };
      root.current?.style.setProperty("--paw-x", `${paw.x}px`);
      root.current?.style.setProperty("--paw-y", `${paw.y}px`);
      scene.current?.reveal();
      later(() => root.current?.classList.add("is-revealing"), 380);
      later(() => finish(), 1150);
    }
  };

  if (stage === "done") return null;

  const pose: LeopardPose = stage === "enter" ? "walk" : stage === "reach" ? "reach" : stage === "unlock" ? "celebrate" : "sit";
  const expression: LeopardExpression = stage === "notice" ? "curious" : stage === "dodge" || stage === "reach" ? "playful" : "happy";
  const verb = touch ? "Tap" : "Click";
  const hint =
    stage === "enter" ? "Something’s padding in…"
    : stage === "notice" ? `${verb} the leopard to say hi.`
    : stage === "dodge" ? "Ha — too slow."
    : stage === "reach" ? `High five? ${verb} the paw.`
    : "Welcome to the den.";

  return (
    <div ref={root} className="den" data-stage={stage} role="dialog" aria-modal="true" aria-labelledby="den-title" aria-describedby="den-help">
      <canvas className="den__gl" aria-hidden="true" />
      <div className="den__floor" aria-hidden="true" />
      <div className="den__stage">
        <div className="den__shadow" aria-hidden="true" />
        <button
          ref={cat}
          type="button"
          className="den__cat"
          onClick={interact}
          aria-label={stage === "reach" ? "High-five the leopard and enter the site" : "Say hi to the leopard"}
          disabled={stage === "unlock"}
        >
          <Leopard pose={pose} expression={expression} size="100%" />
        </button>
        <span className="den__print" aria-hidden="true">
          <svg viewBox="0 0 40 40"><ellipse cx="20" cy="25" rx="9" ry="7.5" /><circle cx="9" cy="14" r="4" /><circle cx="16" cy="8" r="4" /><circle cx="24" cy="8" r="4" /><circle cx="31" cy="14" r="4" /></svg>
        </span>
      </div>
      <div className="den__copy">
        <p id="den-title" className="den__hint" aria-live="polite">{hint}</p>
        <p id="den-help" className="den__help">{touch ? "Or skip straight to the profile." : "Enter or Space works too · Esc skips."}</p>
      </div>
      <button ref={skipBtn} type="button" className="den__skip" onClick={() => finish(true)}>Skip intro <span aria-hidden="true">→</span></button>
      <span className="den__brand" aria-hidden="true">mojeeb.xyz · enter the den</span>
    </div>
  );
}

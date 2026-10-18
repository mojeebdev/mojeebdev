"use client";

/**
 * Enter the Den — the homepage introduction.
 * Step 1 (greet): the leopard sits and idles (blinking, breathing, small head movements). "Say hi to the leopard."
 * Step 2 (reach): a tap makes it wink, smile with an open mouth, tilt its head and raise a paw. "High five? Tap the paw."
 * Step 3 (five):  tapping the paw plays a high-five, a small burst of paw prints, a happy reaction, then a circular
 *                 reveal into the profile.
 *
 * Shown only when the boot script in app/layout.tsx adds `den-pending` (first visit, motion allowed, or ?intro=1).
 * Marked as seen the moment it shows, so refreshes and internal navigation never replay it. Always skippable
 * (button or Escape); Enter/Space activate the current step. Three.js only adds depth and loads after first paint;
 * without WebGL the CSS floor and shadow remain. A failsafe in the boot script removes it if this script never runs.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Leopard, { type LeopardExpression, type LeopardPose } from "@/components/mascot/Leopard";
import { useRootClass } from "@/lib/useExternal";
import "./den.css";

type Stage = "greet" | "reach" | "five" | "done";
const STORAGE_KEY = "den:v1";
const BURST = 8;

export default function DenIntro() {
  const active = useRootClass("den-pending");
  const [stage, setStage] = useState<Stage>("greet");
  const root = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLButtonElement>(null);
  const paw = useRef<HTMLButtonElement>(null);
  const skipBtn = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const scene = useRef<{ setLook: (x: number, y: number) => void; setCatX: (x: number) => void; reveal: () => void; dispose: () => void } | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { const list = timers.current; return () => list.forEach(clearTimeout); }, []);

  // Tell the boot script we're alive (cancels its failsafe).
  useEffect(() => { (window as unknown as { __denReady?: boolean }).__denReady = true; }, []);

  // While open: mark as seen, and hide the rest of the page from keyboard and assistive tech.
  useEffect(() => {
    if (!active) return;
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    const others = Array.from(document.querySelectorAll<HTMLElement>(".sidebar, .topbar, .site-footer, main > :not(.den)"));
    others.forEach((el) => el.setAttribute("inert", ""));
    // Focus the leopard so Enter/Space act on the step; Skip intro stays one Tab away.
    cat.current?.focus({ preventScroll: true });
    return () => others.forEach((el) => el.removeAttribute("inert"));
  }, [active]);

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

  const finish = useCallback((instant = false) => {
    const close = () => {
      document.documentElement.classList.remove("den-pending");
      setStage("done");
      scene.current?.dispose();
      document.querySelectorAll<HTMLElement>("[inert]").forEach((el) => el.removeAttribute("inert"));
      const h1 = document.getElementById("hero-name");
      h1?.setAttribute("tabindex", "-1");
      h1?.focus({ preventScroll: true });
      const url = new URL(location.href);
      if (url.searchParams.has("intro")) { url.searchParams.delete("intro"); history.replaceState(null, "", url.toString()); }
    };
    if (instant) { root.current?.classList.add("is-leaving"); later(close, 220); return; }
    close();
  }, []);

  const highFive = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setStage("five");
    const r = paw.current?.getBoundingClientRect() ?? cat.current?.getBoundingClientRect();
    const p = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 };
    root.current?.style.setProperty("--paw-x", `${p.x}px`);
    root.current?.style.setProperty("--paw-y", `${p.y}px`);
    scene.current?.reveal();
    // Let the high-five and burst land first, then open onto the profile.
    later(() => root.current?.classList.add("is-revealing"), 780);
    later(() => finish(), 1520);
  }, [finish]);

  const advance = useCallback(() => {
    if (stage === "greet") {
      setStage("reach");
      later(() => paw.current?.focus({ preventScroll: true }), 60);
    } else if (stage === "reach") highFive();
  }, [stage, highFive]);

  // Keyboard: Escape skips; Enter/Space act on the current step when focus isn't already on a control.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      root.current?.classList.add("is-kbd");
      if (e.key === "Escape") { finish(true); return; }
      if ((e.key === "Enter" || e.key === " ") && !(e.target as HTMLElement).closest("button, a")) { e.preventDefault(); advance(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, finish, advance]);

  // The leopard follows the pointer or touch with its eyes and head.
  useEffect(() => {
    if (!active) return;
    const onMove = (e: PointerEvent) => {
      if (e.type === "pointerdown") root.current?.classList.remove("is-kbd");
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

  if (stage === "done") return null;

  const pose: LeopardPose = stage === "greet" ? "look" : stage === "reach" ? "reach" : "celebrate";
  const expression: LeopardExpression = stage === "greet" ? "curious" : stage === "reach" ? "playful" : "happy";
  const hint = stage === "greet" ? "Say hi to the leopard." : stage === "reach" ? "High five? Tap the paw." : "High five!";

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
          onClick={advance}
          aria-label={stage === "greet" ? "Say hi to the leopard" : stage === "reach" ? "High-five the leopard and enter the site" : "Entering the site"}
          aria-disabled={stage === "five" || undefined}
          tabIndex={stage === "reach" ? -1 : 0}
        >
          <Leopard pose={pose} expression={expression} size="100%" />
        </button>
        {stage !== "greet" && (
          <button
            ref={paw}
            type="button"
            className="den__paw-hit"
            onClick={highFive}
            aria-label="Tap the paw: high-five the leopard and enter the site"
            aria-disabled={stage === "five" || undefined}
          />
        )}
        {stage === "five" && (
          <span className="den__burst" aria-hidden="true">
            {Array.from({ length: BURST }, (_, i) => (
              <svg key={i} viewBox="0 0 40 40" style={{ ["--a" as string]: `${(360 / BURST) * i - 90}deg`, ["--d" as string]: `${i % 2 ? 78 : 104}px` }}>
                {i % 2 ? <path d="M20 4 L24 16 L36 20 L24 24 L20 36 L16 24 L4 20 L16 16 Z" /> : <><ellipse cx="20" cy="25" rx="9" ry="7.5" /><circle cx="9" cy="14" r="4" /><circle cx="16" cy="8" r="4" /><circle cx="24" cy="8" r="4" /><circle cx="31" cy="14" r="4" /></>}
              </svg>
            ))}
          </span>
        )}
      </div>
      <div className="den__copy">
        <p id="den-title" className="den__hint" aria-live="polite">{hint}</p>
        <p id="den-help" className="den__help">Enter or Space works too · Esc skips.</p>
      </div>
      <button ref={skipBtn} type="button" className="den__skip" onClick={() => finish(true)}>Skip intro <span aria-hidden="true">→</span></button>
      <span className="den__brand" aria-hidden="true">mojeeb.xyz · enter the den</span>
    </div>
  );
}

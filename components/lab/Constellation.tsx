"use client";

/**
 * Repository constellation — real StackBrief scan output for mojeebdev/outship, drawn with a hand-written
 * force simulation on canvas (no libraries). Select a file to see what it imports, what depends on it, and its
 * blast radius: every file that could be affected by changing it (transitive dependents).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import graph from "@/content/lab/outship-graph.json";
import "./constellation.css";

type G = "api" | "page" | "component" | "lib" | "script" | "other";
type Node = { id: string; g: G; r?: string[]; x: number; y: number; vx: number; vy: number; deg: number; fixed?: boolean };
type Edge = [string, string, number | null];

const GROUPS: { g: G; label: string }[] = [
  { g: "api", label: "API routes" }, { g: "page", label: "Pages" }, { g: "component", label: "Components" }, { g: "lib", label: "Library" }, { g: "script", label: "Scripts" },
];
const short = (p: string) => p.replace(/^src\//, "").replace(/\/(route|page)\.tsx?$/, "/$1");

export default function Constellation() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>("src/lib/db.ts");
  const [hover, setHover] = useState<string | null>(null);
  const [blast, setBlast] = useState(true);
  const [filter, setFilter] = useState("");

  const data = useMemo(() => {
    const edges = graph.edges as Edge[];
    const nodes: Node[] = (graph.nodes as { id: string; g: G; r?: string[] }[]).map((n, i) => {
      const a = (i / graph.nodes.length) * Math.PI * 2;
      return { ...n, x: Math.cos(a) * 200, y: Math.sin(a) * 200, vx: 0, vy: 0, deg: 0 };
    });
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const out = new Map<string, { to: string; line: number | null }[]>(), inc = new Map<string, { from: string; line: number | null }[]>();
    for (const [s, t, line] of edges) {
      byId.get(s)!.deg++; byId.get(t)!.deg++;
      (out.get(s) ?? out.set(s, []).get(s)!).push({ to: t, line });
      (inc.get(t) ?? inc.set(t, []).get(t)!).push({ from: s, line });
    }
    return { nodes, edges, byId, out, inc };
  }, []);

  const radius = useMemo(() => {
    if (!selected) return new Set<string>();
    const seen = new Set<string>([selected]); const q = [selected];
    while (q.length) { const cur = q.shift()!; for (const { from } of data.inc.get(cur) ?? []) if (!seen.has(from)) { seen.add(from); q.push(from); } }
    seen.delete(selected);
    return seen;
  }, [selected, data]);

  const selectedRef = useRef(selected), hoverRef = useRef(hover), blastRef = useRef(blast), radiusRef = useRef(radius);

  // Simulation + rendering
  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, alpha = 1, raf = 0;
    let view = { k: 1, x: 0, y: 0 };
    const css = () => {
      const s = getComputedStyle(cv);
      return { ink: s.getPropertyValue("--ink").trim(), ink3: s.getPropertyValue("--ink-3").trim(), line: s.getPropertyValue("--line-strong").trim(), blue: s.getPropertyValue("--blue").trim(), bg: s.getPropertyValue("--surface").trim(), heat: s.getPropertyValue("--heat-2").trim() };
    };
    let colors = css();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => { colors = css(); draw(); };
    mq.addEventListener("change", onScheme);
    const obs = new MutationObserver(onScheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const r = wrap.current!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2); w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; cv.style.width = `${w}px`; cv.style.height = `${h}px`;
      view = { k: Math.min(w, h) / 560, x: w / 2, y: h / 2 };
      draw();
    };

    const step = () => {
      const N = data.nodes;
      for (let i = 0; i < N.length; i++) {
        const a = N[i];
        for (let j = i + 1; j < N.length; j++) {
          const b = N[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy || 0.01;
          const f = (1600 / d2) * alpha; const d = Math.sqrt(d2); dx /= d; dy /= d;
          a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
        }
        a.vx -= a.x * 0.004 * alpha; a.vy -= a.y * 0.004 * alpha;
      }
      for (const [s, t] of data.edges) {
        const a = data.byId.get(s)!, b = data.byId.get(t)!;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = ((d - 46) / d) * 0.06 * alpha;
        a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
      for (const n of N) { if (n.fixed) { n.vx = n.vy = 0; continue; } n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy; }
      alpha *= 0.985;
    };

    const sel = { id: selected, hover, blast, radius };
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
      const focus = sel.hover ?? sel.id;
      const neighbors = new Set<string>();
      if (focus) { (data.out.get(focus) ?? []).forEach((e) => neighbors.add(e.to)); (data.inc.get(focus) ?? []).forEach((e) => neighbors.add(e.from)); }
      for (const [s, t] of data.edges) {
        const a = data.byId.get(s)!, b = data.byId.get(t)!;
        const lit = focus && (s === focus || t === focus);
        const hot = sel.blast && sel.id && (sel.radius.has(s) || s === sel.id) && (sel.radius.has(t) || t === sel.id);
        ctx.strokeStyle = lit ? colors.blue : hot ? colors.heat : colors.line;
        ctx.globalAlpha = lit ? 0.95 : hot ? 0.7 : focus ? 0.25 : 0.55;
        ctx.lineWidth = (lit ? 1.6 : 1) / view.k;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const n of data.nodes) {
        const r = 2.4 + Math.sqrt(n.deg) * 1.5;
        const isSel = n.id === sel.id, isFocus = n.id === focus, inBlast = sel.blast && sel.radius.has(n.id);
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isSel || isFocus ? colors.blue : inBlast ? colors.heat : n.g === "api" ? colors.ink : colors.bg;
        ctx.globalAlpha = focus && !isFocus && !neighbors.has(n.id) && !inBlast && !isSel ? 0.35 : 1;
        ctx.fill();
        ctx.lineWidth = 1.2 / view.k; ctx.strokeStyle = isSel || isFocus ? colors.blue : colors.ink3; ctx.stroke();
        if (isSel || isFocus || (focus && neighbors.has(n.id) && n.r)) {
          ctx.globalAlpha = 1; ctx.fillStyle = colors.ink; ctx.font = `${12 / view.k}px ${getComputedStyle(cv).fontFamily}`;
          ctx.fillText(short(n.id), n.x + r + 4 / view.k, n.y + 4 / view.k);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => { step(); draw(); if (alpha > 0.02) raf = requestAnimationFrame(loop); };
    resize();
    if (reduce) { for (let i = 0; i < 320; i++) step(); alpha = 0; draw(); } else loop();
    const ro = new ResizeObserver(resize); ro.observe(wrap.current!);

    // Pointer: hover, select, drag a node, drag to pan
    const toWorld = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - view.x) / view.k, y: (e.clientY - r.top - view.y) / view.k }; };
    const pickAt = (p: { x: number; y: number }) => data.nodes.find((n) => (n.x - p.x) ** 2 + (n.y - p.y) ** 2 < (8 + Math.sqrt(n.deg) * 1.5) ** 2 / Math.min(1, view.k));
    let drag: Node | null = null, pan: { x: number; y: number; vx: number; vy: number } | null = null, moved = false;
    const down = (e: PointerEvent) => {
      const p = toWorld(e); const n = pickAt(p); moved = false;
      cv.setPointerCapture(e.pointerId);
      if (n) { drag = n; n.fixed = true; } else pan = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    };
    const move = (e: PointerEvent) => {
      const p = toWorld(e);
      if (drag) { drag.x = p.x; drag.y = p.y; moved = true; alpha = Math.max(alpha, 0.3); if (!raf || alpha <= 0.02) loop(); return; }
      if (pan) { view.x = pan.vx + e.clientX - pan.x; view.y = pan.vy + e.clientY - pan.y; moved = true; draw(); return; }
      const n = pickAt(p); setHover(n?.id ?? null); cv.style.cursor = n ? "pointer" : "grab";
    };
    const up = (e: PointerEvent) => {
      if (drag) { drag.fixed = false; if (!moved) setSelected(drag.id); }
      else if (pan && !moved) { const n = pickAt(toWorld(e)); if (!n) setSelected(null); }
      drag = null; pan = null;
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      const k = Math.max(0.4, Math.min(3, view.k * (e.deltaY < 0 ? 1.1 : 0.9)));
      view.x = mx - ((mx - view.x) * k) / view.k; view.y = my - ((my - view.y) * k) / view.k; view.k = k; draw();
    };
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up);
    cv.addEventListener("pointerleave", () => setHover(null)); cv.addEventListener("wheel", wheel, { passive: false });
    (cv as unknown as { __redraw: () => void }).__redraw = () => { Object.assign(sel, { id: selectedRef.current, hover: hoverRef.current, blast: blastRef.current, radius: radiusRef.current }); draw(); };
    return () => { cancelAnimationFrame(raf); ro.disconnect(); obs.disconnect(); mq.removeEventListener("change", onScheme); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Keep the canvas in sync with React state without restarting the simulation.
  useEffect(() => {
    selectedRef.current = selected; hoverRef.current = hover; blastRef.current = blast; radiusRef.current = radius;
    (canvas.current as unknown as { __redraw?: () => void })?.__redraw?.();
  }, [selected, hover, blast, radius]);

  const node = selected ? data.byId.get(selected) : null;
  const outs = selected ? data.out.get(selected) ?? [] : [];
  const ins = selected ? data.inc.get(selected) ?? [] : [];
  const ext = selected ? graph.external.filter((e) => e.files.includes(selected)) : [];
  const files = data.nodes.filter((n) => !filter || n.id.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => b.deg - a.deg);

  return (
    <div className="constellation">
      <div className="constellation__stage" ref={wrap}>
        <canvas ref={canvas} className="constellation__canvas" role="img" aria-label={`Import graph of ${graph.source.repo}: ${data.nodes.length} source files and ${data.edges.length} local imports. Use the file list to explore with a keyboard.`} />
        <div className="constellation__legend" aria-hidden="true">
          <span><i className="dot dot--api" /> API route</span><span><i className="dot" /> File</span><span><i className="dot dot--blast" /> Blast radius</span><span><i className="dot dot--sel" /> Selected</span>
        </div>
        <p className="constellation__hint meta">Drag nodes · drag empty space to pan · Ctrl + scroll to zoom</p>
      </div>
      <aside className="constellation__panel" aria-label="File details">
        <label className="constellation__toggle"><input type="checkbox" checked={blast} onChange={(e) => setBlast(e.target.checked)} /> Show blast radius</label>
        {node ? (
          <div className="constellation__detail" aria-live="polite">
            <p className="label">{GROUPS.find((g) => g.g === node.g)?.label ?? "File"}</p>
            <h3 className="constellation__file mono">{node.id}</h3>
            {node.r && <ul role="list" className="constellation__routes">{node.r.map((r) => <li key={r} className="chip chip--blue">{r}</li>)}</ul>}
            <p className="constellation__blast">Changing this file can affect <strong>{radius.size}</strong> {radius.size === 1 ? "file" : "files"} through the import graph.</p>
            <div className="constellation__cols">
              <div><p className="label">Imports ({outs.length})</p><ul role="list">{outs.map((e) => <li key={e.to}><button type="button" onClick={() => setSelected(e.to)}>{short(e.to)}</button></li>)}</ul></div>
              <div><p className="label">Imported by ({ins.length})</p><ul role="list">{ins.map((e) => <li key={e.from}><button type="button" onClick={() => setSelected(e.from)}>{short(e.from)}<span className="meta">{e.line ? `:${e.line}` : ""}</span></button></li>)}</ul></div>
            </div>
            {ext.length > 0 && <p className="meta">Integrations: {ext.map((e) => `${e.id} (${e.kind})`).join(", ")}</p>}
          </div>
        ) : <p className="muted">Select a file in the graph or the list below.</p>}
        <details className="constellation__list">
          <summary>All {data.nodes.length} files (keyboard friendly)</summary>
          <input type="search" placeholder="Filter files" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter files" />
          <ul role="list">{files.map((n) => <li key={n.id}><button type="button" aria-pressed={selected === n.id} onClick={() => setSelected(n.id)}>{short(n.id)} <span className="meta">{n.deg}</span></button></li>)}</ul>
        </details>
      </aside>
      <p className="constellation__src meta">
        Data: <code>{graph.source.command}</code> by {graph.source.tool} on {graph.source.repo}@{graph.source.commit} ({graph.source.generated}). The same evidence StackBrief prints in a brief, drawn as a graph.
      </p>
    </div>
  );
}

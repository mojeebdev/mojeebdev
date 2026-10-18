"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import "./heatmap.css";

export type Day = { date: string; count: number };
type View = "daily" | "weekly" | "cumulative";

const CELL = 12, GAP = 3, STEP = CELL + GAP;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const short = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function levels(values: number[]) {
  const nz = values.filter((v) => v > 0).sort((a, b) => a - b);
  const q = (p: number) => nz[Math.min(nz.length - 1, Math.floor(p * nz.length))] ?? 1;
  const t = [q(0.25), q(0.5), q(0.75)];
  return (v: number) => (v <= 0 ? 0 : v <= t[0] ? 1 : v <= t[1] ? 2 : v <= t[2] ? 3 : 4);
}

export default function Heatmap({ days, source, asOf, compact = false }: { days: Day[]; source: string; asOf: string | null; compact?: boolean }) {
  const [view, setView] = useState<View>("daily");
  const [focus, setFocus] = useState(days.length - 1);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(SVGRectElement | null)[]>([]);

  // Calendar grid: columns are weeks starting Sunday (GitHub layout).
  const firstDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const pos = (i: number) => ({ col: Math.floor((i + firstDow) / 7), row: (i + firstDow) % 7 });
  const cols = pos(days.length - 1).col + 1;
  const lvl = useMemo(() => levels(days.map((d) => d.count)), [days]);

  const weeks = useMemo(() => {
    const w: { start: string; total: number; idx: number[] }[] = [];
    days.forEach((d, i) => { const c = pos(i).col; (w[c] ??= { start: d.date, total: 0, idx: [] }); w[c].total += d.count; w[c].idx.push(i); });
    return w;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);
  const wlvl = useMemo(() => levels(weeks.map((w) => w.total)), [weeks]);
  const cumulative = useMemo(() => days.reduce<number[]>((acc, d, i) => { acc.push((i ? acc[i - 1] : 0) + d.count); return acc; }, []), [days]);

  useEffect(() => { if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth; }, [view]);

  const sel = useMemo(() => (range ? ([Math.min(...range), Math.max(...range)] as const) : null), [range]);
  const inSel = (i: number) => sel !== null && i >= sel[0] && i <= sel[1];
  const selStats = useMemo(() => {
    if (!sel) return null;
    const slice = days.slice(sel[0], sel[1] + 1);
    return { total: slice.reduce((s, d) => s + d.count, 0), active: slice.filter((d) => d.count > 0).length, from: days[sel[0]].date, to: days[sel[1]].date, n: slice.length };
  }, [sel, days]);

  const pick = (i: number, extend: boolean) => {
    if (extend && anchor !== null) setRange([anchor, i]);
    else if (anchor !== null && range && range[0] === range[1] && range[0] !== i) setRange([anchor, i]);
    else { setAnchor(i); setRange([i, i]); }
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const moves: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1, Home: -Infinity, End: Infinity };
    if (e.key in moves) {
      e.preventDefault();
      const next = Math.max(0, Math.min(days.length - 1, focus + (moves[e.key] === -Infinity ? -focus : moves[e.key] === Infinity ? days.length : moves[e.key])));
      setFocus(next);
      if (e.shiftKey) { const a = anchor ?? focus; setAnchor(a); setRange([a, next]); }
      cellRefs.current[next]?.focus();
    } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(focus, e.shiftKey); }
    else if (e.key === "Escape") { setRange(null); setAnchor(null); }
  };

  const shown = hover ?? focus;
  const monthLabels = useMemo(() => {
    const out: { col: number; label: string }[] = [];
    let last = -1;
    days.forEach((d, i) => { const m = Number(d.date.slice(5, 7)) - 1; if (m !== last && d.date.slice(8) <= "07") { out.push({ col: pos(i).col, label: MONTHS[m] }); last = m; } });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const width = cols * STEP, height = 7 * STEP;
  const max = cumulative[cumulative.length - 1] || 1;

  return (
    <div className={`heatmap ${compact ? "heatmap--compact" : ""}`}>
      <div className="heatmap__bar">
        <p className="heatmap__readout" aria-live="polite">
          {view === "cumulative"
            ? <>{cumulative[shown].toLocaleString("en-GB")} contributions by {short(days[shown].date)}</>
            : view === "weekly"
              ? <>{weeks[pos(shown).col].total.toLocaleString("en-GB")} contributions in the week of {short(weeks[pos(shown).col].start)}</>
              : <><strong>{days[shown].count}</strong> {days[shown].count === 1 ? "contribution" : "contributions"} on {fmtDate(days[shown].date)}</>}
        </p>
        <div className="heatmap__tabs" role="tablist" aria-label="Activity view">
          {(["daily", "weekly", "cumulative"] as View[]).map((v) => (
            <button key={v} role="tab" type="button" aria-selected={view === v} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="heatmap__scroll" ref={scroller}>
        <svg
          className="heatmap__svg"
          viewBox={`0 0 ${width} ${height + 20}`}
          width={width}
          height={height + 20}
          role="grid"
          aria-label={`Public GitHub contributions, ${days[0].date} to ${days[days.length - 1].date}. Use arrow keys to move, Enter to start a range, Shift with arrows to extend it, Escape to clear.`}
          onKeyDown={onKey}
          onMouseLeave={() => setHover(null)}
        >
          {view === "daily" && days.map((d, i) => {
            const { col, row } = pos(i);
            return (
              <rect
                key={d.date}
                ref={(el) => { cellRefs.current[i] = el; }}
                x={col * STEP} y={row * STEP} width={CELL} height={CELL} rx={3.5}
                className={`hm-cell l${lvl(d.count)} ${inSel(i) ? "is-sel" : ""}`}
                tabIndex={i === focus ? 0 : -1}
                role="gridcell"
                aria-label={`${d.count} contributions on ${fmtDate(d.date)}`}
                aria-selected={inSel(i)}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setFocus(i)}
                onClick={(e) => { setFocus(i); pick(i, e.shiftKey); }}
              />
            );
          })}
          {view === "weekly" && weeks.map((w, c) => (
            <rect
              key={w.start}
              ref={(el) => { cellRefs.current[w.idx[0]] = el; }}
              x={c * STEP} y={0} width={CELL} height={height - GAP} rx={3.5}
              className={`hm-cell l${wlvl(w.total)} ${w.idx.some(inSel) ? "is-sel" : ""}`}
              tabIndex={w.idx.includes(focus) ? 0 : -1}
              role="gridcell"
              aria-label={`${w.total} contributions in the week of ${fmtDate(w.start)}`}
              onMouseEnter={() => setHover(w.idx[0])}
              onFocus={() => setFocus(w.idx[0])}
              onClick={(e) => { setFocus(w.idx[0]); pick(w.idx[e.shiftKey ? w.idx.length - 1 : 0], e.shiftKey); }}
            />
          ))}
          {view === "cumulative" && (
            <g>
              <path className="hm-area" d={`M0 ${height} ${cumulative.map((v, i) => `L${(i / (days.length - 1)) * width} ${height - (v / max) * (height - 4)}`).join(" ")} L${width} ${height} Z`} />
              <path className="hm-line" d={cumulative.map((v, i) => `${i ? "L" : "M"}${(i / (days.length - 1)) * width} ${height - (v / max) * (height - 4)}`).join(" ")} />
              {sel && <rect className="hm-band" x={(sel[0] / (days.length - 1)) * width} y={0} width={Math.max(2, ((sel[1] - sel[0]) / (days.length - 1)) * width)} height={height} />}
              <rect
                x={0} y={0} width={width} height={height} fill="transparent" tabIndex={0} role="gridcell"
                ref={(el) => { cellRefs.current[focus] = el; }}
                aria-label={`Cumulative: ${cumulative[focus]} contributions by ${fmtDate(days[focus].date)}`}
                onMouseMove={(e) => { const r = (e.currentTarget as SVGRectElement).getBoundingClientRect(); setHover(Math.round(((e.clientX - r.left) / r.width) * (days.length - 1))); }}
              />
              <circle className="hm-dot" cx={(shown / (days.length - 1)) * width} cy={height - (cumulative[shown] / max) * (height - 4)} r={3.5} />
            </g>
          )}
          {monthLabels.map((m) => (
            <text key={`${m.col}-${m.label}`} x={m.col * STEP} y={height + 14} className="hm-month">{m.label}</text>
          ))}
        </svg>
      </div>

      <div className="heatmap__foot">
        <div className="heatmap__legend" aria-hidden="true">
          <span>Less</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} className={`hm-key l${l}`} />)}<span>More</span>
        </div>
        {selStats ? (
          <p className="heatmap__sel">
            Selected {short(selStats.from)}–{short(selStats.to)}: <strong>{selStats.total.toLocaleString("en-GB")}</strong> contributions on {selStats.active} of {selStats.n} days.{" "}
            <button type="button" className="text-btn" onClick={() => { setRange(null); setAnchor(null); }}>Clear</button>
          </p>
        ) : (
          <p className="heatmap__sel meta">{compact ? "Click two days to compare a range." : "Click a day, then another (or Shift+click) to select a range."}</p>
        )}
      </div>
      <p className="heatmap__src meta">
        Source: {source}{asOf ? ` · snapshot ${short(asOf.slice(0, 10))} ${asOf.slice(0, 4)}` : ""}. Public profile data only; private repository content is never read or inferred.
      </p>
    </div>
  );
}

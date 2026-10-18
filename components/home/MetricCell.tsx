"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Metric } from "@/lib/data/types";

const typeLabel = { "live-api": "Live source", "repository-snapshot": "Repository snapshot", "founder-reported": "Founder-reported" } as const;

function when(iso: string | null) {
  if (!iso) return "unknown";
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });
}

export default function MetricCell({ metric }: { metric: Metric }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="metric" ref={ref} data-status={metric.status}>
      <button type="button" className="metric__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="metric__value">{metric.display}</span>
        <span className="metric__label">{metric.label}</span>
        <span className="sr-only">. Show source and definition</span>
      </button>
      {open && (
        <div id={id} role="dialog" aria-label={`${metric.label}: source`} className="metric__pop">
          <p className="metric__type">{typeLabel[metric.sourceType]}</p>
          <p>{metric.definition}</p>
          <dl>
            <div><dt>Window</dt><dd>{metric.window}</dd></div>
            <div><dt>Source</dt><dd>{metric.sourceUrl ? <a href={metric.sourceUrl}>{metric.source}</a> : metric.source}</dd></div>
            <div><dt>{metric.sourceType === "live-api" ? "Fetched" : "As of"}</dt><dd>{when(metric.asOf)}</dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}

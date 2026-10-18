"use client";

import "./guestbook.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import GuestbookList from "./GuestbookList";
import type { PublicEntry } from "@/lib/guestbook/schema";

type State = { phase: "loading" } | { phase: "inactive" } | { phase: "error" } | { phase: "ready"; entries: PublicEntry[] };

/**
 * Latest three notes on the homepage. Fetched in the browser so the (cached) homepage never shows stale or
 * missing notes, and so the homepage render never depends on the database.
 */
export default function GuestbookPreview() {
  const [state, setState] = useState<State>({ phase: "loading" });
  useEffect(() => {
    let alive = true;
    fetch("/api/guestbook?limit=3", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => alive && setState(d.active === false ? { phase: "inactive" } : Array.isArray(d.entries) ? { phase: "ready", entries: d.entries } : { phase: "error" }))
      .catch(() => alive && setState({ phase: "error" }));
    return () => { alive = false; };
  }, []);
  return (
    <div className="gb-preview">
      {state.phase === "ready" ? <GuestbookList entries={state.entries} reactions={false} />
        : <p className="muted" aria-live="polite">{state.phase === "loading" ? "Loading recent notes…" : state.phase === "error" ? "Notes couldn’t load right now." : "The guestbook opens soon."}</p>}
      <Link href="/guestbook" className="btn">Sign the guestbook <span aria-hidden="true">→</span></Link>
    </div>
  );
}

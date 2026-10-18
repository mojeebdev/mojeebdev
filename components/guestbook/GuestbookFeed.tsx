"use client";

import { useState } from "react";
import GuestbookList from "./GuestbookList";
import type { PublicEntry } from "@/lib/guestbook/schema";

/** Approved notes with keyset pagination ("Show more" fetches the next page from /api/guestbook). */
export default function GuestbookFeed({ initial, initialCursor }: { initial: PublicEntry[]; initialCursor: string | null }) {
  const [entries, setEntries] = useState(initial);
  const [cursor, setCursor] = useState(initialCursor);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const more = async () => {
    if (!cursor || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch(`/api/guestbook?cursor=${encodeURIComponent(cursor)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setEntries((prev) => [...prev, ...data.entries.filter((e: PublicEntry) => !prev.some((p) => p.id === e.id))]);
      setCursor(data.nextCursor);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <GuestbookList entries={entries} />
      {cursor && (
        <div className="gb-more">
          <button type="button" className="btn" onClick={more} disabled={state === "loading"} aria-describedby="gb-more-status">
            {state === "loading" ? "Loading…" : "Show more notes"}
          </button>
          <p id="gb-more-status" className="meta" role="status" aria-live="polite">{state === "error" ? "Couldn’t load more notes. Try again." : ""}</p>
        </div>
      )}
    </>
  );
}

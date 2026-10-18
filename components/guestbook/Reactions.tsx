"use client";

import { useEffect, useState } from "react";
import type { ReactionKind } from "@/lib/guestbook/schema";

const LABELS: Record<ReactionKind, { glyph: string; label: string }> = {
  wave: { glyph: "👋", label: "Wave" },
  heart: { glyph: "♥", label: "Heart" },
  paw: { glyph: "🐾", label: "Paw" },
};

export default function Reactions({ id, counts }: { id: string; counts: Record<ReactionKind, number> }) {
  const [local, setLocal] = useState(counts);
  const [mine, setMine] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setMine(JSON.parse(localStorage.getItem(`gb:r:${id}`) || "{}")); } catch {} }, [id]);
  const react = async (kind: ReactionKind) => {
    if (mine[kind]) return;
    const next = { ...mine, [kind]: true };
    setMine(next); setLocal({ ...local, [kind]: (local[kind] ?? 0) + 1 });
    try { localStorage.setItem(`gb:r:${id}`, JSON.stringify(next)); } catch {}
    await fetch("/api/guestbook/react", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, kind }) }).catch(() => {});
  };
  return (
    <div className="gb-reactions" role="group" aria-label="Reactions">
      {(Object.keys(LABELS) as ReactionKind[]).map((k) => (
        <button key={k} type="button" aria-pressed={Boolean(mine[k])} onClick={() => react(k)} aria-label={`${LABELS[k].label}: ${local[k] ?? 0}`}>
          <span aria-hidden="true">{LABELS[k].glyph}</span> <span className="mono">{local[k] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

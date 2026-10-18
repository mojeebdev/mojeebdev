"use client";

import { useMemo, useState } from "react";
import { useStorageValue, writeStorage } from "@/lib/useExternal";
import type { ReactionKind } from "@/lib/guestbook/schema";

const LABELS: Record<ReactionKind, { glyph: string; label: string }> = {
  wave: { glyph: "👋", label: "Wave" },
  heart: { glyph: "♥", label: "Heart" },
  paw: { glyph: "🐾", label: "Paw" },
};

export default function Reactions({ id, counts }: { id: string; counts: Record<ReactionKind, number> }) {
  const [local, setLocal] = useState(counts);
  const raw = useStorageValue(`gb:r:${id}`, "local", "{}");
  const mine = useMemo<Record<string, boolean>>(() => { try { return JSON.parse(raw || "{}"); } catch { return {}; } }, [raw]);
  const react = async (kind: ReactionKind) => {
    if (mine[kind]) return;
    const next = { ...mine, [kind]: true };
    setLocal({ ...local, [kind]: (local[kind] ?? 0) + 1 });
    writeStorage(`gb:r:${id}`, JSON.stringify(next));
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

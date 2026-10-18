"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setState("done"); }
    catch { setState("error"); }
    setTimeout(() => setState("idle"), 1800);
  };
  return (
    <button type="button" className="btn btn--sm btn--ghost copy-btn" onClick={copy} aria-label={`${label}: ${text}`}>
      <span aria-live="polite">{state === "done" ? "Copied" : state === "error" ? "Select to copy" : label}</span>
    </button>
  );
}

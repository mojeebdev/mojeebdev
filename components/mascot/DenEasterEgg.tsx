"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LeopardPeek } from "./Leopard";

/** Hidden easter egg: type "den" anywhere (outside form fields), or poke the sleeping leopard in the footer three times. */
export default function DenEasterEgg() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let buf = "", pokes = 0, timer = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") { setOpen(false); return; }
      buf = (buf + e.key.toLowerCase()).slice(-3);
      if (buf === "den") setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".site-footer__den")) return;
      pokes++; clearTimeout(timer); timer = window.setTimeout(() => (pokes = 0), 1200);
      if (pokes >= 3) { pokes = 0; setOpen(true); }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);
  if (!open) return null;
  return (
    <div className="egg" role="status">
      <LeopardPeek size={110} expression="playful" />
      <div className="egg__bubble">
        <p><strong>You found the den.</strong> Curious ones are always welcome.</p>
        <p className="egg__actions">
          <Link href="/?intro=1" onClick={() => setOpen(false)}>Replay the intro</Link>
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </p>
      </div>
    </div>
  );
}

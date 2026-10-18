"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import NavList from "./NavList";
import ThemeToggle from "./ThemeToggle";
import { contact, person } from "@/content/site";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const button = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); button.current?.focus(); }
      if (e.key === "Tab" && sheet.current) {
        const items = sheet.current.querySelectorAll<HTMLElement>("a, button");
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="topbar">
      <Link href="/" className="topbar__name">{person.name}</Link>
      <button ref={button} type="button" className="topbar__menu" aria-expanded={open} aria-controls="mobile-sheet" onClick={() => setOpen((o) => !o)}>
        <span className="topbar__glyph" data-open={open || undefined} aria-hidden="true"><i /><i /></span>
        <span>{open ? "Close" : "Menu"}</span>
      </button>
      <div id="mobile-sheet" ref={sheet} className="sheet" data-open={open || undefined} hidden={!open}>
        <nav aria-label="Primary">
          <NavList className="sheet__nav" onNavigate={() => setOpen(false)} />
        </nav>
        <div className="sheet__foot">
          <a href={`mailto:${contact.personalEmail}`}>{contact.personalEmail}</a>
          <a href={contact.github}>GitHub</a>
          <a href={contact.x}>X</a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

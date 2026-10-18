"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/content/site";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavList({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul role="list" className={className}>
      {nav.map((item, i) => {
        const active = isActive(pathname, item.href) || (item.href === "/work" && pathname.startsWith("/projects"));
        return (
          <li key={item.href}>
            <Link href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate} data-active={active || undefined}>
              <span className="nav-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

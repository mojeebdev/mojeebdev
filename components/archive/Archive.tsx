"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { kindLabel, statusLabel, type Project, type ProjectArea, type ProjectKind } from "@/content/projects";
import "./archive.css";

const AREAS: ProjectArea[] = ["AI", "Developer tools", "SaaS", "Web3", "Games", "Culture", "Productivity"];
const KINDS = Object.keys(kindLabel) as ProjectKind[];

export default function Archive({ projects }: { projects: Project[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<ProjectKind | "all">("all");
  const [area, setArea] = useState<ProjectArea | "all">("all");
  const [activeOnly, setActiveOnly] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter((p) =>
      (kind === "all" || p.kind === kind) &&
      (area === "all" || p.areas.includes(area)) &&
      (!activeOnly || ["live", "maintained", "pre-release"].includes(p.status)) &&
      (!needle || [p.name, p.summary, ...(p.stack ?? [])].join(" ").toLowerCase().includes(needle)));
  }, [projects, q, kind, area, activeOnly]);

  return (
    <div className="archive">
      <div className="archive__controls" role="search">
        <label className="archive__search">
          <span className="sr-only">Search projects</span>
          <input type="search" placeholder="Search name, summary or stack" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="archive__chips" role="group" aria-label="Filter by type">
          <button type="button" aria-pressed={kind === "all"} onClick={() => setKind("all")}>All types</button>
          {KINDS.map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(kind === k ? "all" : k)}>{kindLabel[k]}</button>)}
        </div>
        <div className="archive__chips" role="group" aria-label="Filter by area">
          <button type="button" aria-pressed={area === "all"} onClick={() => setArea("all")}>All areas</button>
          {AREAS.map((a) => <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(area === a ? "all" : a)}>{a}</button>)}
          <label className="archive__toggle"><input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} /> Active only</label>
        </div>
      </div>
      <p className="meta archive__count" aria-live="polite">{list.length} of {projects.length} projects</p>
      <ul role="list" className="archive__list">
        {list.map((p) => (
          <li key={p.slug} id={p.slug} className="archive__row">
            <span className="archive__logo" aria-hidden="true">
              {p.logo ? <Image src={p.logo} alt="" width={28} height={28} /> : <span>{p.name.slice(0, 1)}</span>}
            </span>
            <div className="archive__main">
              <h3 className="archive__name">
                {p.caseStudy ? <Link href={`/work/${p.slug}`}>{p.name}</Link> : p.url ? <a href={p.url}>{p.name}</a> : p.name}
                {p.caseStudy && <span className="chip chip--blue">Case study</span>}
              </h3>
              <p className="archive__summary">{p.summary}</p>
              {p.note && <p className="meta archive__note">{p.note}</p>}
              {p.stack && <p className="archive__stack meta">{p.stack.join(" · ")}</p>}
            </div>
            <div className="archive__side">
              <span className="chip">{kindLabel[p.kind]}</span>
              <span className={`status status--${p.status}`}>{statusLabel[p.status]}</span>
              <span className="archive__links">
                {p.url && <a href={p.url} aria-label={`${p.name} live site`}>Live ↗</a>}
                {p.source && <a href={p.source} aria-label={`${p.name} source`}>Source ↗</a>}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="archive__empty">Nothing matches those filters. <button type="button" className="text-btn" onClick={() => { setQ(""); setKind("all"); setArea("all"); setActiveOnly(false); }}>Reset filters</button></p>}
    </div>
  );
}

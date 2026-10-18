import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import { breadcrumbs } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Lab",
  description: "Mojeeb Titilayo's creative coding lab: an interactive repository constellation from real StackBrief data, browser games and engineering visualisations.",
  alternates: { canonical: "/lab" },
};

const experiments = [
  { href: "/lab/constellation", title: "Repository constellation", body: "A real codebase as a force-directed graph. Select any file to see its imports, its dependents and its blast radius, using StackBrief's own scan output. Canvas 2D with a hand-written simulation, no graph library.", tags: ["Canvas", "Force simulation", "StackBrief data"], feature: true, internal: true },
  { href: "/?intro=1", title: "Enter the Den", body: "Replay the homepage introduction: a layered SVG leopard rig over a Three.js environment with soft shadows, dust and camera drift.", tags: ["Three.js", "SVG rig", "Interaction"], internal: true },
  { href: "https://ratssacre.lol", title: "Ratssacre", body: "A browser night-vision precision shooting game. Spot movement across a dark farmyard and land the shot. Headshots only.", tags: ["Browser game", "Vite", "Cloudflare Workers"], note: "Private source" },
  { href: "https://word.outship.dev", title: "Word", body: "A word counter for any web page, served by Outship's Worker on its own hostname, with explicit counting rules and SSRF controls.", tags: ["Cloudflare Workers", "Next.js"], source: "https://github.com/mojeebdev/outship" },
  { href: "/activity", title: "Activity heatmap", body: "My public GitHub calendar with daily, weekly and cumulative views, keyboard navigation and range selection.", tags: ["SVG", "Data visualisation"], internal: true },
];

export default function LabPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "Lab", path: "/lab" }])} />
      <header className="page-head">
        <p className="label">Lab</p>
        <h1 className="h1">The playful side</h1>
        <p className="dek">Experiments in creative coding, small games and engineering visualisations. Each one is self-contained and works on touch, mouse and keyboard.</p>
      </header>
      <div className="lab-grid">
        {experiments.map((e) => {
          const inner = (
            <>
              <div className="lab-card__meta">{e.tags.map((t) => <span key={t} className="chip">{t}</span>)}{e.note && <span className="meta">{e.note}</span>}</div>
              <h2 className="h3">{e.title} <span aria-hidden="true">{e.internal ? "→" : "↗"}</span></h2>
              <p className="muted">{e.body}</p>
            </>
          );
          return (
            <div key={e.href} style={{ display: "grid" }} className={e.feature ? "lab-card-wrap lab-card--feature-wrap" : ""}>
              {e.internal ? <Link href={e.href} className={`lab-card ${e.feature ? "lab-card--feature" : ""}`}>{inner}</Link> : <a href={e.href} className="lab-card">{inner}</a>}
              {e.source && <a href={e.source} className="meta" style={{ marginTop: 8 }}>Source ↗</a>}
            </div>
          );
        })}
      </div>
    </>
  );
}

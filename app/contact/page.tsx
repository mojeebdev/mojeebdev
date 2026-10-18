import type { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import JsonLd from "@/components/ui/JsonLd";
import { contact, studio } from "@/content/site";
import { breadcrumbs } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Contact",
  description: "Work with Mojeeb Titilayo on product engineering, AI-native products, developer tooling and product strategy, personally or through BlindspotLab.",
  alternates: { canonical: "/contact" },
};

const offers = [
  ["Product engineering", "Taking a scoped idea to a live product: architecture, implementation, payments, email and deployment."],
  ["AI-native products and agents", "Model integration with prompt engineering, quality gates and fallbacks; MCP servers and agent tooling."],
  ["Developer tooling", "CLIs, repository intelligence, agent skills and npm packages built for real workflows."],
  ["Product strategy and architecture reviews", "Clarifying what should be built, what must stay untouched, and whether a focused fix beats a rebuild."],
  ["Selected Web3 engineering", "Contracts, wallet flows and indexers, with safety gates before real value moves."],
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <header className="page-head">
        <p className="label">Contact</p>
        <h1 className="h1">Work with me</h1>
        <p className="dek">The quickest route is email. Tell me what you’re building, what’s blocking it, and when it needs to be live. I reply personally.</p>
      </header>

      <div className="grid-2">
        <div className="panel" style={{ padding: 24, display: "grid", gap: 12 }}>
          <p className="label">Personal</p>
          <p className="h3"><a href={`mailto:${contact.personalEmail}?subject=Project%20enquiry`}>{contact.personalEmail}</a></p>
          <p className="muted">Collaborations, roles, open-source questions, or just hello.</p>
          <div className="code-line"><code tabIndex={0}>{contact.personalEmail}</code><CopyButton text={contact.personalEmail} /></div>
        </div>
        <div className="panel" style={{ padding: 24, display: "grid", gap: 12 }}>
          <p className="label">Studio engagements</p>
          <p className="h3"><a href={`mailto:${contact.workEmail}?subject=BlindspotLab%20project`}>{contact.workEmail}</a></p>
          <p className="muted">Fixed-scope product builds through <a className="text-link" href={studio.url}>{studio.name}</a> ({studio.legalName}).</p>
          <div className="code-line"><code tabIndex={0}>{contact.workEmail}</code><CopyButton text={contact.workEmail} /></div>
        </div>
      </div>

      <section className="section" aria-labelledby="offers-title" style={{ marginTop: 48 }}>
        <div className="section-head"><p className="label">What I take on</p><h2 id="offers-title" className="h2">Engagements</h2></div>
        <dl className="info-rows">
          {offers.map(([t, d]) => <div className="info-row" key={t}><dt>{t}</dt><dd><p>{d}</p></dd></div>)}
        </dl>
      </section>

      <section className="section" aria-labelledby="else-title">
        <div className="section-head"><p className="label">Elsewhere</p><h2 id="else-title" className="h2">Find me</h2></div>
        <ul role="list" className="insights">
          <li><div><span className="muted">GitHub</span><a href={contact.github}>github.com/{contact.githubHandle}</a></div></li>
          <li><div><span className="muted">X</span><a href={contact.x}>{contact.xHandle}</a></div></li>
          <li><div><span className="muted">LinkedIn</span><a href={contact.linkedin}>in/tmojeeb</a></div></li>
          <li><div><span className="muted">Studio</span><a href={studio.url}>blindspotlab.xyz</a></div></li>
        </ul>
        <p className="meta" style={{ marginTop: 20 }}>Prefer to leave a public note instead? <Link href="/guestbook" className="text-link">Sign the guestbook</Link>.</p>
      </section>
    </>
  );
}

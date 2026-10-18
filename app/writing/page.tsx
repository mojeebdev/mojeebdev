import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical notes and product-thinking documents by Mojeeb Titilayo: architecture write-ups, schemas and design decisions from his open-source repositories.",
  alternates: { canonical: "/writing" },
};

/** Real documents Mojeeb wrote in public repositories. No articles are invented here. */
const docs = [
  { title: "StackBrief architecture", kind: "Architecture", repo: "mojeebdev/stackbrief", href: "https://github.com/mojeebdev/stackbrief/blob/main/ARCHITECTURE.md", note: "How the scanner, knowledge layer, intelligence engine and brief renderer fit together." },
  { title: "The stackbrief.json schema", kind: "Specification", repo: "mojeebdev/stackbrief", href: "https://github.com/mojeebdev/stackbrief/blob/main/STACKBRIEF_SCHEMA.md", note: "The versioned contract every StackBrief capability builds on, with compatibility rules." },
  { title: "Repository intelligence", kind: "Design note", repo: "mojeebdev/stackbrief", href: "https://github.com/mojeebdev/stackbrief/blob/main/REPOSITORY_INTELLIGENCE.md", note: "A typed query layer over a repository model, and what static analysis can and cannot claim." },
  { title: "The DESIGN.md schema", kind: "Specification", repo: "mojeebdev/StyleGraft", href: "https://github.com/mojeebdev/StyleGraft/blob/main/skills/stylegraft/references/design-md-schema.md", note: "Seventeen sections that make a design system specific enough for a coding agent." },
  { title: "Revel technical brief", kind: "Stack brief", repo: "BlindspotLab-Limited/revel", href: "https://github.com/BlindspotLab-Limited/revel/blob/main/stacks.md", note: "Provider cascade, agent loop, MCP payment gates, and prompt-engineering attribution." },
  { title: "Admon contracts and mint authorisation", kind: "README", repo: "mojeebdev/admon", href: "https://github.com/mojeebdev/admon#readme", note: "GitHub-verified identity, EIP-712 authorisation and ERC-721 records on Monad Mainnet." },
  { title: "Word: routing, counting rules and SSRF controls", kind: "Design note", repo: "mojeebdev/outship", href: "https://github.com/mojeebdev/outship/blob/main/docs/word.md", note: "Serving a second product from the same Worker, with careful fetching of untrusted URLs." },
];

export default function WritingPage() {
  return (
    <>
      <header className="page-head">
        <p className="label">Writing</p>
        <h1 className="h1">Technical notes</h1>
        <p className="dek">My writing currently lives where the work does: architecture documents, specifications and design notes in public repositories. Longer essays will appear here as they are published.</p>
      </header>
      <ul role="list" className="writing-list">
        {docs.map((d) => (
          <li key={d.href}>
            <a href={d.href} className="writing-item">
              <span className="label">{d.kind}</span>
              <span className="h3">{d.title} <span aria-hidden="true">↗</span></span>
              <span className="muted">{d.note}</span>
              <span className="meta mono">{d.repo}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

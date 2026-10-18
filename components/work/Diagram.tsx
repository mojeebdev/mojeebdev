/**
 * Technical diagrams drawn from each project's source (routes, cascades, contracts).
 * Pure SVG, themed through CSS variables, no client JS.
 */
import type { CaseStudy } from "@/content/caseStudies";

type N = { id: string; x: number; y: number; w?: number; h?: number; label: string; sub?: string; accent?: boolean; dashed?: boolean };
type E = { from: string; to: string; label?: string; dashed?: boolean; bend?: "h" | "v" };
type Spec = { nodes: N[]; edges: E[]; caption: string; loop?: boolean };

const W = 132, H = 52;

const specs: Record<CaseStudy["diagram"], Spec> = {
  arcapush: {
    caption: "The distribution loop: every outbound visit passes a first-party redirect, so founders see the attention their listing actually delivered.",
    nodes: [
      { id: "submit", x: 20, y: 30, label: "Submit", sub: "web · CLI · MCP" },
      { id: "registry", x: 180, y: 30, label: "Registry", sub: "Postgres · Prisma", accent: true },
      { id: "discover", x: 340, y: 30, label: "Discover", sub: "products · agents · hacks" },
      { id: "go", x: 500, y: 30, label: "/go redirect", sub: "OUTBOUND_CLICK", accent: true },
      { id: "measure", x: 500, y: 150, label: "Measure", sub: "IMPRESSION · VIEW · SHARE" },
      { id: "founder", x: 340, y: 150, label: "Founder analytics", sub: "per listing" },
      { id: "distribute", x: 180, y: 150, label: "Distribute", sub: "Weekly · POTW · blog" },
      { id: "public", x: 20, y: 150, label: "Public metrics", sub: "with definitions" },
    ],
    edges: [
      { from: "submit", to: "registry" }, { from: "registry", to: "discover" }, { from: "discover", to: "go" },
      { from: "go", to: "measure", bend: "v" }, { from: "measure", to: "founder" }, { from: "founder", to: "distribute" },
      { from: "distribute", to: "discover", dashed: true, bend: "v" }, { from: "registry", to: "public", dashed: true, bend: "v" },
    ],
  },
  stackbrief: {
    caption: "One canonical model: scan once, then query and brief from the same versioned stackbrief.json. No network calls at any step.",
    nodes: [
      { id: "repo", x: 20, y: 90, label: "Repository", sub: "files · imports · manifests" },
      { id: "scanner", x: 180, y: 30, label: "scanner", sub: "routes · services · DBs" },
      { id: "model", x: 180, y: 150, label: "stackbrief.json", sub: "schemaVersion 2", accent: true },
      { id: "intel", x: 340, y: 90, label: "intelligence", sub: "typed queries" },
      { id: "brief", x: 500, y: 30, label: "brief --file", sub: "file:line evidence", accent: true },
      { id: "agent", x: 500, y: 150, label: "agent skill", sub: "Claude · Codex" },
    ],
    edges: [
      { from: "repo", to: "scanner" }, { from: "scanner", to: "model", bend: "v" }, { from: "model", to: "intel" },
      { from: "intel", to: "brief" }, { from: "intel", to: "agent" }, { from: "brief", to: "agent", dashed: true, bend: "v" },
    ],
  },
  stylegraft: {
    caption: "Each reference principle is preserved, adapted or excluded, then written down as a DESIGN.md a coding agent can follow.",
    nodes: [
      { id: "ref", x: 20, y: 30, label: "Reference", sub: "full-page screenshot" },
      { id: "product", x: 20, y: 150, label: "Product", sub: "repo or brief" },
      { id: "read", x: 180, y: 90, label: "Read", sub: "hierarchy · rhythm · type" },
      { id: "keep", x: 340, y: 20, label: "Preserve", sub: "serves the product", accent: true },
      { id: "adapt", x: 340, y: 90, label: "Adapt", sub: "fit the audience" },
      { id: "drop", x: 340, y: 160, label: "Exclude", sub: "source brand", dashed: true },
      { id: "design", x: 500, y: 90, label: "DESIGN.md", sub: "17-section schema", accent: true },
    ],
    edges: [
      { from: "ref", to: "read" }, { from: "product", to: "read" }, { from: "read", to: "keep" }, { from: "read", to: "adapt" },
      { from: "read", to: "drop", dashed: true }, { from: "keep", to: "design" }, { from: "adapt", to: "design" },
    ],
  },
  revel: {
    caption: "Provider cascade with quality gates. Recoverable failures fall through; nothing unvalidated reaches a person or a paying agent.",
    nodes: [
      { id: "url", x: 20, y: 30, label: "URL or MCP call", sub: "x402 on billable tools" },
      { id: "agent", x: 20, y: 150, label: "Tool loop", sub: "fetch · discover · submit" },
      { id: "groq", x: 180, y: 30, label: "Groq", sub: "llama-3.3-70b" },
      { id: "or", x: 340, y: 30, label: "OpenRouter", sub: "env-pinned" },
      { id: "gemini", x: 500, y: 30, label: "Gemini", sub: "2.5 Flash · Lite" },
      { id: "zod", x: 340, y: 150, label: "Zod gate", sub: "grounded JSON", accent: true },
      { id: "out", x: 500, y: 150, label: "Reveal Index", sub: "Blueprint · Action Queue", accent: true },
    ],
    edges: [
      { from: "url", to: "agent", bend: "v" }, { from: "agent", to: "groq" }, { from: "groq", to: "or", label: "fail" }, { from: "or", to: "gemini", label: "fail" },
      { from: "groq", to: "zod", dashed: true }, { from: "or", to: "zod", dashed: true }, { from: "gemini", to: "zod", dashed: true }, { from: "zod", to: "out" },
    ],
  },
  admon: {
    caption: "Identity is verified before value moves: GitHub OAuth, deterministic traits, a short-lived EIP-712 authorisation, then a mint on Monad Mainnet.",
    nodes: [
      { id: "gh", x: 20, y: 90, label: "GitHub OAuth", sub: "proves control" },
      { id: "traits", x: 180, y: 90, label: "Traits", sub: "deterministic · Postgres" },
      { id: "auth", x: 340, y: 30, label: "EIP-712 auth", sub: "server-signed · short-lived", accent: true },
      { id: "wallet", x: 340, y: 150, label: "Builder wallet", sub: "viem · wagmi" },
      { id: "chain", x: 500, y: 90, label: "Monad · 143", sub: "ERC-721 V1 + V2", accent: true },
    ],
    edges: [
      { from: "gh", to: "traits" }, { from: "traits", to: "auth" }, { from: "auth", to: "wallet", bend: "v" }, { from: "wallet", to: "chain" }, { from: "auth", to: "chain", dashed: true },
    ],
  },
  aitax: {
    caption: "Edge architecture with release gates. Statistics come only from indexed onchain events; live staking stays disabled until review.",
    nodes: [
      { id: "client", x: 20, y: 90, label: "Wallet client", sub: "Reown · signed sessions" },
      { id: "worker", x: 180, y: 90, label: "Worker", sub: "OpenNext · CSRF" },
      { id: "do", x: 340, y: 20, label: "Durable Object", sub: "one per market" },
      { id: "d1", x: 340, y: 90, label: "D1 + R2", sub: "events · memes (private)" },
      { id: "indexer", x: 340, y: 160, label: "Indexer", sub: "reorg-aware", accent: true },
      { id: "chain", x: 500, y: 90, label: "Contracts", sub: "paused · not deployed", dashed: true },
    ],
    edges: [
      { from: "client", to: "worker" }, { from: "worker", to: "do" }, { from: "worker", to: "d1" }, { from: "indexer", to: "d1" },
      { from: "chain", to: "indexer", dashed: true }, { from: "do", to: "chain", dashed: true },
    ],
  },
};

function center(n: N) {
  const w = n.w ?? W, h = n.h ?? H;
  return { cx: n.x + w / 2, cy: n.y + h / 2, w, h };
}

function edgePath(a: N, b: N, bend?: "h" | "v") {
  const A = center(a), B = center(b);
  if (bend === "v" || Math.abs(A.cx - B.cx) < 4) {
    const down = B.cy > A.cy;
    const y1 = down ? a.y + A.h : a.y, y2 = down ? b.y : b.y + B.h;
    if (Math.abs(A.cx - B.cx) < 4) return `M${A.cx} ${y1} L${B.cx} ${y2}`;
    const my = (y1 + y2) / 2;
    return `M${A.cx} ${y1} L${A.cx} ${my} L${B.cx} ${my} L${B.cx} ${y2}`;
  }
  const right = B.cx > A.cx;
  const x1 = right ? a.x + A.w : a.x, x2 = right ? b.x : b.x + B.w;
  if (Math.abs(A.cy - B.cy) < 4) return `M${x1} ${A.cy} L${x2} ${B.cy}`;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${A.cy} L${mx} ${A.cy} L${mx} ${B.cy} L${x2} ${B.cy}`;
}

export default function Diagram({ kind, compact = false, title }: { kind: CaseStudy["diagram"]; compact?: boolean; title: string }) {
  const spec = specs[kind];
  const byId = Object.fromEntries(spec.nodes.map((n) => [n.id, n]));
  const maxY = Math.max(...spec.nodes.map((n) => n.y + (n.h ?? H))) + 20;
  const markerId = `arrow-${kind}${compact ? "-c" : ""}`;
  return (
    <figure className={`diagram ${compact ? "diagram--compact" : ""}`}>
      <svg viewBox={`0 0 652 ${maxY}`} role="img" aria-label={`${title} system diagram. ${spec.caption}`}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="diagram__arrow" />
          </marker>
        </defs>
        {spec.edges.map((e, i) => {
          const a = byId[e.from], b = byId[e.to];
          const d = edgePath(a, b, e.bend);
          return (
            <g key={i}>
              <path d={d} className={`diagram__edge ${e.dashed ? "is-dashed" : ""}`} markerEnd={`url(#${markerId})`} />
              {e.label && !compact && (() => { const A = center(a), B = center(b); return <text x={(A.cx + B.cx) / 2} y={(A.cy + B.cy) / 2 - 8} className="diagram__elabel">{e.label}</text>; })()}
            </g>
          );
        })}
        {spec.nodes.map((n) => {
          const { w, h } = center(n);
          return (
            <g key={n.id} className={`diagram__node ${n.accent ? "is-accent" : ""} ${n.dashed ? "is-dashed" : ""}`}>
              <rect x={n.x} y={n.y} width={w} height={h} rx="8" />
              <text x={n.x + 12} y={n.y + 21} className="diagram__label">{n.label}</text>
              {n.sub && <text x={n.x + 12} y={n.y + 38} className="diagram__sub">{n.sub}</text>}
            </g>
          );
        })}
      </svg>
      {!compact && <figcaption className="meta">{spec.caption}</figcaption>}
    </figure>
  );
}

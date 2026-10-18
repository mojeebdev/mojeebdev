/**
 * Detailed case studies. Facts come from each project's repository and live endpoints
 * (sources listed per study; audit in docs/rebirth-audit.md). Outcomes state only what can be checked.
 */
export type CaseStudy = {
  slug: string;
  number: string;
  title: string;
  dek: string;
  kindLabel: string;
  statusLabel: string;
  status: "live" | "maintained" | "pre-release";
  period: string;
  role: string;
  problem: string;
  direction: string;
  approach: string[];
  stack: { layer: string; items: string[] }[];
  constraints: string[];
  decisions: { title: string; body: string }[];
  outcome: string[];
  links: { label: string; href: string }[];
  sources: { label: string; href?: string }[];
  diagram: "arcapush" | "stackbrief" | "stylegraft" | "revel" | "admon" | "aitax";
  /** Optional live metric source key for the outcome block */
  liveMetrics?: "arcapush" | "npm:@blindspotlab/stackbrief" | "npm:@blindspotlab/stylegraft";
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "arcapush",
    number: "01",
    title: "Arcapush",
    dek: "A discovery and distribution registry for products, AI agents and hackathon builds, run as a measured loop rather than a directory.",
    kindLabel: "Flagship product · created by Mojeeb Titilayo",
    statusLabel: "Live",
    status: "live",
    period: "February 2026 – present",
    role: "Creator and sole engineer: I conceived Arcapush and own product direction, architecture, implementation, editorial operations and the CLI. It runs as a BlindspotLab product.",
    problem:
      "Builders ship constantly, but attention doesn't follow. Launch platforms reward a single day of noise. Small products, agents and hackathon builds need a permanent, structured record and a fair way to be found.",
    direction:
      "Treat discovery as a loop you can measure: discover → visit → track → distribute → measure → learn. Every listing is a permanent public record, and every outbound visit goes through a first-party redirect so founders can see the attention they actually received.",
    approach: [
      "One Next.js App Router codebase serves discovery, the registry, agent and hackathon indexes, founder dashboards, an editorial blog and an admin console.",
      "Outbound clicks pass through `/go/[type]/[slug]`, a trusted redirect that records `OUTBOUND_CLICK`. Together with `IMPRESSION`, `VIEW` and `SHARE`, this gives founders analytics without fingerprinting; sessions use first-party cookies.",
      "Public homepage metrics are served from a 15-minute server cache, and each one ships with a written definition of what it counts and excludes.",
      "A companion CLI (`@blindspotlab/arcapush`) runs guided onboarding in the terminal and exposes the same flows to MCP clients. It reads only listing metadata and never uploads source code or `.env` files.",
    ],
    stack: [
      { layer: "Product", items: ["Next.js 16 App Router", "TypeScript", "React", "Tailwind CSS"] },
      { layer: "Data", items: ["PostgreSQL", "Prisma 7 (49 models)", "NextAuth v5"] },
      { layer: "Distribution", items: ["First-party event loop", "Brevo email", "Founder badges (SVG)"] },
      { layer: "Agents", items: ["Arcapush CLI", "MCP config", "JSON output for automation"] },
      { layer: "Infra", items: ["Vercel"] },
    ],
    constraints: [
      "One engineer maintaining a public platform, its email, its CLI and its editorial programme.",
      "Metrics must be defensible: no bots, no staging, no team traffic, and no unique-user claims.",
      "The CLI must be safe to run inside any repository.",
    ],
    decisions: [
      { title: "Redirects as the source of truth", body: "Counting clicks at a first-party redirect, rather than trusting client beacons alone, makes \"clicks to builds\" auditable and lets each listing show its own outbound attention." },
      { title: "Definitions ship with numbers", body: "The public metrics API returns each figure alongside its definition and recording start date, so the homepage cannot drift into vanity numbers." },
      { title: "Terminal-first submission", body: "Builders already live in the terminal and in AI assistants, so the CLI and MCP route remove the copy-paste step and keep listing data structured." },
    ],
    outcome: [
      "Live at arcapush.com with public, definition-backed metrics (shown below, fetched live).",
      "667 commits between 2026-02-16 and 2026-10-18 in a private repository.",
      "Companion CLI published on npm. Its current version and downloads are in the tools section.",
    ],
    links: [
      { label: "arcapush.com", href: "https://arcapush.com" },
      { label: "Docs", href: "https://arcapush.com/docs" },
      { label: "CLI source", href: "https://github.com/mojeebdev/arcapush-cli" },
      { label: "CLI on npm", href: "https://www.npmjs.com/package/@blindspotlab/arcapush" },
    ],
    sources: [
      { label: "arcapush.com/api/hero-metrics (public metrics with definitions)", href: "https://arcapush.com/api/hero-metrics" },
      { label: "Arcapush README and Prisma schema (private repository)" },
      { label: "@blindspotlab/arcapush npm README", href: "https://www.npmjs.com/package/@blindspotlab/arcapush" },
    ],
    diagram: "arcapush",
    liveMetrics: "arcapush",
  },
  {
    slug: "stackbrief",
    number: "02",
    title: "StackBrief",
    dek: "The architectural brief before a code change. An offline, source-cited CLI for developers and coding agents.",
    kindLabel: "Open source · MIT",
    statusLabel: "Maintained",
    status: "maintained",
    period: "July 2026 – present",
    role: "Creator and maintainer: product, architecture, all seven packages, documentation and website.",
    problem:
      "The hard part of a change is rarely typing the code. It is rebuilding enough of the system in your head to change it safely. READMEs drift, and architecture is spread across routes, services, manifests and someone's memory. Coding agents have the same problem, only faster.",
    direction:
      "Start from a concrete file, not an abstract question about the whole repository. Trace observable evidence (imports, routes, services, databases, external APIs) and report it with file and line citations. Say plainly what static analysis cannot prove.",
    approach: [
      "`stackbrief scan` writes `stackbrief.json`, a deterministic, schema-versioned model of the repository. Every later capability builds on this one model rather than keeping a parallel view.",
      "`stackbrief brief --file` traces from the selected file: route and service boundaries, reached local files, direct dependents, database and API integrations, connected tests and static unknowns.",
      "A typed intelligence layer answers queries over the model. The renderer keeps briefs short enough to read before an edit.",
      "`stackbrief agent install` gives Claude, Codex and others portable pre-change instructions, without tying the tool to any vendor.",
    ],
    stack: [
      { layer: "Packages", items: ["scanner", "knowledge", "intelligence", "brief", "cli", "core", "types"] },
      { layer: "Runtime", items: ["TypeScript", "Node.js ≥ 16.7", "npm"] },
      { layer: "Contract", items: ["stackbrief.json · schemaVersion 2"] },
      { layer: "Agents", items: ["Portable pre-change skill (Claude, Codex)"] },
    ],
    constraints: [
      "No account, API key, hosted model or network connection.",
      "Must never execute application code.",
      "Output must be useful to a human in under a minute and parseable by an agent.",
    ],
    decisions: [
      { title: "Local-first as a privacy boundary", body: "Scanning, the knowledge model and brief rendering make no telemetry or AI requests, so the tool is safe to run on private code." },
      { title: "Unknowns are first-class output", body: "Dynamic imports, runtime configuration and missing test links are reported as unknowns. That is more honest than confident prose." },
      { title: "One canonical model", body: "A single versioned JSON contract keeps scan, query and brief consistent, and makes the output usable offline and in CI." },
    ],
    outcome: [
      "v1.1.2 published on npm (2026-07-18); live download figures in the tools section.",
      "Built for OpenAI Build Week 2026, with a reproducible judge guide (JUDGES.md). The result was not published.",
      "Used on real repositories: the lab's constellation is drawn from StackBrief output on mojeebdev/outship.",
    ],
    links: [
      { label: "Website", href: "https://stackbrief.peerfix.dev" },
      { label: "Source", href: "https://github.com/mojeebdev/stackbrief" },
      { label: "npm", href: "https://www.npmjs.com/package/@blindspotlab/stackbrief" },
    ],
    sources: [
      { label: "README, ARCHITECTURE.md, CHANGELOG.md, STACKBRIEF_SCHEMA.md", href: "https://github.com/mojeebdev/stackbrief" },
      { label: "npm registry metadata", href: "https://www.npmjs.com/package/@blindspotlab/stackbrief" },
    ],
    diagram: "stackbrief",
    liveMetrics: "npm:@blindspotlab/stackbrief",
  },
  {
    slug: "stylegraft",
    number: "03",
    title: "StyleGraft",
    dek: "Turns website inspiration into an original design system made for your product, as an agent skill for ChatGPT and Codex.",
    kindLabel: "Open source · MIT",
    statusLabel: "Maintained",
    status: "maintained",
    period: "August 2026 – present",
    role: "Creator: skill design, DESIGN.md schema, installer CLI, evals and website.",
    problem:
      "Builders find a site they love and ask an AI to \"make it look like this\". The result either copies someone else's brand or collapses into generic SaaS defaults. Neither serves the product being built.",
    direction:
      "Translate principles, not protected expression. For each thing the reference does well, decide whether to preserve, adapt or exclude it for the new product, then write the decision down as a DESIGN.md that a coding agent can follow.",
    approach: [
      "A skills-only plugin: no API key, account or hosted backend. `npx @blindspotlab/stylegraft install` places the skill for Codex at user or project level, and `doctor` verifies it.",
      "The workflow reads the full reference page (hierarchy, rhythm, colour roles, type character, imagery), then reads the product or repository before translating.",
      "Output follows a fixed 17-section schema: product context, translation table, colour and type systems, composition grammar, responsive behaviour, accessibility, explicit anti-slop rules and uncertain decisions.",
      "Positive and negative activation prompts (evals/prompts.md) keep the skill from firing on literal cloning requests.",
    ],
    stack: [
      { layer: "Skill", items: ["SKILL.md workflow", "DESIGN.md schema", "Evals"] },
      { layer: "Distribution", items: ["npm installer CLI", "Codex plugin manifest", "ChatGPT skill import"] },
      { layer: "Runtime", items: ["Node.js", "No backend"] },
    ],
    constraints: [
      "Must never reproduce source logos, copy, illustrations, mascots or distinctive compositions.",
      "Must work in two hosts (ChatGPT and Codex) with different install paths.",
      "Output has to be specific enough that an agent doesn't fall back to defaults.",
    ],
    decisions: [
      { title: "Preserve / adapt / exclude", body: "A three-way decision per principle makes the translation auditable and keeps originality a deliberate act rather than an accident." },
      { title: "Composition beats tokens", body: "The schema demands page-level composition rules, which are where generic AI design usually fails, not just colours and fonts." },
      { title: "Used on this site", body: "This portfolio's DESIGN.md follows the StyleGraft schema, applied to Mojeeb's own references." },
    ],
    outcome: [
      "v0.1.1 published on npm (2026-08-10); live download figures in the tools section.",
      "Public website, privacy notice and terms at stylegraft.peerfix.dev.",
    ],
    links: [
      { label: "Website", href: "https://stylegraft.peerfix.dev" },
      { label: "Source", href: "https://github.com/mojeebdev/StyleGraft" },
      { label: "npm", href: "https://www.npmjs.com/package/@blindspotlab/stylegraft" },
    ],
    sources: [
      { label: "README, skills/stylegraft/SKILL.md, references/design-md-schema.md", href: "https://github.com/mojeebdev/StyleGraft" },
    ],
    diagram: "stylegraft",
    liveMetrics: "npm:@blindspotlab/stylegraft",
  },
  {
    slug: "revel",
    number: "04",
    title: "Revel",
    dek: "An AI product strategist. Paste a URL and get a scored Reveal Index, a prioritised Blueprint and an exportable Action Queue, for people and for paying agents.",
    kindLabel: "Studio product · BlindspotLab",
    statusLabel: "Live",
    status: "live",
    period: "July 2026",
    role: "Author and engineer: product, agent loop, provider cascade, MCP and payment integration. Prompt engineering by Mojeeb Titilayo, iterated with Claude and Grok Build CLI (credited in the repository's stacks.md).",
    problem:
      "Founders can't see why a page isn't converting. Generic AI reviews say \"improve your messaging\" without quoting a single line of the page.",
    direction:
      "Ground every finding in the page itself, make the output something you can act on (scored, prioritised, exportable), and make the same capability callable by AI agents, who pay per audit.",
    approach: [
      "A custom single-agent tool loop (not LangChain) with three tools: `fetch_url`, `discover_internal_links` and `submit_analysis_report`. Cheerio extracts titles, headings, CTAs, navigation and body text as evidence.",
      "A multi-provider cascade, Groq → OpenRouter → Gemini, falls through on recoverable failures (quota, incomplete reports, API errors). Zod quality gates reject reports that don't validate.",
      "Site-grounding prompts require quoted page copy and ban generic advice. Provider and model errors are sanitised before they reach the UI.",
      "A streamable HTTP MCP server at `/api/mcp`, with x402 payment gates only on billable tools, settled in USDT0 on X Layer. A Partner API issues keyed access.",
    ],
    stack: [
      { layer: "Prompt engineering", items: ["Site-grounding prompts", "Zod quality gates", "Mojeeb Titilayo (author)"] },
      { layer: "Models", items: ["Groq llama-3.3-70b-versatile", "OpenRouter (env-pinned)", "Gemini 2.5 Flash / Flash Lite"] },
      { layer: "Agents", items: ["Custom tool loop", "MCP (A2MCP)", "Partner API"] },
      { layer: "Payments", items: ["OKX x402", "X Layer (eip155:196)"] },
      { layer: "Product", items: ["Next.js 16", "React 19", "Supabase Postgres", "Prisma 7", "NextAuth v5", "Vercel"] },
    ],
    constraints: [
      "Free-tier model quotas, so a cascade was needed for reliability.",
      "Long-running audits, up to 300 s per function.",
      "Agent callers that pay per call: discovery must stay free and billing must be precise.",
    ],
    decisions: [
      { title: "Cascade over a single provider", body: "Ordering providers by speed and quota (fast free tier first, strongest grounded JSON second, tightest quota last) keeps audits finishing without exposing which provider failed." },
      { title: "Pay only for value", body: "MCP discovery methods are free; x402 applies only to billable audit tools, matching the OKX agent marketplace payment path." },
      { title: "Quote or it didn't happen", body: "Grounding prompts plus schema gates are what separate a usable audit from a generic one." },
    ],
    outcome: [
      "Live at tryrevel.xyz, with docs at docs.tryrevel.xyz.",
      "Listed on the OKX AI marketplace as agent #4750, with its endpoint at tryrevel.xyz/api/mcp.",
      "82 commits between 2026-07-04 and 2026-07-27 in a public repository.",
    ],
    links: [
      { label: "tryrevel.xyz", href: "https://tryrevel.xyz" },
      { label: "Source", href: "https://github.com/BlindspotLab-Limited/revel" },
    ],
    sources: [
      { label: "README and stacks.md", href: "https://github.com/BlindspotLab-Limited/revel" },
    ],
    diagram: "revel",
  },
  {
    slug: "admon",
    number: "05",
    title: "Admon",
    dek: "Turns public GitHub activity into a wallet-owned build record, minted on Monad Mainnet, without letting anyone mint someone else's work.",
    kindLabel: "Hackathon submission · continued after",
    statusLabel: "Live",
    status: "live",
    period: "July 2026",
    role: "Sole engineer: product, contracts, mint authorisation, GitHub integration and front end.",
    problem:
      "Anyone can claim a GitHub profile. A build record only means something if the person minting it controls that profile, and if the record can be reproduced from public data.",
    direction:
      "Verify control first, derive traits deterministically, and keep every privileged key on the server. The wallet owns the record; the chain proves it.",
    approach: [
      "Anyone can inspect a username, but GitHub OAuth must confirm control of the profile before a record can be created or minted.",
      "Public activity (commits, repositories, streaks, stars) becomes deterministic traits, persisted in PostgreSQL through Prisma.",
      "The server issues short-lived EIP-712 mint authorisations signed by a server-only key. The browser never holds a privileged key.",
      "One ERC-721 per GitHub username on Monad Mainnet (chain 143). V2, AdmonTrace, adds weekly records.",
    ],
    stack: [
      { layer: "Contracts", items: ["Solidity", "OpenZeppelin ERC-721 + EIP-712", "Monad Mainnet · 143"] },
      { layer: "Client", items: ["viem", "wagmi"] },
      { layer: "Product", items: ["Next.js 16", "Prisma", "Supabase Postgres + Storage", "GitHub OAuth"] },
    ],
    constraints: [
      "One record per username, enforced onchain.",
      "No private keys in the browser.",
      "Traits must be reproducible from public data.",
    ],
    decisions: [
      { title: "Server-signed authorisation", body: "EIP-712 authorisations bind a mint to a verified GitHub identity and a wallet for a short window, so impersonation fails at the contract." },
      { title: "Deterministic traits", body: "Identical public input always yields an identical record, which keeps the artwork honest and verifiable." },
    ],
    outcome: [
      "V1 Genesis: verified contract 0xb6aedBF17a11928A63773F88a9CfD3E252F43a63.",
      "V2 Trace: 0xCc3fc8b272bca9de775ba7399E3dD7fd7a0173b0.",
      "Submitted to a Monad hackathon (did not win) and developed further afterwards.",
    ],
    links: [
      { label: "admon.peerfix.dev", href: "https://admon.peerfix.dev" },
      { label: "Source", href: "https://github.com/mojeebdev/admon" },
      { label: "V1 on Monadscan", href: "https://monadscan.com/address/0xb6aedBF17a11928A63773F88a9CfD3E252F43a63" },
      { label: "V2 on Monadscan", href: "https://monadscan.com/address/0xCc3fc8b272bca9de775ba7399E3dD7fd7a0173b0" },
    ],
    sources: [{ label: "README and contracts/", href: "https://github.com/mojeebdev/admon" }],
    diagram: "admon",
  },
  {
    slug: "aitax",
    number: "06",
    title: "AITAX",
    dek: "Engineering for a client's Cloudflare-native prediction arcade on Robinhood Chain, built to be safe before it is live.",
    kindLabel: "Client engineering",
    statusLabel: "Pre-release",
    status: "pre-release",
    period: "September 2026",
    role: "Engineer for the client: full-stack application, Worker architecture, event indexer, contract accounting core and tests, and release documentation. Brand, mascot, token and visual system belong to the client.",
    problem:
      "A token community wanted an Up-or-Down prediction game with real stakes. Real value demands correct accounting, honest public statistics and a release process that cannot be skipped.",
    direction:
      "Build the whole system properly, but ship it with live staking hard-disabled until the oracle, address confirmation, testnet validation and independent review gates are cleared.",
    approach: [
      "Cloudflare Worker + D1 + private R2, with one Durable Object coordinating each market.",
      "A reorg-aware event indexer stores every EVM `uint256` as decimal text. Homepage totals come only from verified events, and practice data never enters public statistics.",
      "Wallet-signature sessions with origin- and chain-bound single-use nonces and CSRF protection. Wallet-authenticated meme uploads are validated server-side and stripped of metadata.",
      "A Solidity accounting core with adversarial local-EVM tests (concurrent rounds, shared boundaries, refunds, reserve behaviour, payouts, reentrancy), plus an immutable Chainlink V3 report adapter for exact BTC/USD boundaries.",
    ],
    stack: [
      { layer: "Edge", items: ["Cloudflare Workers", "D1", "R2", "Durable Objects", "OpenNext"] },
      { layer: "Onchain", items: ["Solidity", "Robinhood Chain", "Chainlink Data Streams", "Reown AppKit", "wagmi / viem"] },
      { layer: "App", items: ["Next.js", "TypeScript", "Drizzle"] },
    ],
    constraints: [
      "No real value until every release gate is cleared, and that must be enforced in code.",
      "Exact price boundaries, so no approximations are allowed in settlement.",
      "A preserved client visual system and supplied mascot.",
    ],
    decisions: [
      { title: "Paused by construction", body: "Deployment starts paused with immutable stake and round caps, and both the server and public flags default live staking to false." },
      { title: "Statistics from events only", body: "Public totals are derived from indexed onchain events, never from practice rounds or client claims." },
    ],
    outcome: [
      "Pre-release. In the repository's words: \"production-oracle code is implemented but no contract is deployed and live staking is hard-disabled.\"",
      "123 commits between 2026-09-09 and 2026-09-18, handed off with integration, security, readiness and deployment documentation.",
    ],
    links: [{ label: "aitax.fun", href: "https://aitax.fun" }],
    sources: [{ label: "Client repository README and docs/ (private)" }],
    diagram: "aitax",
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);

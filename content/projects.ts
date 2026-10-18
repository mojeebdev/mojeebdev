/**
 * Complete project archive. Sources: blindspotlab/data/projects.ts (31 records), the previous lib/projects.ts
 * (53 records) and live URL checks on 2026-10-18 (docs/rebirth-audit.md §3). Undocumented fields stay empty.
 */
export type ProjectKind = "studio" | "open-source" | "client" | "hackathon" | "experiment" | "community" | "public-interest";
export type ProjectStatus = "live" | "maintained" | "pre-release" | "paused" | "on-hold" | "archived" | "offline";
export type ProjectArea = "AI" | "Developer tools" | "SaaS" | "Web3" | "Games" | "Culture" | "Productivity";

export type Project = {
  slug: string;
  name: string;
  url?: string;
  source?: string;
  kind: ProjectKind;
  status: ProjectStatus;
  year: number;
  areas: ProjectArea[];
  summary: string;
  stack?: string[];
  logo?: string;
  /** Has a full case study at /work/{slug} */
  caseStudy?: boolean;
  note?: string;
};

export const kindLabel: Record<ProjectKind, string> = {
  studio: "Studio product",
  "open-source": "Open source",
  client: "Client engineering",
  hackathon: "Hackathon",
  experiment: "Experiment",
  community: "Community",
  "public-interest": "Public interest",
};

export const statusLabel: Record<ProjectStatus, string> = {
  live: "Live",
  maintained: "Maintained",
  "pre-release": "Pre-release",
  paused: "Paused",
  "on-hold": "On hold",
  archived: "Archived",
  offline: "Offline",
};

const gh = (repo: string) => `https://github.com/mojeebdev/${repo}`;

export const projects: Project[] = [
  // ---- Case studies ----
  { slug: "arcapush", name: "Arcapush", url: "https://arcapush.com", kind: "studio", status: "live", year: 2026, areas: ["SaaS", "Developer tools"], summary: "Mojeeb’s flagship product: a discovery and distribution registry for products, AI agents and hackathon builds.", stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "NextAuth", "Brevo", "Vercel"], logo: "/logos/arcapush-mark.svg", caseStudy: true },
  { slug: "stackbrief", name: "StackBrief", url: "https://stackbrief.peerfix.dev", source: gh("stackbrief"), kind: "open-source", status: "maintained", year: 2026, areas: ["Developer tools"], summary: "Source-cited repository architecture briefs before a code change. Offline, local-first CLI.", stack: ["TypeScript", "Node.js", "CLI", "npm"], logo: "/logos/stackbrief-logo.svg", caseStudy: true },
  { slug: "stylegraft", name: "StyleGraft", url: "https://stylegraft.peerfix.dev", source: gh("StyleGraft"), kind: "open-source", status: "maintained", year: 2026, areas: ["Developer tools", "AI"], summary: "Turns a website reference into an original, product-specific DESIGN.md for ChatGPT and Codex.", stack: ["Node.js", "Agent skills", "npm"], logo: "/logos/stylegraft-logo.svg", caseStudy: true },
  { slug: "revel", name: "Revel", url: "https://tryrevel.xyz", source: "https://github.com/BlindspotLab-Limited/revel", kind: "studio", status: "live", year: 2026, areas: ["AI", "SaaS"], summary: "An AI product strategist: paste a URL, get a scored Reveal Index, Blueprint and Action Queue.", stack: ["Next.js", "Groq", "OpenRouter", "Gemini", "MCP", "x402", "Supabase", "Prisma"], logo: "/logos/revel-logo.svg", caseStudy: true },
  { slug: "admon", name: "Admon", url: "https://admon.peerfix.dev", source: gh("admon"), kind: "hackathon", status: "live", year: 2026, areas: ["Web3", "Developer tools"], summary: "Turns public GitHub activity into a wallet-owned build record minted on Monad Mainnet.", stack: ["Next.js", "Solidity", "Monad", "viem", "wagmi", "Prisma", "Supabase"], logo: "/logos/admon-logo.png", caseStudy: true, note: "Monad hackathon submission, developed further afterwards." },
  { slug: "aitax", name: "AITAX", url: "https://aitax.fun", kind: "client", status: "pre-release", year: 2026, areas: ["Web3", "Games"], summary: "Engineering for a client's prediction arcade on Robinhood Chain. Contracts are not deployed and live staking is disabled.", stack: ["Next.js", "Cloudflare Workers", "D1", "R2", "Durable Objects", "Solidity", "Chainlink"], caseStudy: true },

  // ---- Studio and open-source ----
  { slug: "blindspotlab", name: "BlindspotLab", url: "https://blindspotlab.xyz", kind: "studio", status: "live", year: 2026, areas: ["SaaS", "AI"], summary: "The AI-native product studio Mojeeb founded. BlindspotLab Limited, RC 9855946.", stack: ["Next.js", "Gemini", "Resend", "Paystack", "Cloudflare Workers"], logo: "/logos/blindspotlab-mark.svg" },
  { slug: "arcapush-cli", name: "Arcapush CLI", url: "https://www.npmjs.com/package/@blindspotlab/arcapush", source: gh("arcapush-cli"), kind: "open-source", status: "maintained", year: 2026, areas: ["Developer tools"], summary: "Submit and manage Arcapush listings from the terminal or an MCP client.", stack: ["Node.js", "MCP", "npm"], logo: "/logos/arcapush-mark.svg" },
  { slug: "didcore", name: "didcore", url: "https://www.npmjs.com/package/@blindspotlab/didcore", source: gh("didcore"), kind: "open-source", status: "maintained", year: 2026, areas: ["Developer tools", "Web3"], summary: "An onboarding wrapper for the third-party zunmax/technocore-did-starter. It installs an agent skill; the upstream CLI creates the DID.", stack: ["Node.js", "Agent skills", "npm"] },
  { slug: "outship", name: "Outship", url: "https://outship.dev", source: gh("outship"), kind: "open-source", status: "live", year: 2026, areas: ["Developer tools", "Web3"], summary: "GitHub-verified commits, releases and streaks, attested onchain on Base. Includes Word, a page word counter.", stack: ["Next.js", "Cloudflare Workers", "D1", "EAS", "Base"], logo: "/logos/outship-logo.svg" },
  { slug: "capself", name: "Capself", url: "https://capself.co", kind: "studio", status: "live", year: 2026, areas: ["SaaS", "Productivity"], summary: "A personal development system that maps identity, goals, habits and growth.", stack: ["Next.js", "Supabase", "Prisma", "OpenRouter", "Paystack"], logo: "/logos/capself-logo.svg" },
  { slug: "whate", name: "Whate", url: "https://whate.app", kind: "studio", status: "live", year: 2026, areas: ["AI", "Productivity"], summary: "Meal recommendations matched to persona, pantry and mood across 10,000+ recipes.", stack: ["Next.js", "Prisma", "Auth.js", "PWA"], logo: "/logos/whate-logo.png" },
  { slug: "sitehook", name: "SiteHook", url: "https://sitehook.run", kind: "studio", status: "live", year: 2026, areas: ["AI", "SaaS"], summary: "Lead research that combines language models with Google Places data. Began as an internal BlindspotLab tool.", stack: ["Next.js", "Supabase", "OpenRouter"], logo: "/logos/sitehook-logo.png" },
  { slug: "peerfix", name: "PeerFix", url: "https://peerfix.dev", source: gh("peerfix"), kind: "studio", status: "live", year: 2026, areas: ["Web3", "Developer tools"], summary: "A builder marketplace for technical blockers, with USDC escrow on Base for paid problems.", stack: ["Next.js", "Neon", "Prisma", "wagmi", "Base"], logo: "/logos/peerfix-logo.png" },
  { slug: "dearly", name: "Dearly", url: "https://dearly.icu", kind: "studio", status: "live", year: 2026, areas: ["Productivity"], summary: "Personal digital greetings, group celebrations and private memory spaces.", stack: ["Next.js", "Supabase", "Gemini"], logo: "/logos/dearly-logo.svg" },
  { slug: "firsttx", name: "FirstTx", url: "https://firsttx.xyz", kind: "studio", status: "live", year: 2026, areas: ["Web3"], summary: "Finds a wallet's first onchain transaction and turns it into a shareable story.", stack: ["Next.js", "Alchemy", "wagmi"] },
  { slug: "pullchain", name: "PullChain", url: "https://pullchain.fun", source: gh("pullchain"), kind: "studio", status: "live", year: 2026, areas: ["Web3", "Games"], summary: "A block-pulling Web3 learning game with quizzes and soulbound certificates on Base.", stack: ["Next.js", "Prisma", "Privy", "Solidity", "Base"], logo: "/logos/pullchain-logo.png" },
  { slug: "arcaprompt", name: "ArcaPrompt", url: "https://arcaprompt.arcapush.com", source: gh("arcaprompt"), kind: "studio", status: "offline", year: 2026, areas: ["AI"], summary: "Turns a product idea into structured build prompts, a tech stack and a name.", stack: ["Next.js", "Gemini"], logo: "/logos/arcaprompt-logo.png", note: "Did not resolve from the audit environment on 2026-10-18. TODO(mojeeb): confirm." },
  { slug: "promptrank", name: "PromptRank", url: "https://promptrank.arcapush.com", source: gh("promptrank"), kind: "studio", status: "offline", year: 2026, areas: ["AI"], summary: "A Gemini-powered tool that grades a prompt you submit.", stack: ["Next.js", "Gemini", "Upstash"], logo: "/logos/promptrank-logo.png", note: "Did not resolve from the audit environment on 2026-10-18. TODO(mojeeb): confirm." },
  { slug: "roasturl", name: "RoastURL", url: "https://roasturl.xyz", source: gh("roasturl"), kind: "experiment", status: "live", year: 2026, areas: ["AI"], summary: "Direct AI feedback on a submitted startup website.", stack: ["Next.js", "Gemini", "Supabase"], logo: "/logos/roasturl-logo.png" },

  // ---- Experiments, games, community ----
  { slug: "ratssacre", name: "Ratssacre", url: "https://ratssacre.lol", kind: "experiment", status: "live", year: 2026, areas: ["Games"], summary: "A browser night-vision precision shooting game. Headshots only.", stack: ["Vite", "TypeScript", "Cloudflare Workers", "D1"] },
  { slug: "rigyadh", name: "RIGYADH", url: "https://rigyadh.buzz", source: gh("RIGYADH"), kind: "community", status: "live", year: 2026, areas: ["Games"], summary: "A competitive drilling game with Operator IDs and daily ranked fields.", stack: ["Next.js", "Neon", "Drizzle", "viem"], logo: "/logos/rigyadh-logo.svg" },
  { slug: "beat-ballot", name: "Beat Ballot", url: "https://beatballot.space", source: gh("beat-ballot"), kind: "experiment", status: "live", year: 2026, areas: ["Culture"], summary: "A sourced fan ballot for comparing songs without claiming an official winner.", stack: ["Next.js", "Neon"], logo: "/logos/beatballot-logo.svg" },
  { slug: "roadbook-ng", name: "Roadbook NG", url: "https://roadbook.mojeebdev.workers.dev", source: gh("roadbook-ng"), kind: "public-interest", status: "live", year: 2026, areas: ["Culture"], summary: "Independent guidance for Nigerian drivers, vehicle documents and verification.", stack: ["Next.js", "Cloudflare Workers"], logo: "/logos/roadbook-logo.svg" },
  { slug: "matchmind", name: "MatchMind", url: "https://app.matchmind.xyz", source: gh("matchmind"), kind: "hackathon", status: "live", year: 2026, areas: ["AI"], summary: "An AI football agent answering World Cup 2026 questions from match data. Google Rapid Agent Hackathon entry.", stack: ["Next.js", "Gemini", "Google ADK", "MongoDB Atlas"], logo: "/logos/matchmind-logo.svg" },
  { slug: "abse", name: "Abse", url: "https://abse.base44.app", source: gh("abse"), kind: "hackathon", status: "live", year: 2026, areas: ["Games", "Developer tools"], summary: "A strategy dungeon crawler forged from a developer's public GitHub history. Base44 hackathon entry.", stack: ["Base44", "React", "GitHub API"], logo: "/logos/abse-mark.svg" },
  { slug: "commitcar", name: "CommitCar", url: "https://commitcar.vercel.app", source: gh("commitcar"), kind: "experiment", status: "live", year: 2026, areas: ["Web3", "Developer tools"], summary: "GitHub activity turned into a generated car. The precursor to Admon.", stack: ["Next.js", "Supabase", "Solidity", "Base"] },
  { slug: "nagimu", name: "NAGIMU", url: "https://nagimu.vercel.app", source: gh("nagimu"), kind: "experiment", status: "live", year: 2026, areas: ["Games"], summary: "A zodiac-based interactive session designed around easing mental fatigue.", stack: ["JavaScript", "Canvas", "Web Audio", "IndexedDB"] },
  { slug: "relay", name: "RELAY", url: "https://relaypost.lovable.app", source: gh("relaypost"), kind: "hackathon", status: "live", year: 2026, areas: ["AI"], summary: "Reformats an X post for LinkedIn, Medium and Facebook, with approval before distribution.", stack: ["Lovable", "TanStack Start", "Supabase"] },
  { slug: "xunfollow", name: "XUnfollow", url: "https://xunfollow.xyz", source: gh("unfollow"), kind: "experiment", status: "live", year: 2026, areas: ["Productivity"], summary: "A local-first tool that finds X accounts that don't follow back, from your own archive.", stack: ["HTML", "CSS", "JavaScript"] },
  { slug: "daysago", name: "daysago", url: "https://daysago.vercel.app", source: gh("daysago"), kind: "experiment", status: "live", year: 2026, areas: ["Productivity"], summary: "Live counters showing exactly how many days have passed since a date.", stack: ["Next.js"] },
  { slug: "talentlane", name: "TalentLane", url: "https://talentlane.vercel.app", source: gh("Talentlane"), kind: "experiment", status: "live", year: 2026, areas: ["Productivity"], summary: "An interactive guide to the UK Global Talent visa route for designers.", stack: ["Next.js"] },
  { slug: "threadwise", name: "ThreadWise", url: "https://threadwise-app.vercel.app", source: gh("threadwise"), kind: "experiment", status: "live", year: 2026, areas: ["AI"], summary: "A smart-sourcing guide for marketplace shopping.", stack: ["Next.js"] },
  { slug: "pitchslap", name: "Pitchslap", url: "https://pitchslap.mojeeb.xyz", source: gh("pitchslap"), kind: "experiment", status: "live", year: 2026, areas: ["AI"], summary: "A pitch-focused feedback product.", stack: ["Next.js"] },
  { slug: "ghostforms", name: "Ghostforms", url: "https://ghostforms.mojeeb.xyz", source: gh("ghostforms"), kind: "experiment", status: "live", year: 2026, areas: ["SaaS"], summary: "A form-building product.", stack: ["Next.js"] },
  { slug: "splitstack", name: "SplitStack", url: "https://splitstack.blindspotlab.xyz", source: gh("splitstack"), kind: "experiment", status: "offline", year: 2026, areas: ["Developer tools"], summary: "A BlindspotLab developer utility.", stack: ["Next.js"], note: "Did not resolve from the audit environment on 2026-10-18. TODO(mojeeb): confirm." },
  { slug: "certstack", name: "CertStack", url: "https://certstack.vercel.app", kind: "experiment", status: "live", year: 2026, areas: ["SaaS"], summary: "A credential-focused product.", stack: ["Next.js"] },
  { slug: "queue", name: "QUEUE.", url: "https://tryqueue.vercel.app", source: gh("queue"), kind: "experiment", status: "offline", year: 2026, areas: ["SaaS"], summary: "A queue product built around the H0 hackathon. It was not submitted.", stack: ["Next.js"], note: "Returned 404 on 2026-10-18." },
  { slug: "ibm115", name: "IBM 115 · Remember When", url: "https://ibm115.vercel.app", source: gh("ibm115"), kind: "community", status: "archived", year: 2026, areas: ["Culture"], summary: "An independent community tribute collecting memories for IBM's 115th anniversary.", stack: ["Next.js", "Firebase", "Gemini"] },
  { slug: "polygon6", name: "Polygon 6", url: "https://polygon6years.vercel.app", source: gh("polygon6years"), kind: "community", status: "archived", year: 2026, areas: ["Web3", "Culture"], summary: "Find your first Polygon transaction and generate a sixth-anniversary card.", stack: ["Next.js", "Firebase", "Polygon"] },
  { slug: "ens9", name: "ENS9", url: "https://ens9.vercel.app", source: gh("ens9"), kind: "community", status: "archived", year: 2026, areas: ["Web3", "Culture"], summary: "Built to celebrate ENS’s ninth anniversary." },
  { slug: "signal-lost", name: "Signal Lost", url: "https://v0-signal-lost-game.vercel.app", source: gh("signal-lost"), kind: "community", status: "archived", year: 2026, areas: ["Games", "Web3"], summary: "A game design built in response to a Base network outage." },
  { slug: "zion-fan-card", name: "Zion Fan Card", url: "https://zion-fan-card.vercel.app", source: gh("zion-fan-card"), kind: "community", status: "archived", year: 2026, areas: ["Culture"], summary: "A celebration project for a single by Teni the Entertainer." },
  { slug: "study-free", name: "Study Free", url: "https://studyfree.vercel.app", source: gh("study-free"), kind: "public-interest", status: "archived", year: 2026, areas: ["Culture"], summary: "Turns useful public information into a lasting, usable product." },
  { slug: "coldopen", name: "ColdOpen", url: "https://coldopen-beta.vercel.app", source: gh("coldopen"), kind: "experiment", status: "archived", year: 2026, areas: ["Productivity"], summary: "Preserves useful cold-email material for lasting use." },
  { slug: "eminmeme", name: "Eminmeme", url: "https://eminmeme.vercel.app", source: gh("eminmeme"), kind: "community", status: "offline", year: 2026, areas: ["Culture", "Web3"], summary: "Built for HotEmin, a meme project on Avalanche.", note: "Returned 404 on 2026-10-18." },
  { slug: "eminuzzle", name: "Eminuzzle", url: "https://eminuzzle.vercel.app", kind: "community", status: "archived", year: 2026, areas: ["Games", "Web3"], summary: "A puzzle built for HotEmin, a meme project on Avalanche." },
  { slug: "promptledger", name: "PromptLedger", url: "https://promptledger-dec.vercel.app", source: gh("promptledger-decentralized-prompt-verification-registry"), kind: "experiment", status: "archived", year: 2026, areas: ["Web3", "AI"], summary: "A decentralised prompt verification registry." },
  { slug: "vibeathon", name: "30 Days Vibeathon", url: "https://vibeathon30days.vercel.app", source: gh("vibeathon30days"), kind: "experiment", status: "paused", year: 2026, areas: ["Culture"], summary: "A design-practice showcase: 4 of 30 builds completed." },
  { slug: "promptvault", name: "PromptVault", url: "https://promptvault.mojeeb.xyz", source: gh("promptvault"), kind: "experiment", status: "offline", year: 2026, areas: ["AI"], summary: "A prompt-focused product, currently on hold.", note: "Returned 404 on 2026-10-18." },
  { slug: "syncsurge", name: "SyncSurge", url: "https://syncsurge.xyz", source: gh("SyncSurge"), kind: "experiment", status: "offline", year: 2026, areas: ["SaaS"], summary: "A paused product build.", note: "Returned 404 on 2026-10-18." },
  { slug: "nullpay", name: "NullPay", url: "https://nullpay.blindspotlab.xyz", source: gh("nullpay"), kind: "experiment", status: "offline", year: 2026, areas: ["Web3"], summary: "A paused payments experiment.", note: "Did not resolve from the audit environment on 2026-10-18. TODO(mojeeb): confirm." },
  { slug: "moou", name: "MÓOU", source: gh("moou"), kind: "hackathon", status: "offline", year: 2026, areas: ["AI"], summary: "A strategy compiler built for the Bitget AI Hackathon. usemoou.xyz returned 404 on 2026-10-18." },
  { slug: "trench", name: "Trench", kind: "experiment", status: "offline", year: 2026, areas: ["Games", "Web3"], summary: "A gamified way to learn crypto slang. trench.mojeeb.xyz returned 404 on 2026-10-18." },
];

export const caseStudySlugs = projects.filter((p) => p.caseStudy).map((p) => p.slug);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

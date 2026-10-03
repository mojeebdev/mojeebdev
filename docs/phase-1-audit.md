# Phase 1 audit: mojeeb.xyz rebuild

Audited 2026-10-03. Every fact below is tied to a file or commit. Anything that isn't is marked **UNVERIFIED** or `TODO(mojeeb)`.

Repos read: `mojeebdev/mojeebdev` (this site), `mojeebdev/blindspotlab`, plus the public or owned repos behind the lead candidates: `mojeebdev/stackbrief`, `BlindspotLab-Limited/revel`, `mojeebdev/admon`, `mojeebdev/arcapush`, `mojeebdev/peerfix`, `mojeebdev/outship`.

---

## 1. Current repo map (`mojeebdev/mojeebdev`)

| Area | Finding |
|---|---|
| Framework | Next.js 16.1.2 App Router, React 19, TypeScript (`package.json`). No runtime dependencies beyond next/react/react-dom. |
| Routing | `/`, `/work`, `/projects`, `/projects/[slug]` (SSG for `selected` projects only), `/about`, `/approach`, `/contact`, `/ai`, `/experience`, `/blog`, `/builds` (`app/`). `/blog` and `/builds` are 5-line stubs. |
| Styling | Tailwind 3.4 is installed but barely used. About 1,900 lines of hand-written CSS across four files: `globals.css`, `portfolio-fixes.css`, `motion-system.css`, `dual-identity.css`. The file names describe their history: fixes layered on fixes. |
| Fonts | Freight Display Pro (self-hosted woff2, `lib/fonts.ts`). This is a commercial face, so check its licence before reusing it anywhere. |
| Motion | `components/MotionDirector.tsx` (271 lines) is a client-side IntersectionObserver director. |
| Content | **`lib/projects.ts` is the only real data layer**: 53 project records with status, category, snapshot and outcome. `lib/site.ts` holds the base URL and email. Hero, capability and milestone copy is hard-coded inside `components/EditorialPortfolio.tsx` and `components/RoutePage.tsx`. |
| SEO | Good bones: `lib/jsonLd.ts` (341 lines) has Person/WebSite/CollectionPage schema, `public/llms.txt`, `sitemap.xml`, `robots.txt`, and per-project `generateMetadata`. |
| OG images | One global image (`mojeeb-editorial-og.jpg`, 1200×630) and five static per-project images (Arcapush, Capself, SiteHook, StackBrief, Whate). Revel and Admon have none. Nothing is generated. |

**Reusable as data:** `lib/projects.ts` (the type and status taxonomy are good), `lib/jsonLd.ts` (schema builders), `lib/site.ts`, `public/llms.txt`, the OG images and the headshot.
**Throwaway:** all four CSS files, `EditorialPortfolio.tsx`, `RoutePage.tsx`, `MotionDirector.tsx`, `MobileNavigation.tsx` and the Freight font wiring. That markup belongs to the old design.

**Defects found in passing**
- `public/robots.txt` ends with a stray `# Winner` comment (commit `69264d0`). It's harmless to crawlers but reads oddly if anyone opens the file.
- The current site claims `146 indexed products` (Arcapush), `500+ downloads` (StackBrief) and `10,516 meals` (Whate). `lib/projects.ts` says these come from `MOJEEB-BUILD-INDEX.md`, **which isn't in any repo I can read.** They're your own statements dated July 2026, so two months stale. See TODOs.

## 2. Verifiable facts from blindspotlab and the lead repos

### Studio and person
- **BlindspotLab Limited**, RC 9855946, incorporated 14 Sep 2026, Nigeria (`blindspotlab/data/organization.ts`, "verified against the CAC Certificate").
- Founder: Mojeeb Titilayo. Education: BA (Education), History (`data/founder.ts`).
- **11 Anthropic Academy certificates**, each with a Skilljar verify URL (`data/certifications.ts`): Claude 101, Claude Code 101, Claude Code in Action, Building with the Claude API, MCP intro and advanced, Agent Skills, Subagents, AI Fluency, AI Capabilities and Limitations, and Claude Cowork.
- **3 npm packages** under `@blindspotlab`: `stackbrief`, `stylegraft` and `arcapush` (`data/developer-tools.ts`). Live download counts can be fetched; blindspotlab already does this in `/api/npm-stats`.
- Fixed-scope engagement tiers: Spark 3 days, Ship 10 days, Forge 21 days, plus Care and Evolve retainers, and a Web3 add-on for Base or Starknet (`data/editions.ts`). Founding and standard prices are in the same file.
- Archive: **31 project records** in `data/projects.ts`. Its README says "33 verified project records", so the README is stale. The "40+ products built" figure is labelled founder-reported, not verified (`data/projects.ts:reportedBuildCount`).

### Chains and deployed contracts

| Chain | Evidence | Status |
|---|---|---|
| **Monad Mainnet** (chain 143) | Admon V1 Genesis ERC-721 `0xb6aedBF17a11928A63773F88a9CfD3E252F43a63` (verified on Monadscan per README) and AdmonTrace V2 `0xCc3fc8b272bca9de775ba7399E3dD7fd7a0173b0`. Source is in `admon/contracts/`. EIP-712 server-signed mint authorisation. | **Verified address.** |
| **X Layer** (eip155:196) | Revel settles x402 payments in USDT0 on X Layer (`revel/lib/billing/okx-x402.ts`, `revel/stacks.md`). It accepts payment; it doesn't deploy a contract. | Integration verified. |
| **Base** | PeerFix USDC escrow (`peerfix/src/contracts/PeerFixEscrow.ts`, but the address comes only from the `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` env var and there's no `.sol` in the repo). Outship EAS attestations (schema UID env-only, uses the Base EAS predeploys). PullChain soulbound certs and CommitCar (blindspotlab stack data only). | **No address found.** TODO. |
| Robinhood Chain | AITAX (`data/projects.ts` stack: Solidity, Chainlink Data Streams). Private repo, not read. | **No address found.** TODO. |
| Polygon, Ethereum | FirstTx and Polygon 6 read chain history (Alchemy/Firebase). No contracts. | Read-only. |

So the honest "chains" line is: **2 verified mainnet contracts (Monad). Shipped integrations on Base, X Layer, Polygon and Ethereum.** It shouldn't say "deployed to 5 chains".

### Repo activity (commit counts on default branch, as of 2026-10-03)

| Repo | Commits | First, last | Visibility |
|---|---|---|---|
| arcapush | **573** | 2026-02-16 → 2026-10-01 | private |
| revel | 82 | 2026-07-04 → 2026-07-27 | public |
| blindspotlab | 53 | 2026-02-27 → 2026-09-27 | private |
| outship | 38 | 2026-09-16 → 2026-09-27 | public |
| peerfix | 26 | 2026-04-08 → 2026-07-31 | public |
| stackbrief | 20 | 2026-07-12 → 2026-07-21 (v1.1.2 released 07-18) | public |
| admon | 18 | 2026-07-18 → 2026-07-26 | public |
| mojeebdev (this site) | 68 | 2026-04-07 → 2026-09-07 | public |

### Prompt-engineering attribution (documented in repo, not inferred)
- **Revel** `stacks.md`: "Prompt Engineering by: Mojeeb Titilayo. Optimized by: Claude and Grok Build CLI." Covers site-grounding prompts, Zod quality gates and the Groq → OpenRouter → Gemini cascade.
- **Admon** `stack.md`: "Prompt Engineering: Mojeeb Titilayo; Prompt Optimization: Claude (Sonnet 5)". Note that Admon has **no runtime AI**; this credit refers to the build workflow.
- **BlindspotLab** `stacks.md`: says "Pending project-owner confirmation". → TODO.
- Every other AI build: no attribution on file. → TODO for each AI case study.

## 3. Full project table

Legend: **Site** is what `lib/projects.ts` says now. **BSL** is `blindspotlab/data/projects.ts`. ✅ means consistent, ⚠️ means conflict or stale, ❌ means missing.

| # | Project | Live URL (source) | Repo | Stack / chain (source) | On site now | Gap / stale |
|---|---|---|---|---|---|---|
| 1 | **Revel** | tryrevel.xyz (revel README) | BlindspotLab-Limited/revel (public, 82 commits) | Next 16, Supabase/Prisma 7, NextAuth, Groq→OpenRouter→Gemini cascade, MCP `/api/mcp`, OKX x402 on X Layer, OKX ASP agent #4750, Partner API (revel README, stacks.md) | Selected, one-line description, no OG, no stack | ⚠️ **Missing from BSL archive.** BSL README says the Revel logo is "not verified", but the Revel repo names you as author. README links `Blindspotlabxyz/revel`; the actual repo is `BlindspotLab-Limited/revel`. |
| 2 | **StackBrief** | stackbrief.peerfix.dev | mojeebdev/stackbrief (public) | TS monorepo of 7 packages (scanner, knowledge, intelligence, brief, cli, core, types), schema v2, Node ≥16.7, offline, no telemetry (README, CHANGELOG) | Selected with OG image, "500+ downloads July 2026" | ⚠️ Download figure stale; replace with live npm number. Origin "OpenAI Build Week 2026" (`JUDGES.md` confirms Build Week, result unknown). |
| 3 | **Admon** | admon.peerfix.dev | mojeebdev/admon (public) | Next 16, Prisma, Supabase, GitHub OAuth, viem/wagmi, 2 Solidity ERC-721s on **Monad Mainnet** with EIP-712 authoriser | Selected, outcome "Did not win" | ❌ Contracts not mentioned anywhere on the site. ❌ No OG image. Leading with "did not win" is accurate but wrong emphasis. |
| 4 | **Arcapush** | arcapush.com | mojeebdev/arcapush (private, 573 commits) | Next 16, Prisma 7 (35 models), PostgreSQL, NextAuth v5, Brevo, event-tracked `/go` redirect loop, CLI on npm (README) | Selected with OG image, "146 indexed July 28" | ⚠️ 146 is stale and unsourced in repo. Site says "Web3" category; the README doesn't support that. |
| 5 | BlindspotLab | blindspotlab.xyz | mojeebdev/blindspotlab (private) | Next 16, Gemini 2.5 Flash Lite `/audit`, Resend, Paystack, OpenNext/Workers prepared (stacks.md) | Selected | ✅ Add RC number and incorporation date as credibility. |
| 6 | Capself | capself.co | not accessible | Next, Supabase, Prisma, Auth.js, OpenRouter, Resend (BSL); Paystack webhooks (BSL README env) | Selected, "4 tiers Paystack" | ⚠️ Tier count unsourced in repo. |
| 7 | Whate | whate.app | — | Next, Prisma, Auth.js, Zustand, PWA (BSL) | Selected, "10,516 meals" | ⚠️ BSL says "10,000+" and "more than 10,000 recipes". Pick one. |
| 8 | SiteHook | sitehook.run (site) vs sitehook.blindspotlab.xyz (BSL) | mojeebdev/sitehook (private) | Next, Supabase, OpenRouter, Google Places (BSL) | Selected | ⚠️ **URL conflict**, and the description conflicts too (public SaaS vs internal tool). |
| 9 | PeerFix | peerfix.dev | mojeebdev/peerfix (public) | Next, Neon, Supabase, Prisma, wagmi, USDC escrow on Base (code) | Flagship group, "under consideration for repositioning" | ⚠️ No escrow address. |
| 10 | Outship | github.com/mojeebdev/outship | public, 38 commits | Next, Workers, D1 migrations, EAS on Base | ❌ **Not on site** | Newest active build (Sept 2026). |
| 11 | StyleGraft | stylegraft.peerfix.dev | mojeebdev/StyleGraft (public) | Node CLI on npm `@blindspotlab/stylegraft` | ❌ Not on site | Second published npm tool. |
| 12 | AITAX | aitax.fun | mojeebdev/aitax (private) | Workers, D1, Solidity, Robinhood Chain, Chainlink Data Streams | ❌ Not on site | BSL README lists the AITAX logo as "identity not verified" while `projects.ts` maps it. Confirm. |
| 13 | Roots and Relics by Moyo | rorebymoyo.vercel.app | roandrebymoyo/roandrebymoyo | Supabase, **pgvector**, Gemini, Telegram bot (RAG) | ❌ Not on site | Only verifiable RAG build. Origin is "Selected build". **Is this client work? Don't imply it until you confirm.** |
| 14 | MatchMind | app.matchmind.xyz | mojeebdev/matchmind (public) | Gemini, Google ADK, MongoDB Atlas | Index, "did not win" | ✅ |
| 15 | MÓOU | usemoou.xyz | mojeebdev/moou | — | Index | BSL featured product ("Strategy Compiler"). |
| 16 | CommitCar | commitcar.vercel.app (BSL) | mojeebdev/commitcar | Supabase, Solidity, Base, RainbowKit | "No public URL" | ⚠️ BSL has the URL; admon also has `/commitcar` route. |
| 17 | NAGIMU | nagimu.vercel.app (BSL) | mojeebdev/nagimu | Vanilla JS, Canvas, Web Audio, IndexedDB, SW | "No public URL" | ⚠️ BSL has the URL. |
| 18 | Polygon 6 | polygon6years.firsttx.xyz (site) vs polygon6years.vercel.app (BSL) | public | Firebase, Polygon | Archival | ⚠️ URL conflict. |
| 19 | FirstTx | firsttx.xyz | private | Alchemy, wagmi, Ethereum, Base | Index | ✅ |
| 20 | PullChain | pullchain.fun | public | Prisma, Privy, Solidity, Base (soulbound certs) | "unverified" | ⚠️ BSL lists it as studio-owned and live. No contract address. |
| 21 | Dearly | dearly.icu | private | Supabase, Gemini | Flagship group | ✅ |
| 22 | ArcaPrompt | arcaprompt.arcapush.com | public | Gemini (a prompt-engineering product) | Index | ✅ |
| 23 | PromptRank | promptrank.arcapush.com | public | Gemini, Upstash | Index | ✅ |
| 24 | RoastURL | roasturl.xyz | public | Gemini, Supabase | Index | ✅ |
| 25 | XUnfollow | xunfollow.xyz | mojeebdev/unfollow | Vanilla JS, local-first | Archival | ✅ |
| 26 | daysago | daysago.vercel.app | public | Next | Index | ✅ |
| 27 | IBM 115 | ibm115.vercel.app | public | Firebase, Gemini | Archival | ✅ |
| 28 | RELAY / RelayPost | relaypost.lovable.app | public | Lovable, TanStack, Supabase | Index | Name differs (RELAY vs RelayPost). |
| 29 | Abse | abse.base44.app | public | Base44, GitHub API | Index | ✅ |
| 30 | Trench | trench.mojeeb.xyz | — | Upstash | ❌ Not on site | |
| 31 | RIGYADH | rigyadh.buzz | public | Neon, Drizzle, viem | ❌ Not on site | |
| 32 | Beat Ballot | beatballot.space | public | Neon | ❌ Not on site | |
| 33 | Roadbook NG | roadbook.mojeebdev.workers.dev | public | Workers, OpenNext | ❌ Not on site | Public-interest build. |
| 34 | Arcapush CLI | npm `@blindspotlab/arcapush` | mojeebdev/arcapush-cli (public) | Node 22 | ❌ Not on site | Fold into the Arcapush case study. |
| 35–56 | ThreadWise, TalentLane, SplitStack, SyncSurge, Pitchslap, Ghostforms, NullPay, BSL Agents, ScopeAI, MicroOracle, Solopr, QUEUE., CertStack, Director-X, NFT Executive, DBB, AngelVow, PromptLedger, ENS9, Zion Fan Card, Study Free, ColdOpen, Eminuzzle, Eminmeme, Bearo, Signal Lost, 30 Days Vibeathon | as in `lib/projects.ts` | most have public repos | — | On site in groups | Keep in the secondary index as-is. Not in BSL archive, so no new facts. |

## 4. Lead set: four deep case studies

Picked for **buyer-facing evidence**: public code, a running product, non-trivial architecture, and a fact a serious buyer can verify in under a minute.

1. **Revel**: *AI product + agent infrastructure + payments.* It's a public repo with 82 commits. It has a multi-provider LLM cascade with quality gates, an MCP server, x402 paid tools settling on X Layer, a listed OKX marketplace agent (#4750) and a Partner API. Prompt engineering is attributed to you in the repo. This is the strongest single proof for AI buyers.
2. **StackBrief**: *open-source developer tooling.* It's a published npm CLI (v1.1.2) built as a 7-package monorepo with a versioned schema, fully offline and evidence-cited. **It's the interactive-card candidate**: I ran the real CLI against this repo in the sandbox, so the card can show the visitor real briefs generated by the actual tool, not a mockup.
3. **Admon**: *onchain systems.* It has two Monad Mainnet ERC-721 contracts with addresses (V1 verified), EIP-712 server-authorised minting and GitHub-OAuth anti-impersonation. It's the only verified-address chain work, so it's what a protocol lead clicks.
4. **Arcapush**: *sustained platform engineering.* 573 commits over 7.5 months, 35 Prisma models, a first-party event loop (`IMPRESSION → VIEW → OUTBOUND_CLICK`) and a companion CLI on npm. It answers "do they maintain things, or just launch them?"

Optional fifth: **BlindspotLab** as the studio frame (a registered company, a Gemini audit route and fixed-scope tiers). I'd put it in the conversion block rather than as a case study.

Everything else goes into a compact, filterable secondary index (about 50 entries).

## 5. TODO(mojeeb) list

1. **Arcapush:** current indexed-product count, with date. The site's 146 figure is from July and isn't in any repo.
2. **StackBrief:** OK to replace "500+" with live npm downloads fetched at build time? Also, the Build Week result, if any.
3. **Whate:** pick 10,516 or "10,000+".
4. **SiteHook:** canonical URL (`sitehook.run` or `sitehook.blindspotlab.xyz`), and is it a public SaaS or an internal tool?
5. **Polygon 6:** canonical URL.
6. **Revel:** why is it missing from the BlindspotLab archive? Is OKX agent #4750 still listed? Any usage numbers you can stand behind?
7. **Contract addresses:** PeerFix escrow (Base), PullChain certificates (Base), CommitCar (Base), AITAX (Robinhood Chain). Without these, Base can't be claimed as "deployed to".
8. **Prompt-engineering credit** for Arcapush (if it has AI features), Capself (OpenRouter), Dearly (Gemini), SiteHook (OpenRouter), BlindspotLab `/audit` (Gemini), and Roots and Relics.
9. **Roots and Relics by Moyo:** client engagement or your own build? This decides whether it can be framed as client work.
10. **Rates:** show BlindspotLab tier pricing on the portfolio, or keep pricing off and say "fixed-scope, quoted per engagement"?
11. **Contact:** `hello@mojeeb.xyz` (site) or a booking link? Is there a calendar URL?
12. **Experience claims** in README ("12+ years Web2 marketing, 4+ years Web3"): no file evidence. Keep them as your stated bio, or drop them?
13. **Freight Display Pro licence:** only matters if you want to keep it anywhere. The new design won't use it.

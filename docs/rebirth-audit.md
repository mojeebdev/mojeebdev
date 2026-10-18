# Rebirth audit: mojeeb.xyz

Audited 2026-10-18. This document updates `docs/phase-1-audit.md` (2026-10-03) for the "Rebirth" brief. Every fact has a source. Anything not verified is marked **UNVERIFIED** or `TODO(mojeeb)`.

## 0. Inputs and how they were handled

| Input | Status | What I did |
|---|---|---|
| Three reference screenshots (A, B, C) | Received mid-build (in chat) | `DESIGN.md` records the observed reference read and the preserve/adapt/exclude decisions. |
| Leopard character sheet | Received in chat; **not available as a file** | Redrawn faithfully as a layered SVG rig (`components/mascot/Leopard.tsx`) using the sheet's palette, outlines, rosettes, cream bib and ringed tail. **v1 redraw, pending approval.** Source artwork can replace it. |
| Official portrait (cream cap, crossed arms) | Shown in chat; **not available as a file** | The pipeline is ready in `content/site.ts`: circular focal point and zoom, the full composition for `/about`, and AVIF/WebP through `next/image`. Commit the original as `public/portrait/mojeeb-official.jpg` and set `USE_OFFICIAL_PORTRAIT = true`. Until then the 2026-10-15 profile avatar is used. |
| Live product screenshots | Chromium in the build sandbox can't complete TLS through the egress proxy | Case studies use technical diagrams drawn from source, plus OG art. `TODO(mojeeb)`: product screenshots. |
| Guestbook database | No credentials in this session | Supabase REST adapter, SQL migration (`supabase/guestbook.sql`) and setup guide (`docs/guestbook.md`). Production shows "not connected" until env vars are set. |
| Live mojeeb.xyz landing page | Captured 2026-10-18 | `docs/before/`. It states "Available for selected work", which is reused as the subtle availability line. |

## 1. Repository baseline

- Next.js **16.1.2**, React 19, TypeScript, Tailwind 3.4 (installed but barely used), and about 1,900 lines of custom CSS across `globals.css`, `portfolio-fixes.css`, `motion-system.css` and `dual-identity.css`.
- Deployment: **Vercel** (the Vercel bot comments on PRs; `vercel.app` preview URLs).
- Baseline build passes: 20 static pages. Home ships **179 KB gzipped JS** and **12.5 KB gzipped CSS**.
- Content model: `lib/projects.ts` (53 records). JSON-LD: `lib/jsonLd.ts`. Static `public/sitemap.xml`, `robots.txt`, `llms.txt`.
- GitHub profile (`README.md`, `profile/`, `.github/workflows/profile-*.yml`), merged in PR #4 on 2026-10-15. **Preserved untouched.**
  - `profile/stats.json` holds the real trailing-year contribution calendar (3,180 contributions, 68 public repos), refreshed weekly by `profile-update.yml` using GitHub's built-in token. The activity heatmap reuses this file.
- `public/design-previews/` (Phase 2 prototypes) is removed in this rebuild because the direction has been superseded.

### Keep
- `lib/projects.ts` taxonomy, rewritten as typed content in `content/`.
- `lib/jsonLd.ts` patterns: Person, WebSite, Organization.
- `lib/site.ts`, `public/llms.txt` (updated), and the project OG images.
- The headshot. The newer `profile/avatar.png` (2026-10-15) becomes the circular portrait.

### Remove
- All four CSS files and `EditorialPortfolio`, `RoutePage`, `MotionDirector`, `MobileNavigation`, `ProjectArchive` and `ProjectPrimitives`.
- The Tailwind config, whose colours belong to an older palette.
- **Freight Display Pro** woff2 files. This is a commercial typeface with no licence file in the repo, so it is removed from use and from the repo.

### Defects fixed
- `robots.txt` stray `# Winner` comment.
- The static sitemap was frozen at 2026-07-29. It's replaced by `app/sitemap.ts`.
- The manifest used a 1086×1448 PNG as an icon.

## 2. Inbound URLs, all preserved

| Old URL | New behaviour |
|---|---|
| `/`, `/work`, `/projects`, `/about`, `/contact`, `/llms.txt` | Kept |
| `/projects/{arcapush,stackbrief,revel,admon}` | 308 → `/work/{slug}` (case studies) |
| `/projects/{blindspotlab,sitehook,capself,whate}` | 308 → `/projects#{slug}` (archive entries) |
| `/experience` | 308 → `/about#experience` |
| `/approach` | 308 → `/about#daeto` |
| `/ai` | 308 → `/work` |
| `/blog` | 308 → `/writing` |
| `/builds` | 308 → `/projects` |

## 3. Verified facts

### Identity
- Mojeeb Titilayo, founder of **BlindspotLab Limited**. RC 9855946, incorporated in Nigeria on **2026-09-14** (`blindspotlab/data/organization.ts`, "verified against the CAC Certificate").
- Lagos, Nigeria (commit `ee5de37`, and the profile README).
- Contact (profile README, 2026-10-15): hello@mojeeb.xyz, mojeeb@blindspotlab.xyz, github.com/mojeebdev, x.com/MojeebMotion, linkedin.com/in/tmojeeb, blindspotlab.xyz.
  - Devpost and YouTube appeared only on the old site and aren't in the current profile, so they're dropped pending confirmation.
- Building Arcapush since **February 2026**: first commit `2026-02-16`, 573+ commits, last push 2026-10-01 at the time of the first audit.
- Availability: the live site (2026-10-18) states "Available for selected work", so the line is reused subtly in the hero. `TODO(mojeeb)`: confirm it is still current.

### npm packages (registry and downloads API, fetched 2026-10-18)

| Package | Latest | First published | Last 7 d | Last 30 d | Since publication* | Licence | Source |
|---|---|---|---|---|---|---|---|
| `@blindspotlab/arcapush` | 0.2.4 (2026-10-08) | 2026-08-16 | 58 | 873 | 1,384 | Apache-2.0 | mojeebdev/arcapush-cli |
| `@blindspotlab/stackbrief` | 1.1.2 (2026-07-18) | 2026-07-12 | 5 | 64 | 807 | MIT | mojeebdev/stackbrief |
| `@blindspotlab/stylegraft` | 0.1.1 (2026-08-10) | 2026-08-10 | 11 | 67 | 372 | MIT | mojeebdev/StyleGraft |
| `@blindspotlab/didcore` | 0.1.1 (2026-08-24) | 2026-08-24 | 1 | 50 | 370 | MIT | mojeebdev/didcore |

\* npm's range API, summed from 2026-01-01. Every package was first published after that date, so the sum covers its whole life. The site fetches all of these live, server-side, with a 6-hour cache; the table is a snapshot.

- **didcore** is an onboarding wrapper around the third-party `zunmax/technocore-did-starter`. It belongs in the tools archive as a wrapper, not as a flagship or an original tool.
- The old site's "500+ StackBrief downloads" claim is superseded by live numbers.

### Arcapush public metrics (`https://arcapush.com/api/hero-metrics`, live, with definitions and `refreshedAt`)
Snapshot 2026-10-18:
- 333 builds indexed (326 products, 5 agents, 2 hackathon)
- 184 builders
- 5,354 visits since 2026-08-19, when recording began
- 2,602 clicks to builds since 2026-08-15

**Founder-reported figures from the brief** (40+ projects, 300+ indexed builds, 22K+ all-time platform visits, 22K+ listing visits, 9K+ attention delivered) use different and undocumented collection windows. The public counter says visits "since 19 Aug 2026, when visit recording began", so the 22K+ all-time figure must come from another source.
- They are shown separately, labelled "founder-reported, Oct 2026", and never summed with or relabelled as the public counters.
- `TODO(mojeeb)`: name the source and window for 22K / 22K / 9K.

### Case-study evidence

| Project | Ownership | Status | Evidence |
|---|---|---|---|
| Arcapush | BlindspotLab studio product | Live | arcapush.com (200), public metrics API, CLI on npm, 35 Prisma models, `/go` event loop |
| StackBrief | Open source (MIT) | v1.1.2, maintained | npm, public repo, 7-package monorepo, schema v2; JUDGES.md for OpenAI Build Week (result unknown) |
| StyleGraft | Open source (MIT) | v0.1.1 | npm, public repo; a skills-only plugin with a published DESIGN.md schema |
| Revel | BlindspotLab studio product (`BlindspotLab-Limited/revel`) | Live (tryrevel.xyz, 200) | README: Groq → OpenRouter → Gemini cascade, MCP `/api/mcp`, x402 on X Layer, OKX agent #4750; prompt engineering credited to Mojeeb in `stacks.md` |
| Admon | Monad hackathon submission, continued after it | Live | Two Monad Mainnet ERC-721 contracts: V1 `0xb6ae…3a63` (verified) and V2 `0xCc3f…73b0`. On 2026-10-03, `totalSupply()` read 6 |
| AITAX | Paid client engineering (per brief) | **Pre-release.** README: "no contract is deployed and live staking is hard-disabled" | 123 commits 2026-09-09 → 09-18, Cloudflare Workers + D1 + R2 + Durable Objects, Solidity accounting core with adversarial tests, Chainlink V3 adapter. The mascot and visual system were supplied by the client |

AITAX framing: Mojeeb's role was engineering. Brand, mascot and token belong to the client. No live-value claims. The status is stated exactly as the README gives it.

### Lab candidates
- **Ratssacre**: browser night-vision precision game at ratssacre.lol (200). Private repo, 22 commits 2026-09-27 → 09-30, Vite + Cloudflare Worker + D1. Linked without source.
- **Outship**: outship.dev (200) and word.outship.dev (200). Public repo. EAS attestations on Base.
- The original lab piece is a **repository constellation**: a force-directed graph of real StackBrief scan output from `mojeebdev/outship`, rendered with a hand-written canvas force simulation.

### URL corrections since the first audit
- SiteHook: `sitehook.run` is live (200). `sitehook.blindspotlab.xyz` doesn't resolve. **Canonical: sitehook.run.**
- Polygon 6: both URLs return 200. I kept `polygon6years.vercel.app` from the BlindspotLab data.
- CommitCar (`commitcar.vercel.app`) and NAGIMU (`nagimu.vercel.app`) are both live, contrary to the old site.
- **Dead:** usemoou.xyz (404), trench.mojeeb.xyz (404). They're marked offline in the archive.

## 4. Unsupported claims removed
- "500+ StackBrief downloads", "146 indexed products" and "10,516 meals": these came from an unavailable `MOJEEB-BUILD-INDEX.md` and are replaced by live data or removed.
- "12+ years Web2 / 4+ years Web3": self-reported and outside the brief's fact list, so omitted from public copy. `TODO(mojeeb)`: confirm if wanted.
- "Built and shipped 40+ … across 70 repositories" (llms.txt): replaced with the founder-reported 40+ (labelled) and the live public-repo count.

## 5. Design plan (detail in `DESIGN.md`)
- References are synthesised as follows:
  - **A:** centred circular portrait, light type, bordered stat strip.
  - **B:** blue heatmap and grouped tool icons.
  - **C:** Swiss left sidebar, monochrome and long-form.
- Fonts: Hanken Grotesk (OFL), Instrument Serif italic accents (OFL), and IBM Plex Mono for data (OFL). All self-hosted.
- One Three.js scene, the intro only, dynamically imported and never on other routes.

## 6. Mid-build changes requested and applied
- **All-time npm downloads** lead each package card. The site-wide npm figure is all-time downloads of the three tools. 30-day and 7-day figures remain alongside.
- **Intro refinement:** greet ("Say hi to the leopard.") → high five ("High five? Tap the paw.", wink, open smile, raised paw, tilt and bounce, generous paw hit area) → burst and reveal in about 1.5 s. The intro is marked seen as soon as it shows; Enter/Space act on the current step, Esc skips, and there is a double-tap guard.
- **Founder and creator identity:** the hero reads "Founder of BlindspotLab. Creator of Arcapush." and then "Also behind StackBrief, StyleGraft, and the Arcapush CLI." (npm links). Arcapush leads the social proof and gets a flagship section ahead of the npm tools.

### Metric verification (2026-10-18)

| Metric | Shown as | Source |
|---|---|---|
| Builds indexed: 333 | Live | Arcapush public API (supersedes the founder figure of 300+) |
| Builders: 184 | Live | Arcapush public API |
| Platform visits since 19 Aug 2026: about 5.36K | Live, labelled with its start date | Arcapush public API |
| Outbound attention (clicks to builds) since 15 Aug 2026: 2,602 | Live, labelled with its start date | Arcapush public API |
| 22K+ all-time platform visits | Founder-reported, dated Oct 2026 | **Not publicly verifiable**; the window predates public recording |
| 22K+ listing visits | Founder-reported, dated Oct 2026 | **Not publicly verifiable**; no public endpoint |
| 9K+ attention delivered | Founder-reported, dated Oct 2026 | **Not publicly verifiable**; a longer window than the public counter |
| 40+ projects | Founder-reported | 56 documented in the archive |

These figures are never summed together, and outbound attention is never labelled as unique visitors.

## 7. QA results (production build, 2026-10-18)
- `eslint .` clean (eslint-config-next 16 flat config). `tsc --noEmit` clean. `next build` passes (32 routes).
- **axe-core** (WCAG 2.0/2.1 A/AA plus best practice): no violations on 14 pages in light mode, or on 5 key pages in dark mode.
- No horizontal overflow at 390 px or 1440 px on any page.
- **Weight:**
  - Homepage JS: 186 KB gzipped (was 179 KB). CSS: 11.0 KB gzipped (was 12.5 KB).
  - Three.js: a 134 KB gzipped chunk loaded only by the intro, after first paint.
  - Fonts self-hosted; the portrait has `priority` for LCP.
- Redirects return 308 for every old URL. Security headers are set. Generated OG images are 1200×630.

## 8. Open TODO(mojeeb)
1. Approve the SVG leopard redraw, or supply the original character artwork as files (SVG/PNG layers).
2. Commit the official portrait as `public/portrait/mojeeb-official.jpg` and flip `USE_OFFICIAL_PORTRAIT`.
3. Guestbook: superseded by Cloudflare D1. Activation steps are in `docs/cloudflare-migration.md` §10 and `docs/guestbook.md`.
4. Source and window for the founder-reported Arcapush figures (22K / 22K / 9K).
5. Confirm "Available for selected work" (taken from the live site) is still current.
6. Confirm LinkedIn, Devpost and YouTube.
7. Product screenshots for the case studies.
8. Revel usage figures, if any can be published.
9. Real `/now` entries and writing in your own words. The pages currently list repo-sourced activity and existing technical docs.

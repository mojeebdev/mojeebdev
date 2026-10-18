# mojeeb.xyz: Vercel → Cloudflare Workers migration

Prepared 18 Oct 2026 on branch `ccr-18b85d6d-ow5shw`, after PR #5 (the portfolio rebuild) merged into `main` as `89e60c3`.

**State of play:** everything that can live in the repository is done and verified locally in the Workers runtime (workerd via Wrangler). **Update (D1 created):** the D1 database `mojeeb-guestbook` (`2e23fc7f-db68-4044-b226-283e1e2cc07f`, WEUR) now exists and is bound as `DB` in `wrangler.jsonc`, with `account_id` pinned. Its schema is **not yet applied remotely**. There is still no Worker and no secret. No DNS record or domain has changed, and nothing has been deployed. The live site keeps running on Vercel, unchanged, until you complete the cutover below.

## Contents

1. [Audit](#1-audit)
2. [Vercel dependency inventory](#2-vercel-dependency-inventory)
3. [Compatibility matrix](#3-compatibility-matrix)
4. [Adapter decision](#4-adapter-decision-vinext)
5. [What changed in the repository](#5-what-changed-in-the-repository)
6. [Cloudflare configuration](#6-cloudflare-configuration)
7. [Guestbook on D1](#7-guestbook-on-d1)
8. [Performance, caching and observability](#8-performance-caching-and-observability)
9. [Deployment workflow](#9-deployment-workflow-workers-builds)
10. [Commands for you](#10-commands-for-you)
11. [Cloudflare dashboard setup](#11-cloudflare-dashboard-setup)
12. [Cutover plan](#12-cutover-plan)
13. [Rollback strategy](#13-rollback-strategy)
14. [Risks](#14-risks)
15. [Staged Vercel retirement](#15-staged-vercel-retirement-after-cutover-only)
16. [QA results](#16-qa-results)
17. [Migration checklist](#17-migration-checklist)

---

## 1. Audit

### Repository

| Item | Finding |
| --- | --- |
| Branch / PRs | PR #5 merged at 18:24 UTC. This branch was restarted from `origin/main` (`89e60c3`) for this work. There were no uncommitted changes. |
| Framework | Next.js **16.1.2**, App Router, React 19.2, TypeScript, no Tailwind. 13 pages, 2 layouts, 5 route handlers, `sitemap.ts`, `robots.ts`, `manifest.ts`, 3 `opengraph-image`/`twitter-image` routes, `not-found.tsx`. |
| Security | `npm audit` flagged **critical/high advisories in next@16.1.2**, which is what production runs today (Server Components DoS, middleware bypasses, image optimizer SSRF/RCE, cache poisoning; all fixed by ≤16.3.8). Upgraded to **next@16.4.2** (semver-minor). |
| Server data | npm registry and downloads API, and the Arcapush public metrics API: server `fetch` with `next.revalidate`. GitHub activity is read from the committed `profile/stats.json`, which the profile workflow refreshes. There are no runtime GitHub API calls and no rate-limit exposure. |
| Client-heavy code | Three.js (`components/den/denScene.ts`), dynamically imported only by the intro, after first paint. The heatmap, constellation and mascot are plain React/SVG. |
| Images | `next/image` for the portrait and logos. `images.formats` avif/webp. |
| Fonts | `next/font/local` (Hanken Grotesk, Instrument Serif, IBM Plex Mono, woff2 in `app/fonts`). |
| Filesystem at runtime | `lib/og.tsx` read fonts and the portrait with `fs.readFile`, which is **incompatible with Workers**. Fixed (see §5). |
| Guestbook | Supabase REST adapter plus an in-memory dev store. Never provisioned: the Vercel project has **no environment variables at all**, so production showed "not connected". |
| Env vars | Only the guestbook's: `SUPABASE_*`, `GUESTBOOK_*`. None are set anywhere. No `NEXT_PUBLIC_*`. |
| Vercel config in repo | **None**: no `vercel.json`, no `@vercel/*` packages, no Vercel GitHub Actions. |
| GitHub Actions | `profile-update.yml` (weekly profile SVG refresh, commits to `main`) and `profile-stats-check.yml`. Neither deploys anything. **Both are untouched.** |

### Live hosting (read-only checks)

- **Vercel project** `mojeeb` (team `mojeebs-projects`, framework `nextjs`, Node 24.x). Git-connected, so every push to `main` deploys production. Domains: `mojeeb.xyz` (production), and `www.mojeeb.xyz` → **308 to `mojeeb.xyz`**, so the apex is canonical and that policy is kept. Preview deployments sit behind Vercel SSO ("all except custom domains"). Project environment variables: none.
- **DNS is hosted by Vercel.** The nameservers are `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. Public records:

| Name | Type | Value |
| --- | --- | --- |
| `mojeeb.xyz` | A | 216.198.79.65, 64.29.17.1 (Vercel) |
| `www` | A | 64.29.17.65, 216.198.79.65 (Vercel) |
| `mojeeb.xyz` | MX | 10 mx.zoho.com, 20 mx2.zoho.com, 30 mx3.zoho.com |
| `mojeeb.xyz` | TXT | `v=spf1 include:zohomail.com include:spf.improvmx.com ~all` |
| `mojeeb.xyz` | TXT | `google-site-verification=…`, `openai-domain-verification=…`, `zoho-verification=…` |
| `zmail._domainkey` | TXT | Zoho DKIM key |
| `mojeeb.xyz` | CAA | letsencrypt.org, pki.goog, sectigo.com |

No `_dmarc` record was found. This list comes from public lookups of known names, so it may be incomplete. **Export the full zone from Vercel before changing anything** (cutover step 14).

Consequence: a Workers Custom Domain requires the domain to be an **active zone on your Cloudflare account**. The cutover therefore includes moving DNS hosting from Vercel to Cloudflare. That move is the riskiest step, and it is planned in detail in §12.

## 2. Vercel dependency inventory

| Dependency | Type | Status after this PR | Removal |
| --- | --- | --- | --- |
| Vercel hosting, builds and Git deployment of `main` | Hosting | **Still active, deliberately**: keeps the live site up until cutover. `next build` keeps passing on this branch. | Disconnect Git after cutover (§15). |
| Vercel DNS (nameservers) | DNS | Active. | Move the zone to Cloudflare during cutover (§12). |
| Vercel-managed TLS for the apex and www | Hosting | Active. | Replaced by Cloudflare certificates when the custom domains attach. |
| `www` → apex 308 redirect (Vercel domain setting) | Hosting | Active. | Re-created on Cloudflare (§12, step 15). |
| Vercel preview deployments and the "Vercel Preview Comments" PR check | Hosting | Active. | Replaced by Workers Builds preview URLs; disappears when Git is disconnected. |
| Vercel Image Optimization (`/_next/image` on Vercel) | Hosting | Active on Vercel. | Replaced by the Cloudflare Images binding (verified locally). |
| Vercel ISR cache / CDN | Hosting | Active on Vercel. | Replaced by vinext ISR (see §8). |
| `vercel.json`, `@vercel/analytics`, `@vercel/speed-insights`, Vercel cron, KV/Blob/Postgres | — | **Not present.** Nothing to remove. | — |
| `@vercel/og` | npm package, **not** hosting | Kept. It is the library behind `next/og` (Satori + resvg) and vinext depends on it; it runs on Workers. | Keep. |
| `vercel.app` URLs in `content/` and in the audit | Content | Kept. These are live URLs of *other* projects (CommitCar, NAGIMU, Polygon 6). | Keep. |
| "Vercel" in `content/tools.ts`, case studies and the profile SVGs | Content | Kept. Factual stack descriptions of past projects. | Keep. |

Ordinary Next.js APIs (`next/link`, `next/image`, `next/font/local`, `next/og`, `next/cache`, `next/headers`, the Metadata API, route handlers, ISR) are **not** Vercel dependencies and are all kept.

## 3. Compatibility matrix

The "Verified" column says how each row was checked. "workerd" means the vinext production build was served by `wrangler dev` (the same runtime as production Workers) and exercised over HTTP or in Chromium.

| Feature | Used for | vinext on Workers | Verified | Notes |
| --- | --- | --- | --- | --- |
| App Router, nested layouts | all pages | ✅ | workerd: all 18 page routes return 200; 404 for unknown paths | |
| React Server Components / SSR / streaming | all pages | ✅ | workerd | |
| React 19 | — | ✅ (vinext requires ≥ 19.3.1) | upgraded 19.2.6 → 19.3.1; `next build` and vinext both pass | |
| Static generation / ISR (`revalidate`) | `/` (6 h), `/activity`, `/work/[slug]` | ✅ (stale-while-revalidate, in-isolate cache) | workerd: `X-Vinext-Cache: HIT` on repeat, `s-maxage=1800` | Per-isolate cache; see §8. |
| `generateStaticParams`, dynamic `[slug]` | case studies | ✅ | workerd: 6 slugs 200, unknown slug 404 | |
| Route handlers | guestbook API | ✅ | workerd plus local D1, full flow | |
| Metadata API, JSON-LD, `sitemap.ts`, `robots.ts`, `manifest.ts` | SEO | ✅ | workerd: titles, sitemap (17 URLs), robots, manifest | |
| `next/og` (`opengraph-image`, `twitter-image`) | social cards | ✅ after fix | workerd: 3 routes return 1200×630 PNG, inspected visually | Needed fonts and avatar inlined (no `fs` on Workers). |
| `next.config` `redirects()` | 14 legacy URLs | ✅ | workerd: 7 sampled, 6 × 308 and the headshot alias 307 (as configured) | |
| `next.config` `headers()` | security headers | ✅ after fix | workerd: 6/6 headers on pages and APIs | vinext doesn't match `/` against `/:path*`, so an explicit `/` rule was added. |
| `next/image` | portrait, logos | ✅ with Cloudflare Images binding | workerd: `/_next/image` returns AVIF 5.5 KB (from a 292 KB PNG) | Without the binding, images are served unresized. |
| `next/font/local` | 3 families | 🟡 runtime `@font-face`, no fallback metrics | workerd: fonts preloaded via `Link` headers and rendered | Slightly more layout shift risk than Next's adjusted fallbacks; not visible in tests. |
| npm data fetching (`fetch` + revalidate) | metrics, package cards | ✅ | workerd: live all-time counts rendered (807 / 372 / 1,384) | |
| Client Three.js (lazy) | intro scene | ✅ | workerd plus Chromium (SwiftShader WebGL): intro suite passes | |
| `cloudflare:workers` bindings (D1, rate limiter) | guestbook | ✅ | workerd with local D1 | Accessed only in server code, through `lib/server/bindings.ts`. |
| Server-side validation, Web Crypto | guestbook | ✅ | 34 unit tests plus workerd | |
| `instrumentation.ts` `onRequestError` | error logs | ✅ (vinext supports it) | build | |
| `turbopack.root` in `next.config` | Next dev only | ignored by vinext | `vinext check` | Harmless. |
| Cache Components / PPR / `"use cache"` | — | not used | — | vinext's main known gap; irrelevant here. |

`vinext check` against the real code: **95% compatible, 0 issues** (17 supported, 2 partial: `images`, `turbopack`).

## 4. Adapter decision: vinext

The Cloudflare guide now recommends **vinext** as the default way to run Next.js on Workers, with OpenNext for apps blocked by a vinext gap. This app uses nothing in vinext's gap list (no Cache Components/PPR, no middleware, no server actions, no native modules at runtime), and every feature it does use was verified in workerd. **OpenNext was therefore not needed.** If a future vinext release regresses, `@opennextjs/cloudflare` (1.20.x) is the fallback. It consumes `next build` output, which still passes on this branch, so switching would mean changing build scripts and config, not application code.

vinext 1.2.1 defaults to a new typed `cloudflare.config.ts` with the `cf` CLI. Because you asked for Wrangler, `vinext init` was run with `--legacy-wrangler-cloudflare-init` (Wrangler 4.151, `@cloudflare/vite-plugin` 1.64). The migration is additive: `next dev` and `next build` still work, which is what keeps the Vercel site deployable until cutover.

## 5. What changed in the repository

**Added**
- `vite.config.ts`: vinext, the Cloudflare Vite plugin (RSC env in workerd), the Images optimizer, and an alias that swaps in the Workers bindings module.
- `wrangler.jsonc`: Worker `mojeeb-xyz` (see §6).
- `migrations/0001_guestbook.sql`: D1 schema.
- `lib/server/bindings.ts` (Node stub, used by `next build`), `lib/server/bindings.workers.ts` (reads `env` from `cloudflare:workers`), `lib/server/types.ts` (the D1 and rate-limit types used), `lib/server/log.ts` (structured logs), `lib/server/cloudflare-workers.d.ts`.
- `lib/guestbook/access.ts` (Cloudflare Access JWT verification), `lib/guestbook/server.ts` (activation state, moderator auth, no-store responses), `components/guestbook/GuestbookFeed.tsx` (pagination).
- `instrumentation.ts` (`onRequestError` → Workers Logs).
- `components/ui/Icon.tsx`, `components/ui/SocialLinks.tsx`.
- `scripts/og-assets.mjs` and the generated `lib/og-assets.generated.ts` (inlined OG fonts and a 176 px avatar).
- `tests/*`, `vitest.config.ts` (34 tests), `.dev.vars.example`, `worker-configuration.d.ts` (`npm run cf-typegen`).
- `docs/cloudflare-migration.md` (this file).

**Changed**
- Guestbook: store rewritten for D1, all routes, `/guestbook` (dynamic, paginated), the homepage preview (client fetch), the admin UI (Access-aware), the form (pending-activation notice), and `security.ts` (Web Crypto, expiring signed admin cookie, `CF-Connecting-IP`).
- `lib/og.tsx`: no filesystem access.
- `next.config.ts`: explicit `/` header rule.
- `lib/data/npm.ts`, `lib/data/arcapush.ts`: log failed upstream fetches.
- Hero (GitHub icon + label + external arrow; tighter desktop spacing), sidebar, mobile sheet, About and Contact social links (icon + text).
- `package.json`: scripts and dependencies (below). `tsconfig.json` and `eslint.config.mjs` ignore build output. `.gitignore` ignores `.dev.vars`, `.wrangler/` and `.vinext/`.
- `docs/guestbook.md`: rewritten for D1.

**Removed**
- `supabase/guestbook.sql` and the Supabase adapter (never provisioned; no data).
- `.env.example`, replaced by `.dev.vars.example`.

**Dependencies**

| Change | Packages |
| --- | --- |
| Upgraded | `next` 16.1.2 → **16.4.2** (security), `eslint-config-next` → 16.4.2, `react` / `react-dom` → **19.3.1** (vinext peer requirement) |
| Added (runtime) | `@vinext/cloudflare` (Images optimizer and deploy CLI), `react-server-dom-webpack` (RSC on Vite) |
| Added (dev) | `vinext`, `vite` 8, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`, `@cloudflare/vite-plugin`, `wrangler`, `vitest` |
| Removed | none (there were no Vercel packages) |

Remaining `npm audit` findings (no fix available upstream): `braces` / `micromatch` (via eslint-config-next and vinext's dev-time CommonJS plugin; build tooling only), and `fflate` inside `satori` (it only unzips its own bundled data). None of these is reachable from visitor input.

**Scripts**

| Script | What it does |
| --- | --- |
| `dev` / `build` / `start` | Next.js, unchanged. Vercel keeps using `build` until cutover. |
| `dev:vinext` | Vite dev server on :3001, with the RSC environment running in workerd. |
| `build:vinext` | Production Workers build into `dist/` (`dist/server/wrangler.json` is the deployable config). |
| `preview` | Build, then serve the real Worker locally with `wrangler dev` (:8787), using a local copy of D1. |
| `deploy` | `vinext-cloudflare deploy --config dist/server/wrangler.json` (build plus Wrangler deploy). Only after setup. |
| `deploy:check` | Dry run: validates setup without building or deploying. |
| `cf-typegen` | Regenerates `worker-configuration.d.ts` from `wrangler.jsonc`. |
| `db:migrate:local` | Applies D1 migrations to the local copy. |
| `test`, `typecheck`, `lint`, `og:assets` | Vitest; `next typegen && tsc --noEmit` (vinext rewrites `.next/types/routes.d.ts` during its build, so Next's route types are regenerated first); ESLint; regenerating the OG assets after a portrait change. |

## 6. Cloudflare configuration

`wrangler.jsonc` (deploy the built `dist/server/wrangler.json`, which vinext derives from it):

| Key | Value | Why |
| --- | --- | --- |
| `name` | `mojeeb-xyz` | as requested |
| `main` | `vinext/server/fetch-handler` | framework-generated entry, not a generic static Worker |
| `compatibility_date` | `2026-10-12` | matches the workerd bundled with the pinned Wrangler (1.20261012); every behaviour was tested on it |
| `compatibility_flags` | `nodejs_compat` | required by vinext (AsyncLocalStorage) and next/og; populates `process.env` |
| `assets` | `dist/client`, binding `ASSETS`, `run_worker_first` for everything except `/_next/static/*` | hashed assets served directly with immutable caching; all other paths get redirects and headers from the Worker |
| `images` | binding `IMAGES` | `next/image` resize and AVIF/WebP |
| `ratelimits` | `GUESTBOOK_LIMITER`, 5/min | cross-isolate guestbook limit; `namespace_id` is a number you choose, not a provisioned ID |
| `vars` | `GUESTBOOK_AUTO_APPROVE: "false"`; Access vars commented until known | |
| `observability` | logs and invocation logs on, 100% sampling | Workers Logs |
| `workers_dev`, `preview_urls` | true | temporary URLs for verification before the domain moves |
| `d1_databases` | `DB` → `mojeeb-guestbook` (`2e23fc7f-…`), `migrations_dir: migrations` | real database created 18 Oct 2026 |
| `account_id` | `1c44f0a2…` | pins the CLI and Workers Builds to your account |
| `routes` (custom domains) | **commented out** | added at cutover only |

Secret names (never committed): `GUESTBOOK_IP_SALT` (required for the guestbook) and `GUESTBOOK_ADMIN_TOKEN` (optional moderation fallback). Vars once Cloudflare Access exists: `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`.

The future domain block (cutover only):

```jsonc
"routes": [
  { "pattern": "mojeeb.xyz", "custom_domain": true },
  { "pattern": "www.mojeeb.xyz", "custom_domain": true }
]
```

The apex stays canonical. `metadataBase` and the canonical URLs already use `https://mojeeb.xyz`. For www, use a **Redirect Rule** (§12, step 15) so www never serves content.

## 7. Guestbook on D1

Full details are in [`docs/guestbook.md`](./guestbook.md). In summary:

- **Schema:** `guestbook_entries` (id, display_name, message, website_url, moderation_status, ip_hash, reaction counters, created_at, updated_at), with CHECK constraints and indexes, plus `guestbook_moderation_log` for the audit trail.
- **Access:** prepared statements only. D1 is reached only from server code through `getBindings()`.
- **Pagination:** keyset (`created_at, id`).
- **Moderation:** Cloudflare Access with full JWT verification (signature, issuer, audience, expiry). A token fallback with an expiring signed cookie applies only when Access isn't configured. Client identity headers are never trusted.
- **Security:** server validation, signed time-window form token, honeypot, same-origin check, 3-layer rate limiting, spam queue, React escaping, `ugc nofollow` links, IPs stored only as salted HMACs, no visitor data in logs, privacy notice under the form.
- **Pending activation:** without `DB` and the salt, the page shows a notice and the API returns 503 or `{active:false}`. Never an error page. The same holds on Vercel today.

## 8. Performance, caching and observability

| Area | Result |
| --- | --- |
| Worker size | `wrangler deploy --dry-run`: **4.37 MB raw / 1.50 MB gzip**, under the 3 MB free-plan limit (10 MB on paid). |
| Startup | One module graph; Three.js and other client-only components are lazy chunks, never executed on the server. |
| Three.js | 133 KB gzip chunk, requested only by the intro, after first paint, only on a first visit with motion allowed. No other route loads it. |
| Client JS | Content-hashed under `/_next/static`, served from Workers Static Assets with `Cache-Control: public, max-age=31536000, immutable` (from the generated `_headers`). |
| ISR | vinext's default in-memory cache per isolate: `/` and `/activity` are rendered once per isolate per 6 h; npm and Arcapush fetches are cached the same way. Each warm isolate adds a handful of upstream requests per window, well inside npm's and Arcapush's limits. **Optional later:** vinext's `workersCacheCdnAdapter()` (Workers Cache) or the KV data adapter for cross-isolate caching. Both are left out to avoid extra resources until traffic justifies them. |
| Never cached | `/guestbook` (dynamic), every `/api/guestbook*` response (`private, no-store`), admin data. |
| Images | Cloudflare Images binding, request-time resize to AVIF/WebP with a 1-year immutable response. Free plan includes 5,000 unique transformations per month; this site uses a handful (portrait and logos × widths). |
| Fonts | Self-hosted woff2, preloaded via `Link` headers. No third-party font requests. |
| GitHub API limits | None at runtime (activity comes from the committed snapshot). |
| SEO | Server-rendered HTML for every page; sitemap, robots, canonical URLs, JSON-LD and OG images verified in workerd. |
| Security headers | X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS (preload) and COOP on every Worker response, including `/`. A CSP is still not set (as before); add one separately after the move. |
| Error boundaries | Existing `not-found.tsx` and vinext's default error boundary; server errors are logged by `onRequestError`. |
| Observability | Workers Logs enabled. Structured events: `server.request_error`, `data.npm_failed`, `data.arcapush_failed`, `guestbook.submitted` / `moderated` / `*_failed` / `honeypot` / `admin.*`. Fields are route names, statuses and error names only, never names, messages, links, IPs or hashes. |

## 9. Deployment workflow (Workers Builds)

**One deployment authority: Cloudflare Workers Builds** (the Git integration on the Worker). No GitHub Actions deploy workflow is added, so there is nothing to double-deploy.

| Setting | Value |
| --- | --- |
| Repository | `mojeebdev/mojeebdev` |
| Production branch | `main` |
| Build command | `npm run build:vinext` |
| Deploy command | `npx wrangler deploy --config dist/server/wrangler.json` |
| Non-production branch deploy command | `npx wrangler versions upload --config dist/server/wrangler.json` (gives each PR branch a preview URL without touching production traffic) |
| Root directory | `/` |
| Build variables | none required. If the Node version needs pinning, set `NODE_VERSION` = `22`. |
| Runtime secrets | `GUESTBOOK_IP_SALT` (and optionally `GUESTBOOK_ADMIN_TOKEN`), set on the Worker, not in the build |
| Bindings | from `wrangler.jsonc`: `ASSETS`, `IMAGES`, `GUESTBOOK_LIMITER`, and `DB` once added |

- **Until setup is complete:** don't connect the repository at all. Workers Builds only runs once you connect it, so merging this PR deploys **nothing** to Cloudflare. Vercel keeps deploying `main` as today.
- **If you connect early:** set the production deploy command to `echo "deploys paused"`, or disconnect the build trigger, until you're ready. You can also turn off automatic production deployments in the Worker's Build settings and deploy manually from the dashboard.
- **After setup:** every push to `main` builds and deploys. Pushes to other branches upload preview versions. The weekly `profile-update.yml` commit to `main` will also trigger a rebuild, which is harmless and refreshes the heatmap snapshot.
- **Roll back a bad release:** Workers → `mojeeb-xyz` → Deployments → pick the previous version → **Rollback**, or `npx wrangler rollback`. This is instant, needs no rebuild, and leaves D1 data untouched. Migrations are forward-only; write a new migration to undo schema changes.

## 10. Commands for you

Run these **after merging this PR**, from a fresh checkout of `main` on your machine. Each block says what to send back to me. Nothing here touches production traffic until §12.

**1. Authenticate**

```bash
npm ci
npx wrangler login
npx wrangler whoami
```

→ Send me the **account name and account ID** from `whoami`. An account ID is not a secret.

**2. Create the database**

```bash
npx wrangler d1 create mojeeb-guestbook
```


→ Send me the printed **`database_id`** (a UUID). If Wrangler offers to add the binding to your config automatically, answer **no**. I'll add it to `wrangler.jsonc` as `binding: DB`, `database_name: mojeeb-guestbook`, with that exact id, in a small follow-up PR. Don't paste a guessed id anywhere.

**3. After the binding PR is merged: migrate locally, regenerate types**

```bash
npx wrangler d1 migrations apply mojeeb-guestbook --local
npm run cf-typegen
npm run preview          # http://localhost:8787 (put GUESTBOOK_IP_SALT in .dev.vars first: cp .dev.vars.example .dev.vars)
```

→ Tell me whether `/guestbook` shows the form and accepts a note locally.

**4. Remote migration (only when you approve it)**

```bash
npx wrangler d1 migrations apply mojeeb-guestbook --remote
```

**5. Secrets (they create or attach to the Worker)**

```bash
openssl rand -hex 32 | npx wrangler secret put GUESTBOOK_IP_SALT
# optional fallback for moderation before Cloudflare Access is set up:
openssl rand -hex 24 | npx wrangler secret put GUESTBOOK_ADMIN_TOKEN    # keep a copy in your password manager
```

**6. First deploy to the temporary workers.dev URL (no custom domain yet)**

```bash
npm run deploy:check
npm run deploy
```

→ Send me the `https://mojeeb-xyz.<subdomain>.workers.dev` URL and I'll run the full verification (§12, steps 7–12) against it.

## 11. Cloudflare dashboard setup

1. **Add the site (zone) without switching nameservers yet:** Dashboard → Add a domain → `mojeeb.xyz` → Free plan. Cloudflare scans and imports records. **Stop at the nameserver step**; don't change nameservers at the registrar yet.
2. **Worker:** created by the first `npm run deploy` (or Workers & Pages → Create → Import a repository). Name: `mojeeb-xyz`.
3. **Link GitHub:** Worker → Settings → Builds → Connect → `mojeebdev/mojeebdev`, branch `main`, and the build and deploy commands from §9. Leave automatic production deploys **off** until §12, step 16 if you connect before cutover.
4. **Runtime secrets:** Worker → Settings → Variables and Secrets → add `GUESTBOOK_IP_SALT` (Secret type), and optionally `GUESTBOOK_ADMIN_TOKEN`. (Or use the CLI from §10.)
5. **D1 binding:** comes from `wrangler.jsonc` once the real id is committed. Check it under Worker → Settings → Bindings (`DB → mojeeb-guestbook`). Don't add it by hand in the dashboard as well: the config file is the source of truth, and each deploy overwrites dashboard bindings.
6. **Preview:** open the `workers.dev` URL, or a version's preview URL under Deployments.
7. **Cloudflare Access for moderation:** Zero Trust → Access → Applications → Self-hosted, paths `mojeeb.xyz/guestbook/admin*` and `mojeeb.xyz/api/guestbook/admin*` (and the workers.dev equivalents for testing), policy "Allow, emails: yours". Copy the AUD tag and team domain into `wrangler.jsonc` `vars`.
8. **Attach mojeeb.xyz:** only during cutover (§12, steps 15–16): uncomment `routes` in `wrangler.jsonc` and deploy, or Worker → Settings → Domains & Routes → Add custom domain.

## 12. Cutover plan

Do this when a 30–60 minute window suits you. I'll stop and wait for your go-ahead at every step marked ⛔.

| # | Step | How | Done when |
| --- | --- | --- | --- |
| 1 | Worker configured | §11.2. `npx wrangler deployments list` shows a version | Worker exists |
| 2 | GitHub connection | §11.3. Push a trivial branch and see a preview version | preview URL builds |
| 3 | Secrets | §10.5. Dashboard lists `GUESTBOOK_IP_SALT` | listed (value hidden) |
| 4 | D1 binding | binding PR merged; `wrangler d1 info mojeeb-guestbook` | binding shown on the Worker |
| 5 | ⛔ Migrations | §10.3 locally, then §10.4 remotely after your approval | `wrangler d1 migrations list mojeeb-guestbook --remote` shows 0001 applied |
| 6 | Temporary deploy | `npm run deploy` (workers.dev only) | URL responds |
| 7 | Full site test | all routes, 404, redirects, headers, mobile, dark mode, axe | same results as §16 |
| 8 | Guestbook | sign, see "after review", moderate via Access/token, approve, see it listed, react, paginate, rate limit | all pass; no visitor data in Workers Logs |
| 9 | Intro and Three.js | first visit: greet → paw → reveal; Esc, keyboard, refresh no replay; reduced motion skips | pass |
| 10 | npm and integrations | homepage metrics show live npm all-time and 30-day numbers and Arcapush figures with timestamps | values match npm / Arcapush |
| 11 | Images and OG | `/_next/image` returns AVIF/WebP; `/opengraph-image` 1200×630; check with a card validator against workers.dev | pass |
| 12 | Routing and SEO | sitemap, robots, canonical `https://mojeeb.xyz/...`, JSON-LD, 308s | pass |
| 13 | Domain readiness | zone added (§11.1) and imported records reviewed | zone "pending nameserver change" |
| 14 | ⛔ Review DNS | export the full zone from **Vercel → Domains → mojeeb.xyz → DNS Records** and compare line by line with Cloudflare's import. Must be present in Cloudflare: **MX (Zoho ×3), SPF TXT, Zoho verification TXT, `zmail._domainkey` DKIM, Google and OpenAI verification TXT, CAA**, and anything else in the export (ImprovMX, `_dmarc`, other subdomains). Set mail-related records to **DNS only** (grey cloud). Leave out the apex and www **A records pointing at Vercel**; the custom domains replace them. | records match the export |
| 15 | Domain mapping prepared | uncomment `routes` (apex and www, `custom_domain: true`) in a PR, not merged yet. Prepare the Redirect Rule: *Rules → Redirect Rules → "www to apex"*: hostname equals `www.mojeeb.xyz` → dynamic `concat("https://mojeeb.xyz", http.request.uri.path)`, preserve query string, 301/308 | PR open, rule drafted |
| 16 | ⛔ Switch | (a) at the registrar, change nameservers to the two Cloudflare ones shown for the zone. While DNS propagates, Vercel keeps serving from the old records, so both are live and there is no outage. (b) once the zone is **Active**, merge the routes PR (Workers Builds deploys) or add the custom domains in the dashboard; enable the www Redirect Rule. (c) turn on automatic production deploys in Workers Builds. | `mojeeb.xyz` served by Cloudflare (`cf-ray` header) |
| 17 | Verify | `curl -sI https://mojeeb.xyz` (200, `cf-ray`, HSTS), `curl -sI https://www.mojeeb.xyz` (308/301 → apex), certificate issued, canonical tags, a test email to hello@mojeeb.xyz delivered (Zoho MX via Cloudflare DNS) | all pass |
| 18 | Monitor | Workers → Logs/Observability for `server.request_error` and `*_failed`, 48–72 h; Search Console coverage | quiet |
| 19 | ⛔ Clean Vercel DNS | Vercel DNS is no longer authoritative once nameservers point at Cloudflare. Remove `mojeeb.xyz` and `www` from the Vercel project's Domains so Vercel stops trying to renew certificates. | done |
| 20 | ⛔ Retire Vercel | §15: disconnect Git, keep the project paused about 2 weeks as a fallback, then delete it on your approval | deleted |

**Why there's no downtime:** during step 16a both DNS providers answer with working records (Vercel's still point at the live Vercel deployment, Cloudflare's carry mail and verification records). The site keeps loading from Vercel until the zone is active and the custom domains attach. Mail keeps flowing because the MX, SPF and DKIM records are identical on both sides.

**Note on CAA:** the existing records allow Let's Encrypt, Google Trust Services (`pki.goog`) and Sectigo, all of which Cloudflare uses. Keep them; Cloudflare adds what it needs when Universal SSL is enabled.

## 13. Rollback strategy

| Stage | Problem | Rollback |
| --- | --- | --- |
| Before step 16 | anything | nothing to roll back: Vercel is still serving and still connected |
| After deploy, bad release | bug in a new version | Workers → Deployments → Rollback (instant), or `npx wrangler rollback` |
| After step 16b, Worker-level issue | site broken on Cloudflare | remove the custom domains from the Worker and re-add proxied A records for `@` and `www` pointing at Vercel (`216.198.79.65` / `64.29.17.1`; confirm the current values in Vercel's domain settings). Vercel still has the domains attached and a current production deployment, because Git stays connected until step 20 and keeps deploying `main`. |
| DNS-level issue | mail or verification broken after the nameserver change | fix the missing record in Cloudflare (from the step 14 export). As a last resort, set the nameservers back to `ns1/ns2.vercel-dns.com` at the registrar; the Vercel zone is untouched until step 19. |
| Guestbook | D1 problem | the site is unaffected (the guestbook degrades to its notice). Roll back the Worker version; D1 Time Travel can restore the database to any minute in the last 30 days (`wrangler d1 time-travel restore`). |

Keep Vercel as a warm fallback (domains attached, Git connected) until at least 72 hours of clean monitoring (step 18). The vinext build and the Next build both come from the same `main`, so the fallback is always current.

## 14. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| DNS move drops a mail or verification record | medium | mail delivery or domain verification fails | full zone export and line-by-line comparison (step 14); mail records DNS-only; test email at step 17; nameserver rollback |
| vinext is pre-1.x-mature ("under active development") | medium | an edge-case behaviour differs from Next | every route verified in workerd; Vercel fallback kept; OpenNext path documented (§4); pin vinext and upgrade deliberately |
| Per-isolate ISR cache | low | a few more upstream fetches; brief inconsistency between isolates | numbers carry their own timestamps; optional Workers Cache adapter later |
| Font fallback metrics not generated by vinext | low | slightly more layout shift on slow networks | fonts preloaded; revisit if CLS regresses in field data |
| Images binding quota (5k unique transformations per month free) | low | over quota means images served unresized | a handful of sources; monitor in the Images dashboard |
| Workers Builds and Vercel both deploying `main` before cutover | low | none (two independent hosts) | expected during the transition; retire Vercel at step 20 |
| Wrangler D1 auto-provisioning creates an unintended database | low | duplicate empty database | D1 block stays commented until the real id exists |
| Free-plan Worker size limit (3 MB gzip) | low | deploy fails as the app grows | currently 1.5 MB; paid plan raises it to 10 MB |

## 15. Staged Vercel retirement (after cutover only)

Not done in this PR, on purpose. Each item is a separate, later step that needs your approval:

1. Remove `mojeeb.xyz` and `www.mojeeb.xyz` from the Vercel project's Domains (step 19).
2. Disconnect the Vercel Git integration for `mojeebdev/mojeebdev`. This also stops the "Vercel Preview Comments" check on PRs.
3. Pause the Vercel project for about 2 weeks, then delete it.
4. Repository follow-up PR: drop the `dev`/`build`/`start` Next scripts in favour of vinext (`dev` → `vite dev`, `build` → `vite build`), remove `turbopack` from `next.config.ts`, and update `docs/rebirth-audit.md` "Deployment: Vercel" to Cloudflare. `next` stays a dependency (its types and `next/*` APIs are used by the code).
5. Optionally remove the `mojeebhq.vercel.app` alias, which goes with the project deletion.

## 16. QA results

Run on 18 Oct 2026 in this container. "workerd" = the `npm run build:vinext` output served by `wrangler dev` 4.151.1 (workerd 1.20261012.1) on :8787; browser checks with Playwright Chromium.

| Check | Result |
| --- | --- |
| `tsc --noEmit` | ✅ pass |
| `eslint .` | ✅ pass, 0 problems |
| Unit tests (`vitest run`) | ✅ 34/34: validation, Web Crypto security, Access JWT (valid, wrong aud/iss, expired, forged key, unknown kid, `alg:none`), D1 store against real SQLite with the migration (ordering, pagination, rate counts, moderation and audit log, reactions, DB constraints), API routes (inactive state, review-first, auto-approve, no raw IP stored, honeypot, timing token, validation, cross-origin, content type, rate limit, limiter binding, forged identity headers), HTML escaping and `ugc nofollow` |
| `next build` (Vercel path) | ✅ pass |
| `vite build` (Workers) | ✅ pass |
| `wrangler deploy --dry-run` | ✅ 1.50 MB gzip, bindings resolved |
| D1 migration validity | ✅ applied with `wrangler d1 migrations apply --local` (6 statements) and in the SQLite tests |
| Workers preview runtime | ✅ 18 page routes 200; `/work/nope` and `/nope` 404; sitemap (17 URLs), robots, manifest, icon, llms.txt 200; 3 OG images 200 PNG |
| Redirects | ✅ 7 of 14 sampled: 6 × 308, headshot alias 307 (as configured) |
| Security headers | ✅ 6/6 on `/`, `/guestbook`, `/api/guestbook` |
| Guestbook, no D1 (production config) | ✅ GET `{active:false}`, POST 503, token 503, admin 401 (`auth:"none"`), page shows the notice; no errors |
| Guestbook with local D1 (workerd) | ✅ submit 201 ×3, then 429 (rate limit); token sign-in 401 wrong / 200 right; approve ×3; public list newest first; cursor page 2 then end; page shows "3 notes" with `ugc nofollow` links; reaction counted; sign-out; audit log rows written; logs contain only event names and statuses |
| Leopard intro (workerd, Chromium) | ✅ greet → reach → five → profile in 2.2 s, focus to `#hero-name`; double tap guarded; refresh doesn't replay; Enter/Space flow; Esc skips; mobile touch; 0 page errors |
| Accessibility (axe-core 4.14, WCAG 2 A/AA, 21 AA, best practice) | ✅ 0 violations on 15 pages (light) and 5 pages (dark) |
| Horizontal overflow | ✅ none at 1440 px or 390 px on 15 pages |
| Hero above the fold | ✅ location and availability visible at 1366×768 (bottom 615 px), 1366×657 (≈ browser viewport on a 1366×768 screen: 590 px), 1440×900, 1440×789, 1920×1080, 1920×969, 1280×720; mobile layout unchanged |
| npm data in Workers | ✅ live all-time counts rendered (stackbrief 807, stylegraft 372, arcapush 1,384) |
| Image delivery | ✅ `/_next/image` via the Images binding: AVIF 5.5 KB from a 292 KB PNG, immutable caching |

**Not run here (manual, during cutover):** the real Cloudflare edge (custom domain, TLS, HSTS on the live host, Access JWT from a real Access app), remote D1, Workers Builds, cross-browser checks in Safari and Firefox (only Chromium is available in this container), social card validators against a public URL, and a mail delivery test after the DNS move. External links were not re-crawled for this PR; they were checked in PR #5.

## 17. Migration checklist

**Completed in the repository (this PR)**
- [x] Audit, Vercel inventory, compatibility matrix, risks, rollback (this document)
- [x] vinext 1.2.1 + Wrangler config for Worker `mojeeb-xyz`; scripts; types
- [x] Workers runtime fixes (OG assets, root headers); Next 16.4.2 security upgrade
- [x] D1 schema, migration, typed store, endpoints, moderation (Access + fallback), pagination, tests
- [x] Graceful "pending activation" state on Workers and on Vercel
- [x] Observability (Workers Logs, `onRequestError`, upstream failure events)
- [x] Social icons, hero GitHub CTA, hero viewport fit
- [x] QA (§16)

**Awaiting Worker creation (you)**
- [x] `wrangler login` / `whoami` (account `1c44f0a287a8d8b44aa136f42ae9e64b`)
- [ ] Add the zone (no nameserver change), first deploy to workers.dev

**Awaiting D1 creation (you, then me)**
- [x] `wrangler d1 create mojeeb-guestbook` (`2e23fc7f-db68-4044-b226-283e1e2cc07f`, WEUR)
- [x] Real binding added to `wrangler.jsonc`
- [ ] Local migration → ⛔ remote migration after your approval

**Awaiting secrets and bindings (you)**
- [ ] `GUESTBOOK_IP_SALT` (required), `GUESTBOOK_ADMIN_TOKEN` (optional)
- [ ] Cloudflare Access app → `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` in `wrangler.jsonc`
- [ ] Connect Workers Builds (production deploys off until cutover)

**Awaiting production domain switch (together, ⛔ each step)**
- [ ] Verification on workers.dev (§12, steps 7–12)
- [ ] DNS export and comparison (step 14)
- [ ] Nameserver change, custom domains, www redirect (steps 15–17)
- [ ] 72 h monitoring (step 18)

**Awaiting Vercel retirement (after stable, ⛔)**
- [ ] Remove domains from Vercel, disconnect Git, pause, then delete (§15)
- [ ] Repository cleanup PR (§15.4)

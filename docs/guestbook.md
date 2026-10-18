# Guestbook (Cloudflare D1)

The guestbook stores notes in the Cloudflare D1 database `mojeeb-guestbook`, bound to the Worker as `DB`. It replaced the unfinished Supabase adapter, which was never provisioned, so no data needed moving.

**Status: pending activation.** The code, schema and migration are in the repository. The database doesn't exist yet. Until `DB` and the `GUESTBOOK_IP_SALT` secret are both present, `/guestbook` shows a short notice instead of the form, the homepage preview says the guestbook "opens soon", and the API answers `503` (POST) or `{ "active": false }` (GET). Nothing errors.

The same applies to the current Vercel deployment: `next build` compiles a Node stub for the bindings (`lib/server/bindings.ts`), so the Vercel site reports the guestbook as pending rather than failing.

## Data model

`migrations/0001_guestbook.sql`:

| Table | Purpose |
| --- | --- |
| `guestbook_entries` | `id` (UUID), `display_name`, `message`, `website_url` (optional), `moderation_status` (`pending` / `approved` / `spam`), `ip_hash`, three reaction counters, `created_at`, `updated_at`. CHECK constraints repeat the length, URL-scheme and status rules, so bad data can't land even if app validation were bypassed. |
| `guestbook_moderation_log` | One row per moderation action: entry, action, previous status, moderator, time. Kept after an entry is deleted. |

Indexes cover the public feed (`moderation_status, created_at DESC, id DESC`), rate limiting (`ip_hash, created_at`) and the audit log (`entry_id, created_at`).

All queries live in `lib/guestbook/store.ts` and use prepared statements with bound parameters. The only interpolated identifiers are fixed column names chosen from a constant map.

## Endpoints

| Route | Method | Who | Behaviour |
| --- | --- | --- | --- |
| `/api/guestbook` | GET | public | Approved entries only, newest first. `?limit=` (max 50) and `?cursor=` for keyset pagination. Returns `{ active, entries, nextCursor }`. |
| `/api/guestbook` | POST | public | Sign the guestbook. JSON `{ name, message, link?, token, company }`. Returns 201 `{ ok, status: "pending" or "approved" }`, 422 with field errors, 429 when rate limited, 503 while inactive. |
| `/api/guestbook/token` | GET | public | Issues the signed form token. |
| `/api/guestbook/react` | POST | public | `{ id, kind }` where kind is wave, heart or paw. Counts only on approved entries. |
| `/api/guestbook/admin` | GET, POST | moderator | GET `?status=pending\|approved\|spam\|all` returns entries and counts. POST `{ id, action }` where action is approve, pending, spam or delete; each action is written to the audit log. |
| `/api/guestbook/admin/session` | POST, DELETE | moderator | Token sign-in and sign-out. Only used when Cloudflare Access is not configured. |

Every guestbook response carries `Cache-Control: private, no-store`. `/guestbook` renders on each request, so approvals appear immediately on every Worker isolate. The homepage preview fetches in the browser, so the cached homepage never shows stale notes.

## Abuse and privacy controls

- **Server validation** (`lib/guestbook/schema.ts`): the same rules the form uses, run again on the server. Control and bidi-override characters are stripped. Links must be http(s), contain no credentials and have a real hostname.
- **Signed form token:** HMAC with the salt. It must be between 3 seconds and 6 hours old, which stops replays and instant bot posts.
- **Honeypot field:** a filled honeypot gets a fake success response, so bots learn nothing.
- **Same-origin check** on every POST, and JSON content type only.
- **Rate limits in three layers:** an in-isolate window, the Workers Rate Limiting binding `GUESTBOOK_LIMITER` (5 per minute per hashed IP, across isolates), and D1 itself (3 per 10 minutes per hashed IP).
- **Spam heuristics:** link stuffing and keyword spam are routed to the `spam` queue for review, never silently dropped. The sender sees the normal "after review" message.
- **Review first:** new notes are `pending` unless `GUESTBOOK_AUTO_APPROVE` is `"true"`.
- **Rendering:** React escapes all text. Visitor links render with `rel="ugc nofollow noopener noreferrer"`. No HTML from visitors is ever rendered.
- **IP addresses:** never stored or logged. Only an HMAC-SHA-256 of `CF-Connecting-IP` with the secret salt is kept, for rate limiting.
- **Logs:** structured events only (for example `guestbook.submitted` with status `pending`). Logs never contain names, messages, links, IPs or hashes.
- **Privacy notice:** shown under the form.

## Moderation access

Use **Cloudflare Access** (recommended):

1. In Zero Trust → Access → Applications, add a self-hosted application covering:
   - `mojeeb.xyz/guestbook/admin*`
   - `mojeeb.xyz/api/guestbook/admin*`
   - (optional) the same two paths on the `workers.dev` hostname for pre-cutover testing.
2. Allow only your own email.
3. Copy the application's **AUD tag** and your team domain (`<team>.cloudflareaccess.com`).
4. Add them to `wrangler.jsonc` → `vars` as `ACCESS_AUD` and `ACCESS_TEAM_DOMAIN`.

With these set, the Worker verifies the `Cf-Access-Jwt-Assertion` JWT on every moderation request: RS256 signature against the team's published keys, plus issuer, audience and expiry (`lib/guestbook/access.ts`). Token sign-in is then disabled. Identity headers such as `Cf-Access-Authenticated-User-Email` are never trusted on their own.

**Fallback before Access exists:** set the `GUESTBOOK_ADMIN_TOKEN` secret (24+ random characters) and sign in at `/guestbook/admin`. The session cookie is HttpOnly, Secure, SameSite=Strict, expires after 8 hours, and stops working as soon as the token is rotated.

## Local development

```bash
cp .dev.vars.example .dev.vars          # fill in GUESTBOOK_IP_SALT (and GUESTBOOK_ADMIN_TOKEN to test moderation)
npx wrangler d1 migrations apply mojeeb-guestbook --local
npm run preview                          # builds and serves the Worker in workerd on :8787, against the local D1 copy
```

`--local` and `npm run preview` use a SQLite copy under `.wrangler/`; only `--remote` touches the real database. `npm test` runs the store and API tests against Node's built-in SQLite with the real migration applied.

## Activation

See `docs/cloudflare-migration.md` → "Commands for you" and "Cutover". In short: create the database, put its real `database_id` in `wrangler.jsonc`, set `GUESTBOOK_IP_SALT`, apply the migration locally then (after approval) remotely, deploy, and test on the `workers.dev` URL before the domain moves.

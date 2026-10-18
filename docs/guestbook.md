# Guestbook: setup and moderation

## Setup (once)
1. Create a Supabase project, open the SQL editor and run `supabase/guestbook.sql`.
2. In Vercel → Project → Settings → Environment Variables, set (Production and Preview):
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: service-role key. Server-only; it is never sent to the browser.
   - `GUESTBOOK_ADMIN_TOKEN`: a long random string (e.g. `openssl rand -hex 32`)
   - `GUESTBOOK_IP_SALT`: another long random string
   - optional `GUESTBOOK_AUTO_APPROVE=true` to skip manual review
3. Redeploy. Until these are set, the guestbook shows "not connected" and accepts nothing.

## How it protects itself
- **Server-controlled endpoint:** `/api/guestbook`. Input is validated server-side (lengths, control characters, http(s) links only, no credentials in URLs) and rendered as text, so markup is escaped.
- **Abuse controls:**
  - A signed form token, which must be 3 s – 6 h old.
  - A hidden honeypot field.
  - Same-origin check.
  - Rate limit of 3 entries per 10 minutes per IP hash, both per instance and checked in the database.
  - Spam heuristics: multiple links, known spam phrases or long repeated characters. Matches go to a spam queue, never published.
- **Privacy:**
  - IP addresses are never stored. Only a salted SHA-256 is kept, for rate limiting.
  - No email is collected.
  - Links are rendered with `rel="ugc nofollow noopener noreferrer"`.
- **Database:** RLS is enabled with no public policies; only the server's service role can read or write. Reactions use an atomic RPC that accepts only approved entries and allow-listed kinds.

## Moderating
1. Visit `/guestbook/admin` and sign in with `GUESTBOOK_ADMIN_TOKEN`. The session lasts 8 hours in an httpOnly, SameSite=strict cookie. Login attempts are rate-limited.
2. The **Pending** tab lists new entries. For each one, choose **Approve**, **Spam** or **Delete**. **Back to pending** un-publishes an approved entry.
3. Approving or un-publishing refreshes `/guestbook` and the homepage preview immediately.
4. Removal requests sent to hello@mojeeb.xyz: find the entry under **Approved** and delete it.

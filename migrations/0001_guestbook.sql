-- Migration number: 0001 	 Guestbook entries and moderation audit log (Cloudflare D1 / SQLite)
-- Apply with: npx wrangler d1 migrations apply mojeeb-guestbook --local   (then --remote, after approval)

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id                TEXT PRIMARY KEY,                                   -- random UUID, generated in the Worker
  display_name      TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 40),
  message           TEXT NOT NULL CHECK (length(message) BETWEEN 2 AND 500),
  website_url       TEXT CHECK (
                      website_url IS NULL
                      OR (length(website_url) <= 300 AND (website_url LIKE 'https://%' OR website_url LIKE 'http://%'))
                    ),
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'spam')),
  -- Salted SHA-256 of the visitor IP, used only for rate limiting. The IP itself is never stored.
  ip_hash           TEXT NOT NULL,
  reaction_wave     INTEGER NOT NULL DEFAULT 0 CHECK (reaction_wave >= 0),
  reaction_heart    INTEGER NOT NULL DEFAULT 0 CHECK (reaction_heart >= 0),
  reaction_paw      INTEGER NOT NULL DEFAULT 0 CHECK (reaction_paw >= 0),
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Public feed: approved entries, newest first, keyset-paginated on (created_at, id).
CREATE INDEX IF NOT EXISTS idx_guestbook_status_created ON guestbook_entries (moderation_status, created_at DESC, id DESC);
-- Rate limiting: recent submissions per hashed IP.
CREATE INDEX IF NOT EXISTS idx_guestbook_ip_created ON guestbook_entries (ip_hash, created_at);

-- Who changed what, and when. Kept after an entry is deleted. `actor` is the moderator's Cloudflare Access
-- email, or "admin-token" for token sign-in; it never holds visitor data.
CREATE TABLE IF NOT EXISTS guestbook_moderation_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id    TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('approve', 'pending', 'spam', 'delete')),
  from_status TEXT,
  actor       TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_guestbook_log_entry ON guestbook_moderation_log (entry_id, created_at);

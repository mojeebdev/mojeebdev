import "server-only";
import type { D1Database } from "@/lib/server/types";
import { REACTIONS, type GuestbookEntry, type ModerationAction, type PublicEntry, type ReactionKind, type Status } from "./schema";

/**
 * Guestbook persistence on Cloudflare D1. Every query is a prepared statement with bound parameters.
 * Column names follow the D1 schema (migrations/0001_guestbook.sql); the UI keeps its shorter field names.
 */

type Row = {
  id: string;
  display_name: string;
  message: string;
  website_url: string | null;
  moderation_status: Status;
  reaction_wave: number;
  reaction_heart: number;
  reaction_paw: number;
  created_at: string;
  updated_at: string;
};

const COLS = "id, display_name, message, website_url, moderation_status, reaction_wave, reaction_heart, reaction_paw, created_at, updated_at";
const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
const REACTION_COLUMN: Record<ReactionKind, string> = { wave: "reaction_wave", heart: "reaction_heart", paw: "reaction_paw" };

const toPublic = (r: Row): PublicEntry => ({
  id: r.id,
  created_at: r.created_at,
  name: r.display_name,
  message: r.message,
  link: r.website_url,
  reactions: { wave: r.reaction_wave, heart: r.reaction_heart, paw: r.reaction_paw },
});
const toEntry = (r: Row): GuestbookEntry => ({ ...toPublic(r), status: r.moderation_status, updated_at: r.updated_at });

/** Opaque keyset cursor: the (created_at, id) of the last entry on the previous page. */
export const encodeCursor = (e: { created_at: string; id: string }) => btoa(`${e.created_at}|${e.id}`).replace(/=+$/, "");
export function decodeCursor(cursor: string | null | undefined): { created_at: string; id: string } | null {
  if (!cursor || cursor.length > 120) return null;
  try {
    const [created_at, id] = atob(cursor).split("|");
    return /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(created_at) && /^[0-9a-f-]{36}$/i.test(id) ? { created_at, id } : null;
  } catch {
    return null;
  }
}

export type Page = { entries: PublicEntry[]; nextCursor: string | null };

export function guestbookStore(db: D1Database) {
  return {
    async listApproved(limit: number, cursor?: string | null): Promise<Page> {
      const after = decodeCursor(cursor);
      const size = Math.max(1, Math.min(50, limit));
      const stmt = after
        ? db.prepare(`SELECT ${COLS} FROM guestbook_entries WHERE moderation_status = 'approved' AND (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT ?`).bind(after.created_at, after.id, size + 1)
        : db.prepare(`SELECT ${COLS} FROM guestbook_entries WHERE moderation_status = 'approved' ORDER BY created_at DESC, id DESC LIMIT ?`).bind(size + 1);
      const { results } = await stmt.all<Row>();
      const page = results.slice(0, size).map(toPublic);
      return { entries: page, nextCursor: results.length > size ? encodeCursor(page[page.length - 1]) : null };
    },

    async countApproved(): Promise<number> {
      const row = await db.prepare(`SELECT COUNT(*) AS n FROM guestbook_entries WHERE moderation_status = 'approved'`).first<{ n: number }>();
      return row?.n ?? 0;
    },

    async listForModeration(status: Status | "all", limit = 200): Promise<GuestbookEntry[]> {
      const stmt = status === "all"
        ? db.prepare(`SELECT ${COLS} FROM guestbook_entries ORDER BY created_at DESC, id DESC LIMIT ?`).bind(limit)
        : db.prepare(`SELECT ${COLS} FROM guestbook_entries WHERE moderation_status = ? ORDER BY created_at DESC, id DESC LIMIT ?`).bind(status, limit);
      return (await stmt.all<Row>()).results.map(toEntry);
    },

    async counts(): Promise<Record<Status, number>> {
      const { results } = await db.prepare(`SELECT moderation_status AS s, COUNT(*) AS n FROM guestbook_entries GROUP BY moderation_status`).all<{ s: Status; n: number }>();
      const out: Record<Status, number> = { pending: 0, approved: 0, spam: 0 };
      for (const r of results) out[r.s] = r.n;
      return out;
    },

    async create(e: { name: string; message: string; link: string | null; status: Status; ipHash: string }): Promise<{ id: string }> {
      const id = crypto.randomUUID();
      await db
        .prepare(`INSERT INTO guestbook_entries (id, display_name, message, website_url, moderation_status, ip_hash) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(id, e.name, e.message, e.link, e.status, e.ipHash)
        .run();
      return { id };
    },

    async recentByIp(ipHash: string, minutes: number): Promise<number> {
      const since = new Date(Date.now() - minutes * 60_000).toISOString();
      const row = await db.prepare(`SELECT COUNT(*) AS n FROM guestbook_entries WHERE ip_hash = ? AND created_at >= ?`).bind(ipHash, since).first<{ n: number }>();
      return row?.n ?? 0;
    },

    /** Applies a moderation action and records it in the audit log, atomically. Returns false if the entry is gone. */
    async moderate(id: string, action: ModerationAction, actor: string): Promise<boolean> {
      const current = await db.prepare(`SELECT moderation_status FROM guestbook_entries WHERE id = ?`).bind(id).first<{ moderation_status: Status }>();
      if (!current) return false;
      const log = db.prepare(`INSERT INTO guestbook_moderation_log (entry_id, action, from_status, actor) VALUES (?, ?, ?, ?)`).bind(id, action, current.moderation_status, actor);
      const change = action === "delete"
        ? db.prepare(`DELETE FROM guestbook_entries WHERE id = ?`).bind(id)
        : db.prepare(`UPDATE guestbook_entries SET moderation_status = ?, updated_at = ${NOW} WHERE id = ?`).bind(action === "approve" ? "approved" : action, id);
      await db.batch([change, log]);
      return true;
    },

    /** Reactions only count on approved entries. */
    async react(id: string, kind: ReactionKind): Promise<boolean> {
      if (!REACTIONS.includes(kind)) return false;
      const col = REACTION_COLUMN[kind];
      const res = await db.prepare(`UPDATE guestbook_entries SET ${col} = ${col} + 1 WHERE id = ? AND moderation_status = 'approved'`).bind(id).run();
      return (res.meta.changes ?? 0) > 0;
    },
  };
}

export type GuestbookStore = ReturnType<typeof guestbookStore>;

import "server-only";
import { randomUUID } from "node:crypto";
import { REACTIONS, type GuestbookEntry, type PublicEntry, type ReactionKind } from "./schema";

/**
 * Persistence. Production: Supabase over its REST API with the service-role key (server only, never bundled).
 * Development without credentials: an in-memory store, so the UI can be exercised locally.
 * Production without credentials: null, and the UI shows a clear "not configured" state.
 */
export type GuestbookStore = {
  kind: "supabase" | "memory";
  listApproved(limit: number): Promise<PublicEntry[]>;
  listForModeration(): Promise<GuestbookEntry[]>;
  create(e: { name: string; message: string; link: string | null; status: GuestbookEntry["status"]; ipHash: string }): Promise<{ id: string }>;
  recentByIp(ipHash: string, minutes: number): Promise<number>;
  setStatus(id: string, status: GuestbookEntry["status"]): Promise<void>;
  remove(id: string): Promise<void>;
  react(id: string, kind: ReactionKind): Promise<void>;
};

const PUBLIC_COLS = "id,created_at,name,message,link,reactions";

function supabaseStore(url: string, key: string): GuestbookStore {
  const base = `${url.replace(/\/$/, "")}/rest/v1`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const call = async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`${base}${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return res;
  };
  return {
    kind: "supabase",
    async listApproved(limit) {
      const res = await call(`/guestbook_entries?select=${PUBLIC_COLS}&status=eq.approved&order=created_at.desc&limit=${limit}`);
      return res.json();
    },
    async listForModeration() {
      const res = await call(`/guestbook_entries?select=id,created_at,name,message,link,status,reactions&order=created_at.desc&limit=200`);
      return res.json();
    },
    async create(e) {
      const res = await call(`/guestbook_entries?select=id`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ name: e.name, message: e.message, link: e.link, status: e.status, ip_hash: e.ipHash }) });
      const [row] = await res.json();
      return { id: row.id };
    },
    async recentByIp(ipHash, minutes) {
      const since = new Date(Date.now() - minutes * 60_000).toISOString();
      const res = await call(`/guestbook_entries?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}`, { method: "HEAD", headers: { Prefer: "count=exact" } });
      return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
    },
    async setStatus(id, status) {
      await call(`/guestbook_entries?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
    },
    async remove(id) {
      await call(`/guestbook_entries?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    async react(id, kind) {
      await call(`/rpc/guestbook_react`, { method: "POST", body: JSON.stringify({ entry_id: id, kind }) });
    },
  };
}

type MemRow = GuestbookEntry & { ip_hash: string };
function memoryStore(): GuestbookStore {
  const g = globalThis as unknown as { __guestbook?: MemRow[] };
  const rows = (g.__guestbook ??= []);
  const pub = ({ id, created_at, name, message, link, reactions }: MemRow): PublicEntry => ({ id, created_at, name, message, link, reactions });
  return {
    kind: "memory",
    async listApproved(limit) { return rows.filter((r) => r.status === "approved").slice(0, limit).map(pub); },
    async listForModeration() { return rows.map(({ ip_hash: _ip, ...r }) => r); },
    async create(e) {
      const id = randomUUID();
      rows.unshift({ id, created_at: new Date().toISOString(), name: e.name, message: e.message, link: e.link, status: e.status, reactions: Object.fromEntries(REACTIONS.map((k) => [k, 0])) as Record<ReactionKind, number>, ip_hash: e.ipHash });
      return { id };
    },
    async recentByIp(ipHash, minutes) { const since = Date.now() - minutes * 60_000; return rows.filter((r) => r.ip_hash === ipHash && Date.parse(r.created_at) >= since).length; },
    async setStatus(id, status) { const r = rows.find((x) => x.id === id); if (r) r.status = status; },
    async remove(id) { const i = rows.findIndex((x) => x.id === id); if (i >= 0) rows.splice(i, 1); },
    async react(id, kind) { const r = rows.find((x) => x.id === id && x.status === "approved"); if (r) r.reactions[kind] = (r.reactions[kind] ?? 0) + 1; },
  };
}

export function getStore(): GuestbookStore | null {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return supabaseStore(url, key);
  if (process.env.NODE_ENV !== "production" || process.env.GUESTBOOK_MEMORY_STORE === "1") return memoryStore();
  return null;
}

export const autoApprove = () => process.env.GUESTBOOK_AUTO_APPROVE === "true";

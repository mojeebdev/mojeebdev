"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { GuestbookEntry, ModerationAction, Status } from "@/lib/guestbook/schema";

type Filter = Status | "all";
type Auth = "access" | "token" | "none";
type View =
  | { phase: "loading" }
  | { phase: "signin"; auth: Auth }
  | { phase: "ready"; entries: GuestbookEntry[]; counts: Record<Status, number>; moderator: string; auth: Auth }
  | { phase: "error"; message: string };

export default function GuestbookAdmin() {
  const [view, setView] = useState<View>({ phase: "loading" });
  const [filter, setFilter] = useState<Filter>("pending");
  const [notice, setNotice] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/guestbook/admin?status=${filter}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (res.status === 401) setView({ phase: "signin", auth: data.auth ?? "none" });
        else if (!res.ok) setView({ phase: "error", message: data.error ?? "Couldn't load entries." });
        else setView({ phase: "ready", entries: data.entries, counts: data.counts, moderator: data.moderator, auth: data.auth });
      })
      .catch(() => alive && setView({ phase: "error", message: "Couldn't reach the server." }));
    return () => { alive = false; };
  }, [filter, version]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/guestbook/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setNotice(data.error ?? "Sign-in failed."); return; }
    setToken(""); setNotice(null); reload();
  };
  const act = async (id: string, action: ModerationAction) => {
    if (action === "delete" && !confirm("Delete this entry permanently?")) return;
    const res = await fetch("/api/guestbook/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    setNotice(res.ok ? null : "That action failed. Reload and try again.");
    reload();
  };

  if (view.phase === "loading") return <p className="muted" role="status">Checking access…</p>;
  if (view.phase === "error") return <p className="gb-err" role="alert">{view.message}</p>;
  if (view.phase === "signin") {
    if (view.auth === "access") return <p className="gb-notice">Moderation is protected by Cloudflare Access. <a className="text-link" href="/guestbook/admin">Reload this page</a> to sign in.</p>;
    if (view.auth === "none") return <p className="gb-notice">Moderation isn’t configured yet. Set up Cloudflare Access for this path, or add the <code>GUESTBOOK_ADMIN_TOKEN</code> secret (see docs/guestbook.md).</p>;
    return (
      <form className="gb-form gb-panel" onSubmit={signIn} style={{ maxWidth: 420 }}>
        <div className="gb-field"><label htmlFor="admin-token">Admin token</label><input id="admin-token" type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} required /></div>
        <button type="submit" className="btn btn--primary">Sign in</button>
        {notice && <p className="gb-err" role="alert">{notice}</p>}
      </form>
    );
  }

  const total = view.counts.pending + view.counts.approved + view.counts.spam;
  return (
    <div className="gb-admin">
      <p className="meta">Signed in as {view.moderator === "admin-token" ? "admin (token)" : view.moderator}.</p>
      <div className="archive__chips" role="group" aria-label="Filter by status">
        {(["pending", "approved", "spam", "all"] as Filter[]).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f} ({f === "all" ? total : view.counts[f]})</button>
        ))}
        {view.auth === "token" && <button type="button" onClick={async () => { await fetch("/api/guestbook/admin/session", { method: "DELETE" }); reload(); }}>Sign out</button>}
      </div>
      {notice && <p className="gb-err" role="alert">{notice}</p>}
      <ul role="list" className="gb-list">
        {view.entries.map((e) => (
          <li key={e.id} className="gb-entry">
            <div className="gb-entry__head"><span className="gb-entry__name">{e.name}</span><span className="chip">{e.status}</span><time className="meta" dateTime={e.created_at}>{new Date(e.created_at).toLocaleString("en-GB")}</time></div>
            <p className="gb-entry__msg">{e.message}</p>
            {e.link && <p className="meta">{e.link}</p>}
            <div className="gb-admin__actions">
              {e.status !== "approved" && <button type="button" className="btn btn--sm btn--primary" onClick={() => act(e.id, "approve")}>Approve</button>}
              {e.status !== "pending" && <button type="button" className="btn btn--sm" onClick={() => act(e.id, "pending")}>Back to pending</button>}
              {e.status !== "spam" && <button type="button" className="btn btn--sm" onClick={() => act(e.id, "spam")}>Spam</button>}
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => act(e.id, "delete")}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {!view.entries.length && <p className="muted">Nothing here.</p>}
    </div>
  );
}

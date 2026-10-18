"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { GuestbookEntry } from "@/lib/guestbook/schema";

type Filter = "pending" | "approved" | "spam" | "all";

export default function GuestbookAdmin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/guestbook/admin", { cache: "no-store" });
    if (res.status === 401) { setAuthed(false); return; }
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Couldn't load entries."); setAuthed(true); return; }
    setEntries(data.entries); setAuthed(true); setError(null);
  }, []);
  useEffect(() => { load(); }, [load]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/guestbook/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? "Sign-in failed."); return; }
    setToken(""); load();
  };
  const act = async (id: string, action: "approve" | "pending" | "spam" | "delete") => {
    if (action === "delete" && !confirm("Delete this entry permanently?")) return;
    const res = await fetch("/api/guestbook/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    if (!res.ok) { setError("Action failed."); return; }
    load();
  };

  if (authed === null) return <p className="muted">Checking access…</p>;
  if (!authed) {
    return (
      <form className="gb-form gb-panel" onSubmit={login} style={{ maxWidth: 420 }}>
        <div className="gb-field"><label htmlFor="admin-token">Admin token</label><input id="admin-token" type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} required /></div>
        <button type="submit" className="btn btn--primary">Sign in</button>
        {error && <p className="gb-err" role="alert">{error}</p>}
      </form>
    );
  }
  const shown = entries.filter((e) => filter === "all" || e.status === filter);
  return (
    <div className="gb-admin">
      <div className="archive__chips" role="group" aria-label="Filter">
        {(["pending", "approved", "spam", "all"] as Filter[]).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f} ({f === "all" ? entries.length : entries.filter((e) => e.status === f).length})</button>
        ))}
        <button type="button" onClick={async () => { await fetch("/api/guestbook/admin/session", { method: "DELETE" }); setAuthed(false); }}>Sign out</button>
      </div>
      {error && <p className="gb-err" role="alert">{error}</p>}
      <ul role="list" className="gb-list">
        {shown.map((e) => (
          <li key={e.id} className="gb-entry">
            <div className="gb-entry__head"><span className="gb-entry__name">{e.name}</span><span className={`chip`}>{e.status}</span><time className="meta">{new Date(e.created_at).toLocaleString("en-GB")}</time></div>
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
      {!shown.length && <p className="muted">Nothing here.</p>}
    </div>
  );
}

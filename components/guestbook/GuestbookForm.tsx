"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import Leopard from "@/components/mascot/Leopard";
import { LIMITS, validate, type FieldErrors } from "@/lib/guestbook/schema";

type State = { phase: "idle" | "sending" | "done" | "error"; message?: string; status?: string };

export default function GuestbookForm({ active }: { active: boolean }) {
  const [values, setValues] = useState({ name: "", message: "", link: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ phase: "idle" });
  const [token, setToken] = useState<string | null>(null);
  const id = useId();

  const loadToken = () => fetch("/api/guestbook/token", { cache: "no-store" }).then((r) => r.json()).then((d) => setToken(d.token ?? null)).catch(() => setToken(null));
  useEffect(() => { if (active) loadToken(); }, [active]);

  const v = validate(values);
  const errors: FieldErrors = { ...(v.ok ? {} : v.errors), ...serverErrors };
  const show = (k: keyof FieldErrors) => (touched[k] || state.phase === "error") && errors[k];

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, message: true, link: true });
    if (!v.ok) { setState({ phase: "error", message: "Check the highlighted fields." }); return; }
    setState({ phase: "sending" });
    const company = (e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, token, company }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setState({ phase: "done", status: data.status }); setValues({ name: "", message: "", link: "" }); setTouched({}); return; }
      if (data.errors) setServerErrors(data.errors);
      setState({ phase: "error", message: data.error ?? "Check the highlighted fields." });
      if (res.status === 400) loadToken();
    } catch {
      setState({ phase: "error", message: "Network trouble. Your note wasn't sent; please try again." });
    }
  };

  if (!active) {
    return <p className="gb-notice" role="status">The guestbook is moving to its new home and isn’t taking notes just yet. Signing opens shortly. In the meantime, say hello at <a className="text-link" href="mailto:hello@mojeeb.xyz">hello@mojeeb.xyz</a>.</p>;
  }

  if (state.phase === "done") {
    return (
      <div className="gb-done" role="status">
        <Leopard pose="celebrate" expression="happy" size={120} />
        <div>
          <p className="h3">Thank you. The leopard approves.</p>
          <p className="muted">{state.status === "approved" ? "Your note is live in the guestbook." : "Your note will appear after a quick review. That keeps the guestbook free of spam."}</p>
          <button type="button" className="text-btn" onClick={() => { setState({ phase: "idle" }); loadToken(); }}>Sign again</button>
        </div>
      </div>
    );
  }

  const count = (k: "name" | "message") => `${values[k].length}/${LIMITS[k].max}`;
  return (
    <form className="gb-form" onSubmit={onSubmit} noValidate aria-describedby={`${id}-privacy`}>
      <div className="gb-field">
        <label htmlFor={`${id}-name`}>Name or nickname</label>
        <input id={`${id}-name`} name="name" autoComplete="nickname" maxLength={LIMITS.name.max + 10} value={values.name}
          onChange={(e) => { setValues({ ...values, name: e.target.value }); setServerErrors({ ...serverErrors, name: undefined }); }}
          onBlur={() => setTouched({ ...touched, name: true })} aria-invalid={Boolean(show("name"))} aria-describedby={`${id}-name-msg`} required />
        <p id={`${id}-name-msg`} className="gb-msg">{show("name") ? <span className="gb-err">{errors.name}</span> : <span className="meta">{count("name")}</span>}</p>
      </div>
      <div className="gb-field">
        <label htmlFor={`${id}-message`}>Message</label>
        <textarea id={`${id}-message`} name="message" rows={4} maxLength={LIMITS.message.max + 20} value={values.message}
          onChange={(e) => { setValues({ ...values, message: e.target.value }); setServerErrors({ ...serverErrors, message: undefined }); }}
          onBlur={() => setTouched({ ...touched, message: true })} aria-invalid={Boolean(show("message"))} aria-describedby={`${id}-message-msg`} required />
        <p id={`${id}-message-msg`} className="gb-msg">{show("message") ? <span className="gb-err">{errors.message}</span> : <span className="meta">{count("message")}</span>}</p>
      </div>
      <div className="gb-field">
        <label htmlFor={`${id}-link`}>Website or profile <span className="meta">(optional)</span></label>
        <input id={`${id}-link`} name="link" type="url" inputMode="url" autoComplete="url" placeholder="https://" value={values.link}
          onChange={(e) => { setValues({ ...values, link: e.target.value }); setServerErrors({ ...serverErrors, link: undefined }); }}
          onBlur={() => setTouched({ ...touched, link: true })} aria-invalid={Boolean(show("link"))} aria-describedby={`${id}-link-msg`} />
        <p id={`${id}-link-msg`} className="gb-msg">{show("link") ? <span className="gb-err">{errors.link}</span> : <span className="meta">Shown as a nofollow link.</span>}</p>
      </div>
      {/* Honeypot: hidden from people and assistive tech */}
      <div className="gb-hp" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="gb-actions">
        <button type="submit" className="btn btn--primary" disabled={state.phase === "sending" || !token}>{state.phase === "sending" ? "Signing…" : "Sign the guestbook"}</button>
        <p className="gb-status" role="status" aria-live="polite">{state.phase === "error" ? <span className="gb-err">{state.message}</span> : !token ? <span className="meta">Preparing the form…</span> : null}</p>
      </div>
      <p id={`${id}-privacy`} className="gb-privacy meta">
        Privacy: your name, message and optional link are shown publicly after review. Your IP address is never stored or published; only a salted hash is kept, to limit abuse. Ask me to remove an entry at any time: hello@mojeeb.xyz.
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import type { LeopardAnswer, LeopardLine } from "@/lib/leopard/types";
import "./leopard.css";

type Props = {
  lines: LeopardLine[];
  /** A first line for this visitor (referrer or Lagos time). Shown before the facts. */
  opener?: string | null;
  tone?: "light" | "dark";
};

const SUGGESTIONS = ["What is Arcapush?", "Can I hire Mojeeb?", "What's StackBrief?"];

const isInternal = (href: string) => href.startsWith("/");

/** The leopard's voice: rotating true facts, plus "ask me anything" answered from the site (and an AI model when enabled). */
export default function LeopardChat({ lines, opener, tone = "light" }: Props) {
  const [idx, setIdx] = useState(opener ? -1 : 0);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState<LeopardAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const qid = useId();

  const line = idx >= 0 ? lines[idx % lines.length] : null;
  const say = answer?.text ?? (line ? line.text : opener ?? "");
  const href = answer ? answer.href : line?.href;
  const cta = answer ? "Take me there" : line?.cta;

  const next = () => { setAnswer(null); setError(null); setIdx((i) => (i + 1) % Math.max(lines.length, 1)); };

  async function ask(q: string) {
    const text = q.replace(/\s+/g, " ").trim();
    if (text.length < 2 || pending) return;
    setPending(true); setError(null);
    try {
      const res = await fetch("/api/leopard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: text }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.text !== "string") setError(typeof data.error === "string" ? data.error : "The leopard couldn't answer just now.");
      else { setAnswer(data as LeopardAnswer); setQuestion(""); }
    } catch {
      setError("The leopard couldn't answer just now.");
    } finally {
      setPending(false);
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void ask(question); };

  return (
    <div className={`lchat lchat--${tone}`}>
      <p className="lchat__say" aria-live="polite">{pending ? <span className="lchat__thinking">Thinking<span aria-hidden="true">…</span></span> : say}</p>
      {!pending && href && cta && (
        isInternal(href)
          ? <Link href={href} className="lchat__link">{cta} <span aria-hidden="true">→</span></Link>
          : <a href={href} className="lchat__link">{cta} <span aria-hidden="true">↗</span></a>
      )}
      {error && <p className="lchat__error" role="alert">{error}</p>}
      <div className="lchat__row">
        <button type="button" className="lchat__next" onClick={next}>{answer ? "Back to the news" : "Tell me something else"}</button>
        {answer && <span className="lchat__source">{answer.source === "ai" ? "Answered by AI from this site's content" : "Answered from this site"}</span>}
      </div>
      <form className="lchat__ask" onSubmit={onSubmit}>
        <label htmlFor={qid} className="sr-only">Ask the leopard about Mojeeb&apos;s work</label>
        <input id={qid} ref={input} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={280} placeholder="Ask me about Mojeeb's work…" autoComplete="off" />
        <button type="submit" disabled={pending || question.trim().length < 2}>Ask</button>
      </form>
      {!answer && !pending && (
        <div className="lchat__chips" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => <button type="button" key={s} onClick={() => { setQuestion(s); void ask(s); }}>{s}</button>)}
        </div>
      )}
    </div>
  );
}

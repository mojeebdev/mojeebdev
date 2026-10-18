import Reactions from "./Reactions";
import type { PublicEntry } from "@/lib/guestbook/schema";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

export default function GuestbookList({ entries, reactions = true }: { entries: PublicEntry[]; reactions?: boolean }) {
  if (!entries.length) return <p className="gb-empty muted">No notes yet. The first signature could be yours.</p>;
  return (
    <ol role="list" className="gb-list">
      {entries.map((e) => (
        <li key={e.id} className="gb-entry">
          <div className="gb-entry__head">
            <span className="gb-entry__name">{e.name}</span>
            {e.link && <a href={e.link} rel="ugc nofollow noopener noreferrer" target="_blank" className="gb-entry__link">{host(e.link)} ↗</a>}
            <time className="meta" dateTime={e.created_at}>{when(e.created_at)}</time>
          </div>
          <p className="gb-entry__msg">{e.message}</p>
          {reactions && <Reactions id={e.id} counts={e.reactions} />}
        </li>
      ))}
    </ol>
  );
}

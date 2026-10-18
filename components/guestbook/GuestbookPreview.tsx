import "./guestbook.css";
import Link from "next/link";
import GuestbookList from "./GuestbookList";
import { getStore } from "@/lib/guestbook/store";
import type { PublicEntry } from "@/lib/guestbook/schema";

export default async function GuestbookPreview() {
  const store = getStore();
  let entries: PublicEntry[] = [];
  let failed = false;
  if (store) { try { entries = await store.listApproved(3); } catch { failed = true; } }
  return (
    <div className="gb-preview">
      {store && !failed ? <GuestbookList entries={entries} reactions={false} /> : <p className="muted">{failed ? "Notes couldn’t load right now." : "The guestbook opens once its database is connected."}</p>}
      <Link href="/guestbook" className="btn">Sign the guestbook <span aria-hidden="true">→</span></Link>
    </div>
  );
}

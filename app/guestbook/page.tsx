import type { Metadata } from "next";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import GuestbookList from "@/components/guestbook/GuestbookList";
import JsonLd from "@/components/ui/JsonLd";
import { getStore } from "@/lib/guestbook/store";
import type { PublicEntry } from "@/lib/guestbook/schema";
import { breadcrumbs } from "@/lib/jsonLd";
import "@/components/guestbook/guestbook.css";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign Mojeeb Titilayo's guestbook. No account needed: leave a note and, if you like, a link back to your work.",
  alternates: { canonical: "/guestbook" },
};
export const revalidate = 60;

export default async function GuestbookPage() {
  const store = getStore();
  let entries: PublicEntry[] = [];
  let failed = false;
  if (store) { try { entries = await store.listApproved(100); } catch { failed = true; } }
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "Guestbook", path: "/guestbook" }])} />
      <header className="page-head">
        <p className="label">Guestbook</p>
        <h1 className="h1">Leave a note</h1>
        <p className="dek">A small archive of the people who passed through. Say hello, share what you’re building, or leave a link. No account needed.</p>
      </header>
      <div className="gb-layout">
        <section aria-label="Sign the guestbook" className="gb-panel"><GuestbookForm configured={Boolean(store)} /></section>
        <section aria-labelledby="gb-entries-title">
          <h2 id="gb-entries-title" className="label" style={{ marginBottom: 12 }}>{entries.length ? `${entries.length} ${entries.length === 1 ? "note" : "notes"}` : "Notes"}</h2>
          {failed ? <p className="muted">Notes couldn’t load right now. Please check back shortly.</p> : <GuestbookList entries={entries} />}
        </section>
      </div>
    </>
  );
}

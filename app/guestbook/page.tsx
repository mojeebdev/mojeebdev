import type { Metadata } from "next";
import GuestbookFeed from "@/components/guestbook/GuestbookFeed";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import JsonLd from "@/components/ui/JsonLd";
import { getGuestbook } from "@/lib/guestbook/server";
import type { Page } from "@/lib/guestbook/store";
import { breadcrumbs } from "@/lib/jsonLd";
import { errorFields, logEvent } from "@/lib/server/log";
import "@/components/guestbook/guestbook.css";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign Mojeeb Titilayo's guestbook. No account needed: leave a note and, if you like, a link back to your work.",
  alternates: { canonical: "/guestbook" },
};
// Read from D1 on every request so approvals show immediately on every Worker isolate.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function GuestbookPage() {
  const gb = getGuestbook();
  let page: Page = { entries: [], nextCursor: null };
  let total = 0;
  let failed = false;
  if (gb.active) {
    try { [page, total] = await Promise.all([gb.guestbook.store.listApproved(PAGE_SIZE), gb.guestbook.store.countApproved()]); }
    catch (err) { failed = true; logEvent("error", "guestbook.page_failed", errorFields(err)); }
  }
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "Guestbook", path: "/guestbook" }])} />
      <header className="page-head">
        <p className="label">Guestbook</p>
        <h1 className="h1">Leave a note</h1>
        <p className="dek">A small archive of the people who passed through. Say hello, share what you’re building, or leave a link. No account needed.</p>
      </header>
      <div className="gb-layout">
        <section aria-label="Sign the guestbook" className="gb-panel"><GuestbookForm active={gb.active} /></section>
        <section aria-labelledby="gb-entries-title">
          <h2 id="gb-entries-title" className="label" style={{ marginBottom: 12 }}>{total ? `${total} ${total === 1 ? "note" : "notes"}` : "Notes"}</h2>
          {!gb.active
            ? <p className="muted">Notes will appear here once the guestbook opens.</p>
            : failed
              ? <p className="muted">Notes couldn’t load right now. Please check back shortly.</p>
              : <GuestbookFeed initial={page.entries} initialCursor={page.nextCursor} />}
        </section>
      </div>
    </>
  );
}

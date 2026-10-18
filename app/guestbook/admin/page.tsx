import type { Metadata } from "next";
import GuestbookAdmin from "@/components/guestbook/GuestbookAdmin";
import "@/components/guestbook/guestbook.css";

export const metadata: Metadata = { title: "Guestbook moderation", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <>
      <header className="page-head"><p className="label">Guestbook</p><h1 className="h1">Moderation</h1><p className="dek">Approve, return to pending, mark as spam, or delete entries. Protected by Cloudflare Access (or the admin token before Access is set up).</p></header>
      <GuestbookAdmin />
    </>
  );
}

import { describe, expect, it } from "vitest";
import { decodeCursor, guestbookStore } from "@/lib/guestbook/store";
import { createTestD1 } from "./d1";

const IP = "a".repeat(32);

async function seeded(n: number, status: "approved" | "pending" = "approved") {
  const db = createTestD1();
  const store = guestbookStore(db);
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const { id } = await store.create({ name: `Visitor ${i}`, message: `Note number ${i}`, link: null, status, ipHash: IP });
    // Distinct, increasing timestamps so ordering is deterministic.
    db.raw.prepare("UPDATE guestbook_entries SET created_at = ? WHERE id = ?").run(new Date(Date.UTC(2026, 9, 1, 0, i)).toISOString(), id);
    ids.push(id);
  }
  return { db, store, ids };
}

describe("D1 guestbook store", () => {
  it("lists only approved entries, newest first, in the public shape", async () => {
    const { store, ids } = await seeded(2);
    await store.create({ name: "Hidden", message: "pending note", link: null, status: "pending", ipHash: IP });
    await store.create({ name: "Spammer", message: "spam note", link: null, status: "spam", ipHash: IP });
    const page = await store.listApproved(10);
    expect(page.entries.map((e) => e.id)).toEqual([ids[1], ids[0]]);
    expect(page.entries[0]).toEqual({ id: ids[1], created_at: expect.any(String), name: "Visitor 1", message: "Note number 1", link: null, reactions: { wave: 0, heart: 0, paw: 0 } });
    expect(page.entries[0]).not.toHaveProperty("ip_hash");
    expect(page.nextCursor).toBeNull();
    expect(await store.countApproved()).toBe(2);
  });

  it("paginates with a keyset cursor without gaps or repeats", async () => {
    const { store, ids } = await seeded(7);
    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const page = await store.listApproved(3, cursor);
      seen.push(...page.entries.map((e) => e.id));
      cursor = page.nextCursor;
    } while (cursor);
    expect(seen).toEqual([...ids].reverse());
    expect(decodeCursor("garbage!")).toBeNull();
    expect((await store.listApproved(3, "not-a-cursor")).entries).toHaveLength(3);
  });

  it("counts recent submissions per IP hash for rate limiting", async () => {
    const { store } = await seeded(0);
    await store.create({ name: "A", message: "hello", link: null, status: "pending", ipHash: IP });
    await store.create({ name: "B", message: "hello", link: null, status: "pending", ipHash: "b".repeat(32) });
    expect(await store.recentByIp(IP, 10)).toBe(1);
  });

  it("moderates atomically with an audit trail that survives deletion", async () => {
    const { db, store } = await seeded(0);
    const { id } = await store.create({ name: "A", message: "hello", link: "https://example.com/", status: "pending", ipHash: IP });
    expect(await store.moderate(id, "approve", "mojeeb@example.com")).toBe(true);
    expect((await store.listForModeration("approved"))[0]).toMatchObject({ id, status: "approved" });
    expect(await store.counts()).toEqual({ pending: 0, approved: 1, spam: 0 });
    expect(await store.moderate(id, "delete", "mojeeb@example.com")).toBe(true);
    expect(await store.moderate(id, "approve", "mojeeb@example.com")).toBe(false);
    const log = db.raw.prepare("SELECT action, from_status, actor FROM guestbook_moderation_log ORDER BY id").all();
    expect(log).toEqual([
      { action: "approve", from_status: "pending", actor: "mojeeb@example.com" },
      { action: "delete", from_status: "approved", actor: "mojeeb@example.com" },
    ]);
  });

  it("counts reactions on approved entries only", async () => {
    const { store, ids } = await seeded(1);
    const { id: pending } = await store.create({ name: "P", message: "pending", link: null, status: "pending", ipHash: IP });
    expect(await store.react(ids[0], "paw")).toBe(true);
    expect(await store.react(pending, "paw")).toBe(false);
    expect((await store.listApproved(1)).entries[0].reactions.paw).toBe(1);
  });

  it("enforces constraints in the database itself", async () => {
    const { store } = await seeded(0);
    await expect(store.create({ name: "x".repeat(41), message: "hello", link: null, status: "pending", ipHash: IP })).rejects.toThrow();
    await expect(store.create({ name: "A", message: "hello", link: "javascript:alert(1)", status: "pending", ipHash: IP })).rejects.toThrow();
    await expect(store.create({ name: "A", message: "hello", link: null, status: "live" as never, ipHash: IP })).rejects.toThrow();
  });
});

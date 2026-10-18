import { describe, expect, it } from "vitest";
import { isEntryId, normaliseLink, validate } from "@/lib/guestbook/schema";

describe("guestbook validation", () => {
  it("accepts a normal entry and trims it", () => {
    const v = validate({ name: "  Ada  Lovelace ", message: " Hello there \r\n", link: "" });
    expect(v).toEqual({ ok: true, data: { name: "Ada Lovelace", message: "Hello there", link: null } });
  });
  it("rejects empty and over-long fields with field messages", () => {
    const v = validate({ name: "", message: "x".repeat(501) });
    expect(v.ok).toBe(false);
    if (!v.ok) { expect(v.errors.name).toBeTruthy(); expect(v.errors.message).toBeTruthy(); }
  });
  it("strips control and bidi-override characters", () => {
    const v = validate({ name: "A‮b\u0000c", message: "hi\u0007 there" });
    expect(v.ok && v.data).toEqual({ name: "Abc", message: "hi there", link: null });
  });
  it("normalises links and refuses unsafe schemes and credentials", () => {
    expect(normaliseLink("example.com/me")).toBe("https://example.com/me");
    expect(normaliseLink("javascript:alert(1)")).toBeNull();
    expect(normaliseLink("https://user:pw@example.com")).toBeNull();
    expect(normaliseLink("http://localhost")).toBeNull();
    expect(validate({ name: "A", message: "hello", link: "data:text/html,x" }).ok).toBe(false);
  });
  it("recognises entry ids", () => {
    expect(isEntryId(crypto.randomUUID())).toBe(true);
    expect(isEntryId("1 OR 1=1")).toBe(false);
  });
});

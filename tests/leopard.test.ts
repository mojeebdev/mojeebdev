import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkerBindings } from "@/lib/server/types";
import type { Pulse } from "@/lib/leopard/types";

const env: { current: WorkerBindings } = { current: {} };
vi.mock("@/lib/server/bindings", () => ({ getBindings: () => env.current }));
const askModel = vi.fn();
vi.mock("@/lib/leopard/ai", () => ({ askModel: (...args: unknown[]) => askModel(...args) }));

const pulse: Pulse = { github: { week: 42, weekEnd: "2026-11-01", streak: 9 }, arcapush: { indexed: 310, visits: 5000 }, npm30: 1200, projects: 56, caseStudies: 6 };
vi.mock("@/lib/data/pulse", () => ({ getPulse: async () => pulse }));

const { POST } = await import("@/app/api/leopard/route");
const { answerLocally, allowedLinks } = await import("@/lib/leopard/knowledge");
const { pulseLines, openerFor } = await import("@/lib/leopard/lines");
const { parseReply } = await vi.importActual<typeof import("@/lib/leopard/ai")>("@/lib/leopard/ai");

let ip = 0;
const ask = (body: unknown, headers: Record<string, string> = {}) =>
  POST(new Request("https://mojeeb.xyz/api/leopard", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://mojeeb.xyz", "cf-connecting-ip": `203.0.113.${ip}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));

describe("the leopard's local answers", () => {
  it("matches questions to entries with a link", () => {
    expect(answerLocally("What is Arcapush?").href).toBe("/work/arcapush");
    expect(answerLocally("Can I hire Mojeeb for a project?").href).toBe("/contact");
    expect(answerLocally("what's stackbrief")).toMatchObject({ href: "/work/stackbrief", source: "site" });
    expect(answerLocally("where are you based?").text).toMatch(/Lagos/);
  });
  it("falls back to an archive project by name, then to an honest don't-know", () => {
    expect(answerLocally("tell me about ratssacre").text).toMatch(/^Ratssacre:/);
    expect(answerLocally("qwerty zxcv").text).toMatch(/stumped/);
  });
});

describe("pulse lines", () => {
  it("states only figures that are present", () => {
    const lines = pulseLines(pulse);
    expect(lines[0].text).toBe("Mojeeb made 42 public GitHub contributions in the 7 days to 1 Nov. That's a 9-day streak.");
    expect(lines.map((l) => l.text).join(" ")).toMatch(/indexing 310 builds/);
    const sparse = pulseLines({ ...pulse, github: { week: 0, weekEnd: null, streak: 0 }, arcapush: { indexed: null, visits: null }, npm30: null });
    expect(sparse.map((l) => l.text).join(" ")).not.toMatch(/GitHub|Arcapush|npm/);
    expect(pulseLines(pulse, { den: true }).at(-1)?.href).toBe("/guestbook");
    expect(pulseLines(pulse).at(-1)?.href).toBe("/");
  });
  it("greets by referrer, ignoring the site itself, else by Lagos time", () => {
    expect(openerFor("https://t.co/abc", "mojeeb.xyz", 10, "10:00am")).toMatch(/from X/);
    expect(openerFor("https://www.linkedin.com/feed", "mojeeb.xyz", 10, "10:00am")).toMatch(/LinkedIn/);
    expect(openerFor("https://mojeeb.xyz/work", "mojeeb.xyz", 9, "9:00am")).toBe("Good morning from Lagos.");
    expect(openerFor("", "mojeeb.xyz", 23, "11:12pm")).toMatch(/11:12pm in Lagos/);
  });
});

describe("model reply parsing", () => {
  it("keeps allowed links and drops anything else", () => {
    expect(parseReply("Arcapush is a registry.\nLINK: /work/arcapush")).toEqual({ text: "Arcapush is a registry.", href: "/work/arcapush" });
    expect(parseReply("Hi.\nLINK: https://evil.example")).toEqual({ text: "Hi.", href: undefined });
    expect(parseReply("**Bold** answer")?.text).toBe("Bold answer");
    expect(allowedLinks.has("/profile")).toBe(true);
  });
});

describe("POST /api/leopard", () => {
  beforeEach(() => { ip++; env.current = {}; askModel.mockReset(); vi.spyOn(console, "log").mockImplementation(() => {}); vi.spyOn(console, "warn").mockImplementation(() => {}); });

  it("answers from the site without an API key", async () => {
    const res = await ask({ question: "What is Arcapush?" });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ href: "/work/arcapush", source: "site" });
    expect(askModel).not.toHaveBeenCalled();
  });

  it("uses the OpenRouter model when a key is set, and falls back when it returns nothing", async () => {
    env.current = { OPENROUTER_API_KEY: "sk-or-test", OPENROUTER_MODEL: "openai/gpt-oss-120b" };
    askModel.mockResolvedValueOnce({ text: "From the model.", source: "ai" });
    expect(await (await ask({ question: "What is Arcapush?" })).json()).toEqual({ text: "From the model.", source: "ai" });
    expect(askModel).toHaveBeenCalledWith("What is Arcapush?", pulse, "sk-or-test", "openai/gpt-oss-120b");
    askModel.mockResolvedValueOnce(null);
    expect((await (await ask({ question: "What is Arcapush?" })).json()).source).toBe("site");
  });

  it("validates requests", async () => {
    expect((await ask({ question: "a" })).status).toBe(422);
    expect((await ask({ question: "x".repeat(281) })).status).toBe(422);
    expect((await ask({ nope: true })).status).toBe(422);
    expect((await ask("not json")).status).toBe(400);
    expect((await ask({ question: "hello" }, { origin: "https://evil.example" })).status).toBe(403);
    expect((await ask({ question: "hello" }, { "content-type": "text/plain" })).status).toBe(415);
  });

  it("rate-limits per visitor", async () => {
    for (let i = 0; i < 8; i++) expect((await ask({ question: "hello there" })).status).toBe(200);
    expect((await ask({ question: "hello there" })).status).toBe(429);
  });

  it("respects the Workers rate limiter", async () => {
    env.current = { LEOPARD_LIMITER: { limit: async () => ({ success: false }) } };
    expect((await ask({ question: "hello there" })).status).toBe(429);
  });
});

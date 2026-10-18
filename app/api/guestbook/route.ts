import { validate } from "@/lib/guestbook/schema";
import { checkToken, clientIp, hashIp, looksSpammy, rateLimited } from "@/lib/guestbook/security";
import { getGuestbook, noStoreJson as json } from "@/lib/guestbook/server";
import { errorFields, logEvent } from "@/lib/server/log";

export const dynamic = "force-dynamic";

const TOO_MANY = "You've signed a few times already. Try again in a few minutes.";

/** Public, approved entries only. `?cursor=` continues from the previous page; `?limit=` is capped at 50. */
export async function GET(req: Request) {
  const gb = getGuestbook();
  if (!gb.active) return json({ active: false, entries: [], nextCursor: null });
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit")) || 20;
  try {
    return json({ active: true, ...(await gb.guestbook.store.listApproved(limit, url.searchParams.get("cursor"))) });
  } catch (err) {
    logEvent("error", "guestbook.list_failed", errorFields(err));
    return json({ active: true, error: "The guestbook couldn't load entries right now." }, 502);
  }
}

export async function POST(req: Request) {
  const gb = getGuestbook();
  if (!gb.active) return json({ error: "The guestbook isn't open yet. Its database is still being connected." }, 503);
  const { store, salt, autoApprove, limiter } = gb.guestbook;

  if (Number(req.headers.get("content-length") ?? 0) > 4096) return json({ error: "That's too long to send." }, 413);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: "Cross-site submissions aren't accepted." }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return json({ error: "Malformed request." }, 415);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Malformed request." }, 400); }
  if (!body || typeof body !== "object") return json({ error: "Malformed request." }, 400);

  // Honeypot: a field people never see. Pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim()) {
    logEvent("info", "guestbook.honeypot");
    return json({ ok: true, status: "pending" }, 201);
  }

  const token = await checkToken(body.token, salt);
  if (token === "invalid") return json({ error: "This form expired. Refresh the page and try again." }, 400);
  if (token === "fast") return json({ error: "That was quick. Give it a second and send again." }, 429);

  const v = validate(body);
  if (!v.ok) return json({ errors: v.errors }, 422);

  // Three layers: this isolate, the Workers rate limiter (across isolates, if bound), and D1 (authoritative).
  const ipHash = await hashIp(clientIp(req.headers), salt);
  if (rateLimited(`gb:${ipHash}`, 3, 10 * 60_000)) return json({ error: TOO_MANY }, 429);
  if (limiter && !(await limiter.limit({ key: `gb:${ipHash}` })).success) return json({ error: TOO_MANY }, 429);

  try {
    if ((await store.recentByIp(ipHash, 10)) >= 3) return json({ error: TOO_MANY }, 429);
    const status = looksSpammy(v.data.name, v.data.message) ? "spam" : autoApprove ? "approved" : "pending";
    await store.create({ ...v.data, status, ipHash });
    logEvent("info", "guestbook.submitted", { status });
    // Spam is reported as pending: the sender sees the normal "after review" message.
    return json({ ok: true, status: status === "spam" ? "pending" : status }, 201);
  } catch (err) {
    logEvent("error", "guestbook.submit_failed", errorFields(err));
    return json({ error: "Something went wrong saving your note. Please try again." }, 502);
  }
}

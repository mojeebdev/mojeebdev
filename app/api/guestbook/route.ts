import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validate } from "@/lib/guestbook/schema";
import { checkToken, clientIp, hashIp, looksSpammy, rateLimited } from "@/lib/guestbook/security";
import { autoApprove, getStore } from "@/lib/guestbook/store";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const store = getStore();
  if (!store) return json({ configured: false, entries: [] });
  try { return json({ configured: true, entries: await store.listApproved(100) }); }
  catch { return json({ configured: true, error: "The guestbook couldn't load entries right now." }, 502); }
}

export async function POST(req: Request) {
  const store = getStore();
  if (!store) return json({ error: "The guestbook isn't connected to its database yet." }, 503);
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return json({ error: "That's too long to send." }, 413);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return json({ error: "Cross-site submissions aren't accepted." }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Malformed request." }, 400); }

  // Honeypot: a field humans never see. Pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim()) return json({ ok: true, status: "pending" });

  const token = checkToken(body.token);
  if (token === "invalid") return json({ error: "This form expired. Refresh the page and try again." }, 400);
  if (token === "fast") return json({ error: "That was quick. Give it a second and send again." }, 429);

  const v = validate(body);
  if (!v.ok) return json({ errors: v.errors }, 422);

  const ipHash = hashIp(clientIp(req.headers));
  if (rateLimited(`gb:${ipHash}`, 3, 10 * 60_000)) return json({ error: "You've signed a few times already. Try again in a few minutes." }, 429);

  try {
    if ((await store.recentByIp(ipHash, 10)) >= 3) return json({ error: "You've signed a few times already. Try again in a few minutes." }, 429);
    const status = looksSpammy(v.data.name, v.data.message) ? "spam" : autoApprove() ? "approved" : "pending";
    await store.create({ ...v.data, status, ipHash });
    if (status === "approved") { revalidatePath("/guestbook"); revalidatePath("/"); }
    return json({ ok: true, status: status === "spam" ? "pending" : status }, 201);
  } catch {
    return json({ error: "Something went wrong saving your note. Please try again." }, 502);
  }
}

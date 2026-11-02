import { getPulse } from "@/lib/data/pulse";
import { noStoreJson as json } from "@/lib/guestbook/server";
import { clientIp, rateLimited } from "@/lib/guestbook/security";
import { askClaude } from "@/lib/leopard/claude";
import { answerLocally } from "@/lib/leopard/knowledge";
import { getBindings } from "@/lib/server/bindings";

export const dynamic = "force-dynamic";

const QUESTION = { min: 2, max: 280 } as const;

/**
 * Ask the leopard. With ANTHROPIC_API_KEY set, Claude answers from this site's content and live figures; without it,
 * or if Claude fails or declines, the leopard answers from hand-written entries. Questions are never stored.
 */
export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > 2048) return json({ error: "That's a long question. Try a shorter one." }, 413);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: "Cross-site requests aren't accepted." }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return json({ error: "Malformed request." }, 415);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "Malformed request." }, 400); }
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>).question : undefined;
  const question = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
  if (question.length < QUESTION.min || question.length > QUESTION.max) return json({ error: `Ask in ${QUESTION.min}–${QUESTION.max} characters.` }, 422);

  const env = getBindings();
  const ip = clientIp(req.headers);
  if (rateLimited(`leopard:${ip}`, 8, 60_000)) return json({ error: "The leopard needs a breather. Try again in a minute." }, 429);
  if (env.LEOPARD_LIMITER && !(await env.LEOPARD_LIMITER.limit({ key: `leopard:${ip}` })).success) {
    return json({ error: "The leopard needs a breather. Try again in a minute." }, 429);
  }

  if (env.ANTHROPIC_API_KEY) {
    const answer = await askClaude(question, await getPulse({ npm: false }), env.ANTHROPIC_API_KEY);
    if (answer) return json(answer);
  }
  return json(answerLocally(question));
}

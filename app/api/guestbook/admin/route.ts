import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminCookieOk } from "@/lib/guestbook/security";
import { getStore } from "@/lib/guestbook/store";

export const dynamic = "force-dynamic";

async function authed() { return adminCookieOk((await cookies()).get(ADMIN_COOKIE)?.value); }

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const store = getStore();
  if (!store) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  return NextResponse.json({ entries: await store.listForModeration(), store: store.kind }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const store = getStore();
  if (!store) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { id, action } = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 422 });
  if (action === "approve") await store.setStatus(id, "approved");
  else if (action === "pending") await store.setStatus(id, "pending");
  else if (action === "spam") await store.setStatus(id, "spam");
  else if (action === "delete") await store.remove(id);
  else return NextResponse.json({ error: "Invalid action" }, { status: 422 });
  revalidatePath("/guestbook"); revalidatePath("/");
  return NextResponse.json({ ok: true });
}

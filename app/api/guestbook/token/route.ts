import { issueToken } from "@/lib/guestbook/security";
import { getGuestbook, noStoreJson as json } from "@/lib/guestbook/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const gb = getGuestbook();
  if (!gb.active) return json({ active: false, token: null }, 503);
  return json({ active: true, token: await issueToken(gb.guestbook.salt) });
}

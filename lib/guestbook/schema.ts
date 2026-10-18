/** Guestbook validation, shared by the client form (live feedback) and the server (authoritative). */
export const LIMITS = { name: { min: 1, max: 40 }, message: { min: 2, max: 500 }, link: { max: 200 } } as const;
export const REACTIONS = ["wave", "heart", "paw"] as const;
export type ReactionKind = (typeof REACTIONS)[number];

export type GuestbookInput = { name: string; message: string; link?: string };
export type FieldErrors = Partial<Record<keyof GuestbookInput, string>>;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;
const clean = (s: unknown) => (typeof s === "string" ? s.replace(CONTROL, "").replace(/\r\n?/g, "\n").trim() : "");

export function normaliseLink(raw: string): string | null {
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password || !u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function validate(input: Record<string, unknown>): { ok: true; data: Required<Pick<GuestbookInput, "name" | "message">> & { link: string | null } } | { ok: false; errors: FieldErrors } {
  const name = clean(input.name).replace(/\s+/g, " ");
  const message = clean(input.message).replace(/\n{3,}/g, "\n\n");
  const linkRaw = clean(input.link);
  const errors: FieldErrors = {};
  if (name.length < LIMITS.name.min) errors.name = "Add a name or nickname.";
  else if (name.length > LIMITS.name.max) errors.name = `Keep it under ${LIMITS.name.max} characters.`;
  if (message.length < LIMITS.message.min) errors.message = "Write a short message.";
  else if (message.length > LIMITS.message.max) errors.message = `Keep it under ${LIMITS.message.max} characters.`;
  let link: string | null = null;
  if (linkRaw) {
    if (linkRaw.length > LIMITS.link.max) errors.link = "That link is too long.";
    else if (!(link = normaliseLink(linkRaw))) errors.link = "Use a full web address, like https://example.com.";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: { name, message, link } };
}

export const STATUSES = ["pending", "approved", "spam"] as const;
export type Status = (typeof STATUSES)[number];
export const MODERATION_ACTIONS = ["approve", "pending", "spam", "delete"] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

/** Public shape of an approved entry. Maps to D1 columns display_name / website_url (see lib/guestbook/store.ts). */
export type PublicEntry = {
  id: string;
  created_at: string;
  name: string;
  message: string;
  link: string | null;
  reactions: Record<ReactionKind, number>;
};

export type GuestbookEntry = PublicEntry & { status: Status; updated_at: string };

export const isEntryId = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

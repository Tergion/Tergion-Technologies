import { createHash } from "crypto";

const seenLeads = new Map<string, number>();
const duplicateWindowMs = 24 * 60 * 60 * 1000;

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export async function checkDuplicateLead(
  email: string,
  phone?: string,
): Promise<{ duplicateLikely: boolean; reason?: string }> {
  const now = Date.now();

  for (const [key, expiresAt] of seenLeads) {
    if (expiresAt <= now) {
      seenLeads.delete(key);
    }
  }

  const key = hash(`${normalize(email)}:${normalize(phone)}`);
  const existing = seenLeads.get(key);

  seenLeads.set(key, now + duplicateWindowMs);

  if (existing && existing > now) {
    return {
      duplicateLikely: true,
      reason: "similar-contact-submitted-recently",
    };
  }

  return { duplicateLikely: false };
}

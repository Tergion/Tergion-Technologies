const seenLeads = new Map<string, number>();
const duplicateWindowMs = 24 * 60 * 60 * 1000;

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

async function hash(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
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

  const key = await hash(`${normalize(email)}:${normalize(phone)}`);
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

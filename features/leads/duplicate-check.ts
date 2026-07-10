import { hasUpstashRedisConfig } from "@/lib/env";
import { runUpstashPipeline } from "@/features/leads/upstash";

const seenLeads = new Map<string, number>();
const duplicateWindowMs = 24 * 60 * 60 * 1000;
const duplicateWindowSeconds = duplicateWindowMs / 1000;

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

async function getDuplicateSignals(email: string, phone?: string) {
  const normalizedEmail = normalize(email);
  const normalizedPhone = normalize(phone);
  const signals = [
    {
      type: "email",
      value: normalizedEmail,
    },
    {
      type: "phone",
      value: normalizedPhone,
    },
  ].filter((signal) => signal.value);

  return Promise.all(
    signals.map(async (signal) => ({
      type: signal.type,
      key: `lead:duplicate:${signal.type}:${await hash(signal.value)}`,
    })),
  );
}

async function checkInMemoryDuplicateLead(email: string, phone?: string) {
  const now = Date.now();

  for (const [key, expiresAt] of seenLeads) {
    if (expiresAt <= now) {
      seenLeads.delete(key);
    }
  }

  const signals = await getDuplicateSignals(email, phone);
  const existing = signals.find((signal) => {
    const expiresAt = seenLeads.get(signal.key);

    return expiresAt && expiresAt > now;
  });

  for (const signal of signals) {
    seenLeads.set(signal.key, now + duplicateWindowMs);
  }

  if (existing) {
    return {
      duplicateLikely: true,
      reason: `${existing.type}-submitted-recently`,
    };
  }

  return { duplicateLikely: false };
}

async function checkUpstashDuplicateLead(email: string, phone?: string) {
  const signals = await getDuplicateSignals(email, phone);
  const results = await runUpstashPipeline(
    signals.map((signal) => [
      "SET",
      signal.key,
      "1",
      "EX",
      duplicateWindowSeconds,
      "NX",
    ]),
  );
  const existing = signals.find((signal, index) => !results[index]?.result);

  if (existing) {
    return {
      duplicateLikely: true,
      reason: `${existing.type}-submitted-recently`,
    };
  }

  return { duplicateLikely: false };
}

export async function checkDuplicateLead(
  email: string,
  phone?: string,
): Promise<{ duplicateLikely: boolean; reason?: string }> {
  if (hasUpstashRedisConfig()) {
    try {
      return await checkUpstashDuplicateLead(email, phone);
    } catch {
      return checkInMemoryDuplicateLead(email, phone);
    }
  }

  return checkInMemoryDuplicateLead(email, phone);
}

export function resetDuplicateLeadMemoryForTests() {
  seenLeads.clear();
}

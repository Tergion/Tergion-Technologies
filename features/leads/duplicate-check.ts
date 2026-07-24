import { hasUpstashRedisConfig } from "@/lib/env";
import { runUpstashPipeline } from "@/features/leads/upstash";

type DuplicateSignalType = "email" | "phone";
type SubmissionType = "quick_request" | "automation_assessment";

type DuplicateSignal = {
  type: DuplicateSignalType;
  value: string;
  hash: string;
};

type DuplicateWindow = {
  label: "cooldown" | "day";
  windowMs: number;
  maxSubmissions: number;
};

type DuplicateBucket = {
  count: number;
  resetAt: number;
};

const seenLeads = new Map<string, DuplicateBucket>();
const duplicateWindows = [
  {
    label: "cooldown",
    windowMs: 15 * 60 * 1000,
    maxSubmissions: 1,
  },
  {
    label: "day",
    windowMs: 24 * 60 * 60 * 1000,
    maxSubmissions: 3,
  },
] as const satisfies DuplicateWindow[];

function normalizeEmail(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhone(value: string | undefined) {
  return value?.replace(/\D/g, "") ?? "";
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
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const signals: Array<{ type: DuplicateSignalType; value: string }> = [];

  if (normalizedEmail) {
    signals.push({
      type: "email",
      value: normalizedEmail,
    });
  }

  if (normalizedPhone) {
    signals.push({
      type: "phone",
      value: normalizedPhone,
    });
  }

  return Promise.all(
    signals.map(
      async (signal): Promise<DuplicateSignal> => ({
        ...signal,
        hash: await hash(signal.value),
      }),
    ),
  );
}

function getSignalWindowKey(
  submissionType: SubmissionType,
  signal: DuplicateSignal,
  window: DuplicateWindow,
) {
  if (submissionType === "automation_assessment") {
    return `lead:duplicate:automation_assessment:${window.label}:${signal.type}:${signal.hash}`;
  }

  return `lead:duplicate:${window.label}:${signal.type}:${signal.hash}`;
}

function getDuplicateReason(
  signalType: DuplicateSignalType,
  windowLabel: DuplicateWindow["label"],
) {
  if (windowLabel === "cooldown") {
    return `${signalType}-submitted-too-recently`;
  }

  return `${signalType}-daily-limit`;
}

async function checkInMemoryDuplicateLead(
  submissionType: SubmissionType,
  email: string,
  phone: string | undefined,
  now: number,
) {
  for (const [key, bucket] of seenLeads) {
    if (bucket.resetAt <= now) {
      seenLeads.delete(key);
    }
  }

  const signals = await getDuplicateSignals(email, phone);
  let exceeded:
    | { signalType: DuplicateSignalType; windowLabel: DuplicateWindow["label"] }
    | undefined;

  for (const signal of signals) {
    for (const window of duplicateWindows) {
      const key = getSignalWindowKey(submissionType, signal, window);
      const current = seenLeads.get(key);

      if (!current) {
        seenLeads.set(key, {
          count: 1,
          resetAt: now + window.windowMs,
        });
        continue;
      }

      current.count += 1;

      if (!exceeded && current.count > window.maxSubmissions) {
        exceeded = {
          signalType: signal.type,
          windowLabel: window.label,
        };
      }
    }
  }

  if (exceeded) {
    return {
      duplicateLikely: true,
      reason: getDuplicateReason(exceeded.signalType, exceeded.windowLabel),
    };
  }

  return { duplicateLikely: false };
}

async function checkUpstashDuplicateLead(
  submissionType: SubmissionType,
  email: string,
  phone?: string,
) {
  const signals = await getDuplicateSignals(email, phone);
  const commands = signals.flatMap((signal) =>
    duplicateWindows.flatMap((window) => {
      const key = getSignalWindowKey(submissionType, signal, window);

      return [
        ["INCR", key],
        ["EXPIRE", key, window.windowMs / 1000],
      ];
    }),
  );
  const results = await runUpstashPipeline(commands);
  let resultIndex = 0;

  for (const signal of signals) {
    for (const window of duplicateWindows) {
      const count = Number(results[resultIndex]?.result ?? 0);
      resultIndex += 2;

      if (count > window.maxSubmissions) {
        return {
          duplicateLikely: true,
          reason: getDuplicateReason(signal.type, window.label),
        };
      }
    }
  }

  return { duplicateLikely: false };
}

export async function checkDuplicateLead(
  submissionType: SubmissionType,
  email: string,
  phone?: string,
  now = Date.now(),
): Promise<{ duplicateLikely: boolean; reason?: string }> {
  if (hasUpstashRedisConfig()) {
    try {
      return await checkUpstashDuplicateLead(submissionType, email, phone);
    } catch {
      return checkInMemoryDuplicateLead(submissionType, email, phone, now);
    }
  }

  return checkInMemoryDuplicateLead(submissionType, email, phone, now);
}

export function resetDuplicateLeadMemoryForTests() {
  seenLeads.clear();
}

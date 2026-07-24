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

type AssessmentDuplicateBucket = {
  submissionIds: Set<string>;
  resetAt: number;
};

const seenLeads = new Map<string, DuplicateBucket>();
const seenAssessmentSubmissions = new Map<
  string,
  AssessmentDuplicateBucket
>();
const completedAssessmentSubmissions = new Map<string, number>();
const completedAssessmentGoHighLevelSubmissions = new Map<
  string,
  number
>();
const activeAssessmentSubmissions = new Map<
  string,
  { token: string; expiresAt: number }
>();
const assessmentCompletionTtlMs = 24 * 60 * 60 * 1000;
const assessmentCompletionTtlSeconds = assessmentCompletionTtlMs / 1000;
const assessmentLeaseTtlSeconds = 5 * 60;
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
  signal: DuplicateSignal,
  window: DuplicateWindow,
) {
  return `lead:duplicate:${window.label}:${signal.type}:${signal.hash}`;
}

function getAssessmentSignalWindowKey(
  signal: DuplicateSignal,
  window: DuplicateWindow,
) {
  return `lead:duplicate:automation_assessment:v2:${window.label}:${signal.type}:${signal.hash}`;
}

function getAssessmentCompletionKey(leadId: string) {
  return `lead:submission:automation_assessment:v1:completed:${leadId}`;
}

function getAssessmentGoHighLevelCompletionKey(leadId: string) {
  return `lead:submission:automation_assessment:v1:gohighlevel-completed:${leadId}`;
}

function getAssessmentLeaseKey(leadId: string) {
  return `lead:submission:automation_assessment:v1:processing:${leadId}`;
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

function pruneExpiredDuplicateBuckets(now: number) {
  for (const [key, bucket] of seenLeads) {
    if (bucket.resetAt <= now) {
      seenLeads.delete(key);
    }
  }

  for (const [key, bucket] of seenAssessmentSubmissions) {
    if (bucket.resetAt <= now) {
      seenAssessmentSubmissions.delete(key);
    }
  }

  for (const [leadId, expiresAt] of completedAssessmentSubmissions) {
    if (expiresAt <= now) {
      completedAssessmentSubmissions.delete(leadId);
    }
  }

  for (
    const [leadId, expiresAt] of completedAssessmentGoHighLevelSubmissions
  ) {
    if (expiresAt <= now) {
      completedAssessmentGoHighLevelSubmissions.delete(leadId);
    }
  }

  for (const [leadId, lease] of activeAssessmentSubmissions) {
    if (lease.expiresAt <= now) {
      activeAssessmentSubmissions.delete(leadId);
    }
  }
}

export type AssessmentSubmissionLease = Readonly<{
  leadId: string;
  token: string;
  backend: "memory" | "upstash";
}>;

function acquireInMemoryAssessmentLease(
  leadId: string,
  token: string,
  now: number,
): AssessmentSubmissionLease | undefined {
  pruneExpiredDuplicateBuckets(now);

  if (activeAssessmentSubmissions.has(leadId)) {
    return undefined;
  }

  activeAssessmentSubmissions.set(leadId, {
    token,
    expiresAt: now + assessmentLeaseTtlSeconds * 1_000,
  });

  return Object.freeze({ leadId, token, backend: "memory" });
}

export async function acquireAssessmentSubmissionLease(
  leadId: string,
): Promise<AssessmentSubmissionLease | undefined> {
  const token = crypto.randomUUID();

  if (hasUpstashRedisConfig()) {
    try {
      const results = await runUpstashPipeline([
        [
          "SET",
          getAssessmentLeaseKey(leadId),
          token,
          "NX",
          "EX",
          assessmentLeaseTtlSeconds,
        ],
      ]);
      const result = results[0]?.result;

      if (result === "OK") {
        return Object.freeze({ leadId, token, backend: "upstash" });
      }

      if (result === null) {
        return undefined;
      }

      throw new Error("assessment-lease-unexpected-response");
    } catch {
      // Distributed coordination is required when Redis is configured.
      // Fail closed instead of allowing a second Worker isolate to proceed.
      return undefined;
    }
  }

  return acquireInMemoryAssessmentLease(leadId, token, Date.now());
}

export async function releaseAssessmentSubmissionLease(
  lease: AssessmentSubmissionLease,
) {
  if (lease.backend === "upstash") {
    try {
      await runUpstashPipeline([
        [
          "EVAL",
          "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
          1,
          getAssessmentLeaseKey(lease.leadId),
          lease.token,
        ],
      ]);
    } catch {
      // The bounded Redis lease expires without an unsafe unlock.
    }

    return;
  }

  const activeLease = activeAssessmentSubmissions.get(lease.leadId);

  if (activeLease?.token === lease.token) {
    activeAssessmentSubmissions.delete(lease.leadId);
  }
}

async function checkInMemoryQuickRequestDuplicateLead(
  email: string,
  phone: string | undefined,
  now: number,
) {
  pruneExpiredDuplicateBuckets(now);
  const signals = await getDuplicateSignals(email, phone);
  let exceeded:
    | { signalType: DuplicateSignalType; windowLabel: DuplicateWindow["label"] }
    | undefined;

  for (const signal of signals) {
    for (const window of duplicateWindows) {
      const key = getSignalWindowKey(signal, window);
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

async function checkInMemoryAssessmentDuplicateLead(
  email: string,
  phone: string | undefined,
  leadId: string,
  now: number,
) {
  pruneExpiredDuplicateBuckets(now);
  const signals = await getDuplicateSignals(email, phone);
  let exceeded:
    | { signalType: DuplicateSignalType; windowLabel: DuplicateWindow["label"] }
    | undefined;

  for (const signal of signals) {
    for (const window of duplicateWindows) {
      const key = getAssessmentSignalWindowKey(signal, window);
      const current = seenAssessmentSubmissions.get(key);

      if (!current) {
        seenAssessmentSubmissions.set(key, {
          submissionIds: new Set([leadId]),
          resetAt: now + window.windowMs,
        });
        continue;
      }

      current.submissionIds.add(leadId);

      if (
        !exceeded &&
        current.submissionIds.size > window.maxSubmissions
      ) {
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

async function checkUpstashQuickRequestDuplicateLead(
  email: string,
  phone?: string,
) {
  const signals = await getDuplicateSignals(email, phone);
  const commands = signals.flatMap((signal) =>
    duplicateWindows.flatMap((window) => {
      const key = getSignalWindowKey(signal, window);

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

async function checkUpstashAssessmentDuplicateLead(
  email: string,
  phone: string | undefined,
  leadId: string,
) {
  const signals = await getDuplicateSignals(email, phone);
  const commands = signals.flatMap((signal) =>
    duplicateWindows.flatMap((window) => {
      const key = getAssessmentSignalWindowKey(signal, window);

      return [
        ["SADD", key, leadId],
        ["EXPIRE", key, window.windowMs / 1000],
        ["SCARD", key],
      ];
    }),
  );
  const results = await runUpstashPipeline(commands);
  let resultIndex = 0;

  for (const signal of signals) {
    for (const window of duplicateWindows) {
      const count = Number(results[resultIndex + 2]?.result ?? 0);
      resultIndex += 3;

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
  assessmentLeadId?: string,
): Promise<{ duplicateLikely: boolean; reason?: string }> {
  if (
    submissionType === "automation_assessment" &&
    !assessmentLeadId
  ) {
    throw new Error("assessment-lead-id-required");
  }

  if (hasUpstashRedisConfig()) {
    try {
      return submissionType === "automation_assessment"
        ? await checkUpstashAssessmentDuplicateLead(
            email,
            phone,
            assessmentLeadId!,
          )
        : await checkUpstashQuickRequestDuplicateLead(email, phone);
    } catch {
      return submissionType === "automation_assessment"
        ? checkInMemoryAssessmentDuplicateLead(
            email,
            phone,
            assessmentLeadId!,
            now,
          )
        : checkInMemoryQuickRequestDuplicateLead(email, phone, now);
    }
  }

  return submissionType === "automation_assessment"
    ? checkInMemoryAssessmentDuplicateLead(
        email,
        phone,
        assessmentLeadId!,
        now,
      )
    : checkInMemoryQuickRequestDuplicateLead(email, phone, now);
}

export async function isAssessmentSubmissionCompleted(leadId: string) {
  pruneExpiredDuplicateBuckets(Date.now());

  if (hasUpstashRedisConfig()) {
    try {
      const results = await runUpstashPipeline([
        ["EXISTS", getAssessmentCompletionKey(leadId)],
      ]);
      const result = results[0]?.result;

      if (result !== 0 && result !== 1) {
        throw new Error("assessment-completion-state-invalid");
      }

      return result === 1;
    } catch {
      throw new Error("assessment-completion-state-unavailable");
    }
  }

  const expiresAt = completedAssessmentSubmissions.get(leadId);

  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    completedAssessmentSubmissions.delete(leadId);
    return false;
  }

  return true;
}

export async function markAssessmentSubmissionCompleted(leadId: string) {
  pruneExpiredDuplicateBuckets(Date.now());
  completedAssessmentSubmissions.set(
    leadId,
    Date.now() + assessmentCompletionTtlMs,
  );

  if (!hasUpstashRedisConfig()) {
    return;
  }

  try {
    const results = await runUpstashPipeline([
      [
        "SET",
        getAssessmentCompletionKey(leadId),
        "1",
        "EX",
        assessmentCompletionTtlSeconds,
      ],
    ]);

    if (results[0]?.result !== "OK") {
      throw new Error("assessment-completion-marker-invalid");
    }
  } catch {
    throw new Error("assessment-completion-marker-unavailable");
  }
}

export async function isAssessmentGoHighLevelCompleted(leadId: string) {
  pruneExpiredDuplicateBuckets(Date.now());

  if (hasUpstashRedisConfig()) {
    try {
      const results = await runUpstashPipeline([
        ["EXISTS", getAssessmentGoHighLevelCompletionKey(leadId)],
      ]);
      const result = results[0]?.result;

      if (result !== 0 && result !== 1) {
        throw new Error("assessment-gohighlevel-state-invalid");
      }

      return result === 1;
    } catch {
      throw new Error("assessment-gohighlevel-state-unavailable");
    }
  }

  const expiresAt =
    completedAssessmentGoHighLevelSubmissions.get(leadId);

  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    completedAssessmentGoHighLevelSubmissions.delete(leadId);
    return false;
  }

  return true;
}

export async function markAssessmentGoHighLevelCompleted(leadId: string) {
  pruneExpiredDuplicateBuckets(Date.now());
  completedAssessmentGoHighLevelSubmissions.set(
    leadId,
    Date.now() + assessmentCompletionTtlMs,
  );

  if (!hasUpstashRedisConfig()) {
    return;
  }

  try {
    const results = await runUpstashPipeline([
      [
        "SET",
        getAssessmentGoHighLevelCompletionKey(leadId),
        "1",
        "EX",
        assessmentCompletionTtlSeconds,
      ],
    ]);

    if (results[0]?.result !== "OK") {
      throw new Error("assessment-gohighlevel-marker-invalid");
    }
  } catch {
    throw new Error("assessment-gohighlevel-marker-unavailable");
  }
}

export function resetDuplicateLeadMemoryForTests() {
  seenLeads.clear();
  seenAssessmentSubmissions.clear();
  completedAssessmentSubmissions.clear();
  completedAssessmentGoHighLevelSubmissions.clear();
  activeAssessmentSubmissions.clear();
}

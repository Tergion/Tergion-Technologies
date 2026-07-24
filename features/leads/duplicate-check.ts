import "server-only";

import {
  normalizeContactEmail,
  normalizeContactPhone,
} from "@/features/leads/contact-identity";
import { runUpstashPipeline } from "@/features/leads/upstash";
import { hasUpstashRedisConfig } from "@/lib/env";

export type SubmissionType = "quick_request" | "automation_assessment";
type IdentitySignalType = "email" | "phone";

type IdentitySignal = Readonly<{
  type: IdentitySignalType;
  hash: string;
}>;

type ExpiringLeadValue = {
  leadId: string;
  expiresAt: number;
};

type DailyBucket = {
  leadIds: Set<string>;
  resetAt: number;
};

type ActiveLease = {
  token: string;
  expiresAt: number;
};

export type LeadSubmissionReservation = Readonly<{
  submissionType: SubmissionType;
  leadId: string;
  token: string;
  signals: readonly IdentitySignal[];
  backend: "memory" | "upstash";
}>;

export type LeadSubmissionReservationResult =
  | Readonly<{
      status: "reserved";
      reservation: LeadSubmissionReservation;
    }>
  | Readonly<{ status: "completed" | "duplicate" | "busy" | "unavailable" }>;

const reservationTtlSeconds = 5 * 60;
const cooldownTtlSeconds = 15 * 60;
const dailyTtlSeconds = 24 * 60 * 60;
const completionTtlSeconds = dailyTtlSeconds;
const dailySubmissionLimit = 3;

const cooldowns = new Map<string, ExpiringLeadValue>();
const dailyBuckets = new Map<string, DailyBucket>();
const completedSubmissions = new Map<string, number>();
const goHighLevelCompletedSubmissions = new Map<string, number>();
const activeLeases = new Map<string, ActiveLease>();

function getCompletionKey(type: SubmissionType, leadId: string) {
  return `lead:idempotency:${type}:v2:completed:${leadId}`;
}

function getGoHighLevelCompletionKey(
  type: SubmissionType,
  leadId: string,
) {
  return `lead:idempotency:${type}:v2:gohighlevel-completed:${leadId}`;
}

function getLeaseKey(type: SubmissionType, leadId: string) {
  return `lead:idempotency:${type}:v2:processing:${leadId}`;
}

function getCooldownKey(type: SubmissionType, signal: IdentitySignal) {
  return `lead:cooldown:${type}:v1:${signal.type}:${signal.hash}`;
}

function getDailyKey(type: SubmissionType, signal: IdentitySignal) {
  return `lead:daily:${type}:v1:${signal.type}:${signal.hash}`;
}

async function hashIdentity(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

async function getIdentitySignals(email: string, phone?: string) {
  const normalized = [
    { type: "email" as const, value: normalizeContactEmail(email) },
    { type: "phone" as const, value: normalizeContactPhone(phone) },
  ].filter((signal) => signal.value);

  return Promise.all(
    normalized.map(async (signal) =>
      Object.freeze({
        type: signal.type,
        hash: await hashIdentity(signal.value),
      }),
    ),
  );
}

function pruneMemory(now: number) {
  for (const [key, value] of cooldowns) {
    if (value.expiresAt <= now) cooldowns.delete(key);
  }

  for (const [key, bucket] of dailyBuckets) {
    if (bucket.resetAt <= now) dailyBuckets.delete(key);
  }

  for (const [key, expiresAt] of completedSubmissions) {
    if (expiresAt <= now) completedSubmissions.delete(key);
  }

  for (const [key, expiresAt] of goHighLevelCompletedSubmissions) {
    if (expiresAt <= now) goHighLevelCompletedSubmissions.delete(key);
  }

  for (const [key, lease] of activeLeases) {
    if (lease.expiresAt <= now) activeLeases.delete(key);
  }
}

function reserveInMemory(
  submissionType: SubmissionType,
  leadId: string,
  token: string,
  signals: readonly IdentitySignal[],
  now: number,
): LeadSubmissionReservationResult {
  pruneMemory(now);
  const completionKey = getCompletionKey(submissionType, leadId);
  const leaseKey = getLeaseKey(submissionType, leadId);

  if (completedSubmissions.has(completionKey)) {
    return { status: "completed" };
  }

  if (activeLeases.has(leaseKey)) {
    return { status: "busy" };
  }

  for (const signal of signals) {
    const cooldown = cooldowns.get(getCooldownKey(submissionType, signal));

    if (cooldown && cooldown.leadId !== leadId) {
      return { status: "duplicate" };
    }

    const daily = dailyBuckets.get(getDailyKey(submissionType, signal));

    if (
      daily &&
      !daily.leadIds.has(leadId) &&
      daily.leadIds.size >= dailySubmissionLimit
    ) {
      return { status: "duplicate" };
    }
  }

  activeLeases.set(leaseKey, {
    token,
    expiresAt: now + reservationTtlSeconds * 1_000,
  });

  for (const signal of signals) {
    cooldowns.set(getCooldownKey(submissionType, signal), {
      leadId,
      expiresAt: now + reservationTtlSeconds * 1_000,
    });
  }

  return {
    status: "reserved",
    reservation: Object.freeze({
      submissionType,
      leadId,
      token,
      signals,
      backend: "memory",
    }),
  };
}

const reserveScript = [
  "if redis.call('exists', KEYS[1]) == 1 then return 'completed' end",
  "if redis.call('exists', KEYS[2]) == 1 then return 'busy' end",
  "for i = 3, #KEYS, 2 do",
  "  local current = redis.call('get', KEYS[i])",
  "  if current and current ~= ARGV[2] then return 'duplicate' end",
  "  if redis.call('sismember', KEYS[i + 1], ARGV[2]) == 0 and tonumber(redis.call('scard', KEYS[i + 1])) >= tonumber(ARGV[4]) then return 'duplicate' end",
  "end",
  "local acquired = redis.call('set', KEYS[2], ARGV[1], 'NX', 'EX', ARGV[3])",
  "if not acquired then return 'busy' end",
  "for i = 3, #KEYS, 2 do redis.call('set', KEYS[i], ARGV[2], 'EX', ARGV[3]) end",
  "return 'reserved'",
].join("\n");

async function reserveInUpstash(
  submissionType: SubmissionType,
  leadId: string,
  token: string,
  signals: readonly IdentitySignal[],
): Promise<LeadSubmissionReservationResult> {
  const keys = [
    getCompletionKey(submissionType, leadId),
    getLeaseKey(submissionType, leadId),
    ...signals.flatMap((signal) => [
      getCooldownKey(submissionType, signal),
      getDailyKey(submissionType, signal),
    ]),
  ];
  const results = await runUpstashPipeline([
    [
      "EVAL",
      reserveScript,
      keys.length,
      ...keys,
      token,
      leadId,
      reservationTtlSeconds,
      dailySubmissionLimit,
    ],
  ]);
  const status = results[0]?.result;

  if (
    status === "completed" ||
    status === "duplicate" ||
    status === "busy"
  ) {
    return { status };
  }

  if (status !== "reserved") {
    throw new Error("lead-reservation-response-invalid");
  }

  return {
    status: "reserved",
    reservation: Object.freeze({
      submissionType,
      leadId,
      token,
      signals,
      backend: "upstash",
    }),
  };
}

export async function reserveLeadSubmission(
  submissionType: SubmissionType,
  leadId: string,
  email: string,
  phone?: string,
  now = Date.now(),
): Promise<LeadSubmissionReservationResult> {
  const token = crypto.randomUUID();
  const signals = await getIdentitySignals(email, phone);

  if (hasUpstashRedisConfig()) {
    try {
      return await reserveInUpstash(
        submissionType,
        leadId,
        token,
        signals,
      );
    } catch {
      return { status: "unavailable" };
    }
  }

  return reserveInMemory(
    submissionType,
    leadId,
    token,
    signals,
    now,
  );
}

const commitScript = [
  "if redis.call('get', KEYS[1]) ~= ARGV[1] then return 0 end",
  "redis.call('set', KEYS[2], '1', 'EX', ARGV[4])",
  "for i = 3, #KEYS, 2 do",
  "  redis.call('set', KEYS[i], ARGV[2], 'EX', ARGV[3])",
  "  redis.call('sadd', KEYS[i + 1], ARGV[2])",
  "  redis.call('expire', KEYS[i + 1], ARGV[4])",
  "end",
  "return 1",
].join("\n");

export async function commitGoHighLevelSubmission(
  reservation: LeadSubmissionReservation,
  now = Date.now(),
) {
  const {
    submissionType,
    leadId,
    token,
    signals,
    backend,
  } = reservation;

  if (backend === "upstash") {
    const keys = [
      getLeaseKey(submissionType, leadId),
      getGoHighLevelCompletionKey(submissionType, leadId),
      ...signals.flatMap((signal) => [
        getCooldownKey(submissionType, signal),
        getDailyKey(submissionType, signal),
      ]),
    ];
    const results = await runUpstashPipeline([
      [
        "EVAL",
        commitScript,
        keys.length,
        ...keys,
        token,
        leadId,
        cooldownTtlSeconds,
        completionTtlSeconds,
      ],
    ]);

    if (results[0]?.result !== 1) {
      throw new Error("lead-reservation-commit-failed");
    }

    return;
  }

  pruneMemory(now);
  const lease = activeLeases.get(getLeaseKey(submissionType, leadId));

  if (lease?.token !== token) {
    throw new Error("lead-reservation-commit-failed");
  }

  goHighLevelCompletedSubmissions.set(
    getGoHighLevelCompletionKey(submissionType, leadId),
    now + completionTtlSeconds * 1_000,
  );

  for (const signal of signals) {
    cooldowns.set(getCooldownKey(submissionType, signal), {
      leadId,
      expiresAt: now + cooldownTtlSeconds * 1_000,
    });
    const dailyKey = getDailyKey(submissionType, signal);
    const current = dailyBuckets.get(dailyKey);

    if (current) {
      current.leadIds.add(leadId);
      current.resetAt = now + dailyTtlSeconds * 1_000;
    } else {
      dailyBuckets.set(dailyKey, {
        leadIds: new Set([leadId]),
        resetAt: now + dailyTtlSeconds * 1_000,
      });
    }
  }
}

const releaseScript = [
  "if redis.call('get', KEYS[1]) == ARGV[1] then redis.call('del', KEYS[1]) end",
  "if ARGV[3] == '1' then",
  "  for i = 2, #KEYS do",
  "    if redis.call('get', KEYS[i]) == ARGV[2] then redis.call('del', KEYS[i]) end",
  "  end",
  "end",
  "return 1",
].join("\n");

export async function releaseLeadSubmission(
  reservation: LeadSubmissionReservation,
  options: { releaseIdentityReservation: boolean },
) {
  const {
    submissionType,
    leadId,
    token,
    signals,
    backend,
  } = reservation;

  if (backend === "upstash") {
    const keys = [
      getLeaseKey(submissionType, leadId),
      ...signals.map((signal) => getCooldownKey(submissionType, signal)),
    ];

    try {
      await runUpstashPipeline([
        [
          "EVAL",
          releaseScript,
          keys.length,
          ...keys,
          token,
          leadId,
          options.releaseIdentityReservation ? "1" : "0",
        ],
      ]);
    } catch {
      // The bounded lease and identity reservations expire safely.
    }

    return;
  }

  const leaseKey = getLeaseKey(submissionType, leadId);
  const active = activeLeases.get(leaseKey);

  if (active?.token === token) {
    activeLeases.delete(leaseKey);
  }

  if (options.releaseIdentityReservation) {
    for (const signal of signals) {
      const key = getCooldownKey(submissionType, signal);
      if (cooldowns.get(key)?.leadId === leadId) cooldowns.delete(key);
    }
  }
}

async function readCompletionState(
  key: string,
  memory: Map<string, number>,
) {
  if (hasUpstashRedisConfig()) {
    const results = await runUpstashPipeline([["EXISTS", key]]);
    const value = results[0]?.result;

    if (value !== 0 && value !== 1) {
      throw new Error("lead-completion-response-invalid");
    }

    return value === 1;
  }

  pruneMemory(Date.now());
  return memory.has(key);
}

export function isGoHighLevelSubmissionCompleted(
  submissionType: SubmissionType,
  leadId: string,
) {
  return readCompletionState(
    getGoHighLevelCompletionKey(submissionType, leadId),
    goHighLevelCompletedSubmissions,
  );
}

export async function markLeadSubmissionCompleted(
  submissionType: SubmissionType,
  leadId: string,
  now = Date.now(),
) {
  const key = getCompletionKey(submissionType, leadId);

  if (hasUpstashRedisConfig()) {
    const results = await runUpstashPipeline([
      ["SET", key, "1", "EX", completionTtlSeconds],
    ]);

    if (results[0]?.result !== "OK") {
      throw new Error("lead-completion-write-failed");
    }
    return;
  }

  completedSubmissions.set(key, now + completionTtlSeconds * 1_000);
}

export function resetDuplicateLeadMemoryForTests() {
  cooldowns.clear();
  dailyBuckets.clear();
  completedSubmissions.clear();
  goHighLevelCompletedSubmissions.clear();
  activeLeases.clear();
}

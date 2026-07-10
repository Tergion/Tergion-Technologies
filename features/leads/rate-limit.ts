import { hasUpstashRedisConfig } from "@/lib/env";
import { runUpstashPipeline } from "@/features/leads/upstash";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const windowMs = 10 * 60 * 1000;
const windowSeconds = windowMs / 1000;
const maxRequests = 5;
const buckets = new Map<string, RateLimitBucket>();

async function hashSignal(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

async function getClientSignal(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  const ip = forwardedFor.split(",")[0]?.trim() || realIp || "unknown-ip";

  return hashSignal(`${ip}:${userAgent}`);
}

async function checkInMemoryRateLimit(key: string) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  current.count += 1;

  if (current.count > maxRequests) {
    return {
      allowed: false,
      reason: "development-in-memory-rate-limit",
    };
  }

  return { allowed: true };
}

async function checkUpstashRateLimit(key: string) {
  const redisKey = `lead:rate:${key}`;
  const results = await runUpstashPipeline([
    ["INCR", redisKey],
    ["EXPIRE", redisKey, windowSeconds],
  ]);
  const count = Number(results[0]?.result ?? 0);

  if (count > maxRequests) {
    return {
      allowed: false,
      reason: "upstash-rate-limit",
    };
  }

  return { allowed: true };
}

export async function checkLeadRateLimit(
  request: Request,
): Promise<{ allowed: boolean; reason?: string }> {
  const key = await getClientSignal(request);

  if (hasUpstashRedisConfig()) {
    try {
      return await checkUpstashRateLimit(key);
    } catch {
      return checkInMemoryRateLimit(key);
    }
  }

  return checkInMemoryRateLimit(key);
}

export function resetLeadRateLimitMemoryForTests() {
  buckets.clear();
}

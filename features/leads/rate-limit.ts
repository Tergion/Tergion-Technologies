import { hasUpstashRedisConfig } from "@/lib/env";
import { runUpstashPipeline } from "@/features/leads/upstash";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitWindow = {
  label: string;
  windowMs: number;
  maxRequests: number;
};

const rateLimitWindows = [
  {
    label: "hour",
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
  {
    label: "day",
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 10,
  },
] as const satisfies RateLimitWindow[];

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
  const connectingIp = request.headers.get("cf-connecting-ip") ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  const ip =
    connectingIp.trim() ||
    forwardedFor.split(",")[0]?.trim() ||
    realIp ||
    "unknown-ip";

  return hashSignal(`${ip}:${userAgent}`);
}

function getWindowKey(key: string, window: RateLimitWindow) {
  return `lead:rate:${window.label}:${key}`;
}

async function checkInMemoryRateLimit(key: string, now: number) {
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(bucketKey);
    }
  }

  for (const window of rateLimitWindows) {
    const bucketKey = getWindowKey(key, window);
    const current = buckets.get(bucketKey);

    if (!current) {
      buckets.set(bucketKey, {
        count: 1,
        resetAt: now + window.windowMs,
      });
      continue;
    }

    current.count += 1;

    if (current.count > window.maxRequests) {
      return {
        allowed: false,
        reason: `development-in-memory-rate-limit-${window.label}`,
      };
    }
  }

  return { allowed: true };
}

async function checkUpstashRateLimit(key: string) {
  const commands = rateLimitWindows.flatMap((window) => {
    const redisKey = getWindowKey(key, window);

    return [
      ["INCR", redisKey],
      ["EXPIRE", redisKey, window.windowMs / 1000],
    ];
  });
  const results = await runUpstashPipeline(commands);

  for (let index = 0; index < rateLimitWindows.length; index += 1) {
    const window = rateLimitWindows[index];
    const count = Number(results[index * 2]?.result ?? 0);

    if (count > window.maxRequests) {
      return {
        allowed: false,
        reason: `upstash-rate-limit-${window.label}`,
      };
    }
  }

  return { allowed: true };
}

export async function checkLeadRateLimit(
  request: Request,
  now = Date.now(),
): Promise<{ allowed: boolean; reason?: string }> {
  const key = await getClientSignal(request);

  if (hasUpstashRedisConfig()) {
    try {
      return await checkUpstashRateLimit(key);
    } catch {
      return checkInMemoryRateLimit(key, now);
    }
  }

  return checkInMemoryRateLimit(key, now);
}

export function resetLeadRateLimitMemoryForTests() {
  buckets.clear();
}

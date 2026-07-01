import { createHash } from "crypto";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const windowMs = 10 * 60 * 1000;
const maxRequests = 5;
const buckets = new Map<string, RateLimitBucket>();

function hashSignal(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function getClientSignal(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  const ip = forwardedFor.split(",")[0]?.trim() || realIp || "unknown-ip";

  return hashSignal(`${ip}:${userAgent}`);
}

export async function checkLeadRateLimit(
  request: Request,
): Promise<{ allowed: boolean; reason?: string }> {
  const key = getClientSignal(request);
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

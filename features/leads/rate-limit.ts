type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const windowMs = 10 * 60 * 1000;
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

export async function checkLeadRateLimit(
  request: Request,
): Promise<{ allowed: boolean; reason?: string }> {
  const key = await getClientSignal(request);
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

/**
 * Fixed-window in-memory rate limiter for sensitive routes (login, register,
 * reset, export). Keyed by IP + identifier. Good enough for a single instance;
 * swap the Map for Upstash Redis in a multi-instance deployment — see
 * docs/architecture.md. Returns a `retryAfter` (seconds) for a 429 header.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * Best-effort client IP from proxy headers. Trust boundary: this only
 * protects against abuse when a trusted reverse proxy sets (and cannot be
 * overridden by the client on) `x-forwarded-for` — true on Vercel, where the
 * edge sets it and strips any client-supplied value. Self-hosting behind a
 * proxy that blindly forwards client headers would let an attacker rotate
 * this value to bypass the limit; harden with a trusted-proxy allowlist
 * before self-hosting publicly. Requests with neither header (e.g. local
 * dev, or a direct hit with no proxy) share one "unknown" bucket per
 * identifier — expected in dev, not reachable on the recommended deployment.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

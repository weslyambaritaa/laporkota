/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Scope & limitations (documented, not hidden): this state lives in the
 * Node process's memory, so on serverless platforms with multiple
 * concurrent instances the effective limit is "N per instance", not a hard
 * global cap. That's an acceptable trade-off for a student competition
 * project without a paid Redis add-on — it still stops a single scripted
 * client from hammering the endpoint and burning the Gemini free-tier
 * quota or the server's CPU. For a production deployment, swap this for a
 * shared store (e.g. Upstash Redis + @upstash/ratelimit).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Prevent unbounded memory growth from many distinct keys over time.
const MAX_TRACKED_KEYS = 5000;

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: 0 };
}

/* Rate limiting via Upstash Redis. */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? Redis.fromEnv() : null;

const ANALYZE_LIMIT = parseInt(process.env.RATE_LIMIT_ANALYZE_PER_DAY || "20", 10);
const REWRITE_LIMIT = parseInt(process.env.RATE_LIMIT_REWRITE_PER_DAY || "10", 10);
const GENERATE_LIMIT = parseInt(process.env.RATE_LIMIT_GENERATE_PER_DAY || "5", 10);
const COVER_LETTER_LIMIT = parseInt(process.env.RATE_LIMIT_COVER_LETTER_PER_DAY || "5", 10);

function makeLimiter(maxPerDay: number, prefix: string): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxPerDay, "1 d"),
    analytics: true,
    prefix,
  });
}

export const limiters = {
  analyze: makeLimiter(ANALYZE_LIMIT, "rl:analyze"),
  rewrite: makeLimiter(REWRITE_LIMIT, "rl:rewrite"),
  generate: makeLimiter(GENERATE_LIMIT, "rl:generate"),
  coverLetter: makeLimiter(COVER_LETTER_LIMIT, "rl:coverletter"),
};

export const limits = {
  analyze: ANALYZE_LIMIT,
  rewrite: REWRITE_LIMIT,
  generate: GENERATE_LIMIT,
  coverLetter: COVER_LETTER_LIMIT,
};

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "anonymous";
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  ip: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, limit: -1, remaining: -1, reset: 0 };
  }
  const result = await limiter.limit(ip);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

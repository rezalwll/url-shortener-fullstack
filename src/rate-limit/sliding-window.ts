import type { Clock } from "../lib/clock.js";
import type { RateLimitDecision, RateLimiter } from "./types.js";

export class SlidingWindowRateLimiter implements RateLimiter {
  private readonly attempts = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly clock: Clock
  ) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError("rate limit must be a positive integer");
    if (!Number.isSafeInteger(windowMs) || windowMs < 1_000) throw new RangeError("rate window must be at least one second");
  }

  consume(key: string): RateLimitDecision {
    const now = this.clock.now().getTime();
    const threshold = now - this.windowMs;
    const recent = (this.attempts.get(key) ?? []).filter((timestamp) => timestamp > threshold);
    const allowed = recent.length < this.limit;
    if (allowed) recent.push(now);
    if (recent.length) this.attempts.set(key, recent);
    else this.attempts.delete(key);
    const oldest = recent[0] ?? now;
    return {
      allowed,
      limit: this.limit,
      remaining: Math.max(0, this.limit - recent.length),
      resetAt: oldest + this.windowMs
    };
  }
}

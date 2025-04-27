export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number;
}

export interface RateLimiter {
  consume(key: string): RateLimitDecision;
}

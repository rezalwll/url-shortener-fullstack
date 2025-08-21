import { describe, expect, it } from "vitest";
import { FixedClock } from "../src/lib/clock.js";
import { SlidingWindowRateLimiter } from "../src/rate-limit/sliding-window.js";

describe("SlidingWindowRateLimiter", () => {
  it("isolates clients and reopens the window", () => {
    const clock = new FixedClock(new Date("2026-01-01T00:00:00.000Z"));
    const limiter = new SlidingWindowRateLimiter(2, 10_000, clock);
    expect(limiter.consume("a").allowed).toBe(true);
    expect(limiter.consume("a").remaining).toBe(0);
    expect(limiter.consume("a").allowed).toBe(false);
    expect(limiter.consume("b").allowed).toBe(true);
    clock.advance(10_001);
    expect(limiter.consume("a").allowed).toBe(true);
  });
});

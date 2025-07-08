import { describe, expect, it } from "vitest";
import { FixedClock } from "../src/lib/clock.js";

describe("FixedClock", () => {
  it("returns defensive dates and advances deterministically", () => {
    const clock = new FixedClock(new Date("2025-01-01T00:00:00.000Z"));
    const observed = clock.now();
    observed.setUTCFullYear(2030);
    expect(clock.now().toISOString()).toBe("2025-01-01T00:00:00.000Z");
    clock.advance(1_000);
    expect(clock.now().toISOString()).toBe("2025-01-01T00:00:01.000Z");
  });
});

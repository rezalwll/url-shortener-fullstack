import { readdir, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { normalizeTarget } from "../src/lib/url-policy.js";
import { normalizeSlug } from "../src/lib/slug-policy.js";
import { FixedClock } from "../src/lib/clock.js";
import { SlidingWindowRateLimiter } from "../src/rate-limit/sliding-window.js";
import { decodeCursor, encodeCursor } from "../src/lib/cursor.js";

const fixtureRoot = new URL("./fixtures/", import.meta.url);

async function fixtures<T>(directory: string): Promise<T[]> {
  const path = new URL(`${directory}/`, fixtureRoot);
  const names = (await readdir(path)).filter((name) => name.endsWith(".json")).sort();
  return Promise.all(names.map(async (name) => JSON.parse(await readFile(new URL(name, path), "utf8")) as T));
}

describe("reviewed policy fixtures", () => {
  it("covers URL normalization and rejection boundaries", async () => {
    const cases = await fixtures<{ name: string; input: string; output?: string; error?: string }>("url-policy");
    expect(cases.length).toBeGreaterThanOrEqual(5);
    for (const scenario of cases) {
      if (scenario.error) expect(() => normalizeTarget(scenario.input), scenario.name).toThrow(scenario.error);
      else expect(normalizeTarget(scenario.input), scenario.name).toBe(scenario.output);
    }
  });

  it("covers custom alias boundaries", async () => {
    const cases = await fixtures<{ name: string; input: string; output?: string; error?: string }>("slug-policy");
    expect(cases.length).toBeGreaterThanOrEqual(3);
    for (const scenario of cases) {
      if (scenario.error) expect(() => normalizeSlug(scenario.input), scenario.name).toThrow(scenario.error);
      else expect(normalizeSlug(scenario.input), scenario.name).toBe(scenario.output);
    }
  });

  it("covers rate-window timelines", async () => {
    const cases = await fixtures<{ name: string; limit: number; windowMs: number; attempts: number[]; allowed: boolean[] }>("rate-limit");
    expect(cases.length).toBeGreaterThanOrEqual(2);
    for (const scenario of cases) {
      const clock = new FixedClock(new Date("2026-01-01T00:00:00.000Z"));
      const limiter = new SlidingWindowRateLimiter(scenario.limit, scenario.windowMs, clock);
      let elapsed = 0;
      const observed = scenario.attempts.map((offset) => {
        clock.advance(offset - elapsed);
        elapsed = offset;
        return limiter.consume(scenario.name).allowed;
      });
      expect(observed, scenario.name).toEqual(scenario.allowed);
    }
  });

  it("rejects fixture-driven cursor tampering", async () => {
    const cases = await fixtures<{ name: string; replacement: string }>("cursor");
    const secret = "cursor-secret-with-at-least-thirty-two-bytes";
    for (const scenario of cases) {
      const cursor = encodeCursor({ createdAt: "2026-01-01T00:00:00.000Z", id: "fixture" }, secret);
      const replacement = cursor.at(-1) === scenario.replacement ? "y" : scenario.replacement;
      expect(() => decodeCursor(`${cursor.slice(0, -1)}${replacement}`, secret), scenario.name).toThrow();
    }
  });
});

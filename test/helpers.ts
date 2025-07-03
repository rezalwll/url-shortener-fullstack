import { LinkService } from "../src/application/link-service.js";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import { FixedClock } from "../src/lib/clock.js";
import { MemoryLinkRepository } from "../src/persistence/memory-link-repository.js";
import { SlidingWindowRateLimiter } from "../src/rate-limit/sliding-window.js";

export const testConfig: AppConfig = {
  host: "127.0.0.1",
  port: 4000,
  publicBaseUrl: "https://sho.rt",
  dataFile: "./data/test.json",
  cursorSecret: "a-test-cursor-secret-that-is-long-enough",
  visitorSalt: "a-separate-visitor-salt-that-is-long",
  rateLimitMax: 3,
  rateLimitWindowMs: 60_000,
  trustProxy: false
};

export function createHarness(overrides: { slugs?: string[]; ids?: string[]; max?: number } = {}) {
  const clock = new FixedClock(new Date("2026-02-03T09:00:00.000Z"));
  const repository = new MemoryLinkRepository();
  const slugs = [...(overrides.slugs ?? ["abcD1234", "next5678", "third999"] )];
  const ids = [...(overrides.ids ?? ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222"] )];
  const service = new LinkService({
    repository,
    clock,
    rateLimiter: new SlidingWindowRateLimiter(overrides.max ?? 10, 60_000, clock),
    publicBaseUrl: testConfig.publicBaseUrl,
    cursorSecret: testConfig.cursorSecret,
    visitorSalt: testConfig.visitorSalt,
    slugFactory: () => slugs.shift() ?? "fallback9",
    idFactory: () => ids.shift() ?? "33333333-3333-4333-8333-333333333333"
  });
  return { service, repository, clock };
}

export async function buildTestApp(overrides: Partial<AppConfig> = {}) {
  const repository = new MemoryLinkRepository();
  const clock = new FixedClock(new Date("2026-02-03T09:00:00.000Z"));
  const slugs = ["abcD1234", "next5678", "third999"];
  const ids = ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222"];
  const config = { ...testConfig, ...overrides };
  const app = await buildApp({
    config,
    repository,
    clock,
    slugFactory: () => slugs.shift() ?? "fallback9",
    idFactory: () => ids.shift() ?? "33333333-3333-4333-8333-333333333333"
  });
  return { app, repository, clock, config };
}

import { describe, expect, it } from "vitest";
import { createHarness } from "./helpers.js";

describe("LinkService.resolve", () => {
  it("tracks visits without retaining an address", async () => {
    const { service } = createHarness();
    const created = await service.create({ target: "https://example.com" }, { clientKey: "owner" });
    const resolved = await service.resolve(created.link.slug, { clientKey: "203.0.113.9", referrer: "https://news.example/story" });
    expect(resolved.clicks).toBe(1);
    expect(await service.stats(created.link.slug)).toMatchObject({ clicks: 1, uniqueVisitors: 1, referrers: [{ host: "news.example", clicks: 1 }] });
  });

  it("rejects expired links without recording a visit", async () => {
    const { service, clock } = createHarness();
    const created = await service.create({ target: "https://example.com", expiresAt: "2026-02-04T09:00:00.000Z" }, { clientKey: "owner" });
    clock.advance(86_400_001);
    await expect(service.resolve(created.link.slug, { clientKey: "visitor" })).rejects.toMatchObject({ code: "LINK_EXPIRED" });
  });
});

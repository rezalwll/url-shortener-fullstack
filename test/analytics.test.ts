import { describe, expect, it } from "vitest";
import { createHarness } from "./helpers.js";

describe("privacy-aware analytics", () => {
  it("deduplicates visitors while ranking referrers", async () => {
    const { service } = createHarness();
    const created = await service.create({ target: "https://example.com" }, { clientKey: "owner" });
    await service.resolve(created.link.slug, { clientKey: "visitor-a", referrer: "https://one.example/a" });
    await service.resolve(created.link.slug, { clientKey: "visitor-a", referrer: "https://one.example/b" });
    await service.resolve(created.link.slug, { clientKey: "visitor-b", referrer: "https://two.example" });
    expect(await service.stats(created.link.slug)).toMatchObject({
      clicks: 3,
      uniqueVisitors: 2,
      referrers: [{ host: "one.example", clicks: 2 }, { host: "two.example", clicks: 1 }]
    });
  });
});

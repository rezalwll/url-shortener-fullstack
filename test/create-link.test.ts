import { describe, expect, it } from "vitest";
import { createHarness } from "./helpers.js";

describe("LinkService.create", () => {
  it("normalizes the destination and builds the public short URL", async () => {
    const { service } = createHarness();
    const result = await service.create({ target: "https://Example.com:443/docs#intro" }, { clientKey: "client-a" });
    expect(result.link).toMatchObject({ slug: "abcD1234", target: "https://example.com/docs", shortUrl: "https://sho.rt/r/abcD1234" });
    expect(result.replayed).toBe(false);
  });

  it("honors a valid custom alias", async () => {
    const { service } = createHarness();
    expect((await service.create({ target: "https://example.com", customSlug: "launch-26" }, { clientKey: "client-a" })).link.slug).toBe("launch-26");
  });
});

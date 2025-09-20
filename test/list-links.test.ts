import { describe, expect, it } from "vitest";
import { createHarness } from "./helpers.js";

describe("LinkService.list", () => {
  it("returns signed cursors for stable traversal", async () => {
    const { service, clock } = createHarness();
    await service.create({ target: "https://one.example" }, { clientKey: "a" });
    clock.advance(1_000);
    await service.create({ target: "https://two.example" }, { clientKey: "b" });
    const first = await service.list(1);
    const second = await service.list(1, first.nextCursor ?? undefined);
    expect(first.items[0]?.target).toBe("https://two.example/");
    expect(second.items[0]?.target).toBe("https://one.example/");
  });
});

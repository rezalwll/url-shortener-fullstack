import { describe, expect, it } from "vitest";
import { createHarness } from "./helpers.js";

describe("idempotent link creation", () => {
  it("replays the original result for the same payload", async () => {
    const { service } = createHarness();
    const context = { clientKey: "a", idempotencyKey: "request-123" };
    const first = await service.create({ target: "https://example.com/a" }, context);
    const second = await service.create({ target: "https://example.com/a" }, context);
    expect(second.link.id).toBe(first.link.id);
    expect(second.replayed).toBe(true);
  });

  it("rejects reuse with a different payload", async () => {
    const { service } = createHarness();
    const context = { clientKey: "a", idempotencyKey: "request-123" };
    await service.create({ target: "https://example.com/a" }, context);
    await expect(service.create({ target: "https://example.com/b" }, context)).rejects.toMatchObject({ code: "IDEMPOTENCY_CONFLICT" });
  });
});

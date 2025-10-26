import { describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers.js";

describe("create-link rate limits", () => {
  it("publishes budget headers and a retry hint", async () => {
    const { app } = await buildTestApp({ rateLimitMax: 1 });
    const first = await app.inject({ method: "POST", url: "/v1/links", payload: { target: "https://one.example" } });
    expect(first.headers["x-ratelimit-remaining"]).toBe("0");
    const blocked = await app.inject({ method: "POST", url: "/v1/links", payload: { target: "https://two.example" } });
    expect(blocked.statusCode).toBe(429);
    expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
    await app.close();
  });
});

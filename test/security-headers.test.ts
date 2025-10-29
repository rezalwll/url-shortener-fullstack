import { describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers.js";

describe("response hardening", () => {
  it("sets browser safety headers on API responses", async () => {
    const { app } = await buildTestApp();
    const response = await app.inject({ method: "GET", url: "/health/live" });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    await app.close();
  });
});

import { describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers.js";

describe("health probes", () => {
  it("separates liveness from persistence readiness", async () => {
    const { app } = await buildTestApp();
    expect((await app.inject({ method: "GET", url: "/health/live" })).json()).toEqual({ status: "ok" });
    expect((await app.inject({ method: "GET", url: "/health/ready" })).json()).toEqual({ status: "ready" });
    await app.close();
  });
});

import { describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers.js";

describe("redirect API", () => {
  it("returns a non-cacheable redirect and updates analytics", async () => {
    const { app } = await buildTestApp();
    const created = await app.inject({ method: "POST", url: "/v1/links", payload: { target: "https://example.com/landing" } });
    const { slug } = created.json<{ slug: string }>();
    const redirect = await app.inject({ method: "GET", url: `/r/${slug}`, headers: { referer: "https://search.example/query" } });
    expect(redirect.statusCode).toBe(302);
    expect(redirect.headers.location).toBe("https://example.com/landing");
    expect(redirect.headers["cache-control"]).toBe("private, no-store");
    const stats = await app.inject({ method: "GET", url: `/v1/links/${slug}/stats` });
    expect(stats.json()).toMatchObject({ clicks: 1, uniqueVisitors: 1 });
    await app.close();
  });
});

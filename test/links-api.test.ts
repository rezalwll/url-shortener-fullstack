import { describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers.js";

describe("links HTTP API", () => {
  it("creates, reads, lists and disables a link", async () => {
    const { app } = await buildTestApp();
    const created = await app.inject({ method: "POST", url: "/v1/links", payload: { target: "https://example.com/docs" } });
    expect(created.statusCode).toBe(201);
    const body = created.json<{ slug: string }>();
    expect((await app.inject({ method: "GET", url: `/v1/links/${body.slug}` })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: "/v1/links?limit=1" })).json<{ items: unknown[] }>().items).toHaveLength(1);
    expect((await app.inject({ method: "DELETE", url: `/v1/links/${body.slug}` })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: `/r/${body.slug}` })).statusCode).toBe(410);
    await app.close();
  });

  it("returns a stable validation envelope", async () => {
    const { app } = await buildTestApp();
    const response = await app.inject({ method: "POST", url: "/v1/links", payload: {} });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: "VALIDATION_ERROR", requestId: expect.any(String) });
    await app.close();
  });
});

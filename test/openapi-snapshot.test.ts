import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("exported OpenAPI document", () => {
  it("publishes the stable v1 paths and response contracts", async () => {
    const document = JSON.parse(await readFile(new URL("../contracts/openapi.v1.json", import.meta.url), "utf8")) as {
      info: { version: string };
      paths: Record<string, Record<string, unknown>>;
    };
    expect(document.info.version).toBe("1.0.0");
    expect(Object.keys(document.paths).sort()).toEqual([
      "/r/{slug}",
      "/v1/links",
      "/v1/links/{slug}",
      "/v1/links/{slug}/stats"
    ]);
    expect(document.paths["/v1/links"]).toHaveProperty("post");
    expect(document.paths["/v1/links"]).toHaveProperty("get");
  });
});

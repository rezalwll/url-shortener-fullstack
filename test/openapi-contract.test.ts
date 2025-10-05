import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers.js";

describe("OpenAPI v1 contract", () => {
  it("keeps the reviewed operation surface", async () => {
    const { app } = await buildTestApp();
    const expected = JSON.parse(await readFile(new URL("../contracts/operations.v1.json", import.meta.url), "utf8")) as { operations: string[] };
    const document = app.swagger() as { paths?: Record<string, Record<string, { operationId?: string }>> };
    const observed = Object.values(document.paths ?? {}).flatMap((path) => Object.values(path).map((operation) => operation.operationId).filter((value): value is string => Boolean(value))).sort();
    expect(observed).toEqual([...expected.operations].sort());
    await app.close();
  });
});

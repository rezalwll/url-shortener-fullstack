import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FileLinkRepository } from "../src/persistence/file-link-repository.js";
import type { LinkRecord } from "../src/domain/link.js";

describe("FileLinkRepository", () => {
  it("persists redirects across repository instances", async () => {
    const dir = await mkdtemp(join(tmpdir(), "edge-links-"));
    const file = join(dir, "links.json");
    const record: LinkRecord = {
      id: "id-1", slug: "stable-1", target: "https://example.com/", createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: null, disabledAt: null, clicks: 0, lastVisitedAt: null, version: 1
    };
    await new FileLinkRepository(file).create(record);
    expect(await new FileLinkRepository(file).findBySlug("stable-1")).toEqual(record);
    expect(JSON.parse(await readFile(file, "utf8"))).toMatchObject({ schemaVersion: 1 });
  });
});

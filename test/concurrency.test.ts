import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FileLinkRepository } from "../src/persistence/file-link-repository.js";
import type { LinkRecord } from "../src/domain/link.js";

describe("serialized persistence", () => {
  it("does not lose concurrent click increments", async () => {
    const file = join(await mkdtemp(join(tmpdir(), "edge-concurrency-")), "links.json");
    const repository = new FileLinkRepository(file);
    const link: LinkRecord = {
      id: "link-1", slug: "stable-1", target: "https://example.com/", createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: null, disabledAt: null, clicks: 0, lastVisitedAt: null, version: 1
    };
    await repository.create(link);
    await Promise.all(Array.from({ length: 20 }, (_, index) => repository.recordClick(link.id, {
      linkId: link.id, occurredAt: `2026-01-01T00:00:${String(index).padStart(2, "0")}.000Z`, visitorHash: `v-${index}`, referrerHost: null
    })));
    expect((await repository.findById(link.id))?.clicks).toBe(20);
  });
});

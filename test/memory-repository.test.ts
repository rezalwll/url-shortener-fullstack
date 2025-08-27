import { describe, expect, it } from "vitest";
import { MemoryLinkRepository } from "../src/persistence/memory-link-repository.js";
import type { LinkRecord } from "../src/domain/link.js";

const link = (id: string, slug: string, createdAt: string): LinkRecord => ({
  id, slug, target: "https://example.com/", createdAt, expiresAt: null, disabledAt: null, clicks: 0, lastVisitedAt: null, version: 1
});

describe("MemoryLinkRepository", () => {
  it("paginates newest links without skipping equal timestamps", async () => {
    const repository = new MemoryLinkRepository();
    await repository.create(link("a", "slug-a", "2026-01-02T00:00:00.000Z"));
    await repository.create(link("b", "slug-b", "2026-01-02T00:00:00.000Z"));
    await repository.create(link("c", "slug-c", "2026-01-01T00:00:00.000Z"));
    const first = await repository.list(2, null);
    const second = await repository.list(2, first.next);
    expect([...first.items, ...second.items].map((item) => item.id)).toEqual(["b", "a", "c"]);
  });
});

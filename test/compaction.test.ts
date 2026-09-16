import { describe, expect, it } from "vitest";
import { compactEvents } from "../src/analytics/compact-events.js";
import { emptyState } from "../src/persistence/state.js";

describe("analytics compaction", () => {
  it("removes stale visits and bounds the retained journal", () => {
    const state = {
      ...emptyState(),
      events: [
        { linkId: "a", occurredAt: "2025-01-01T00:00:00.000Z", visitorHash: "old", referrerHost: null },
        { linkId: "a", occurredAt: "2026-01-02T00:00:00.000Z", visitorHash: "new-1", referrerHost: null },
        { linkId: "a", occurredAt: "2026-01-03T00:00:00.000Z", visitorHash: "new-2", referrerHost: null }
      ]
    };
    const result = compactEvents(state, new Date("2026-01-01T00:00:00.000Z"), 1);
    expect(result.removed).toBe(2);
    expect(result.state.events.map((event) => event.visitorHash)).toEqual(["new-2"]);
  });
});

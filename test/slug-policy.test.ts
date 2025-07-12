import { describe, expect, it } from "vitest";
import { DomainError } from "../src/domain/errors.js";
import { normalizeSlug } from "../src/lib/slug-policy.js";

describe("normalizeSlug", () => {
  it("trims valid aliases", () => expect(normalizeSlug("  launch-42  ")).toBe("launch-42"));
  it.each(["abc", "contains space", "v1", "health", "x".repeat(49)])("rejects unsafe or reserved alias %s", (value) => {
    expect(() => normalizeSlug(value)).toThrow(DomainError);
  });
});

import { describe, expect, it } from "vitest";
import { DomainError } from "../src/domain/errors.js";
import { normalizeTarget } from "../src/lib/url-policy.js";

describe("normalizeTarget", () => {
  it("drops fragments while preserving a stable absolute URL", () => {
    expect(normalizeTarget("HTTPS://Example.com:443/a?x=1#private")).toBe("https://example.com/a?x=1");
  });
  it.each(["file:///etc/passwd", "http://localhost/admin", "http://127.0.0.1", "https://user:pass@example.com"])(
    "rejects redirect destination %s",
    (value) => expect(() => normalizeTarget(value)).toThrow(DomainError)
  );
});

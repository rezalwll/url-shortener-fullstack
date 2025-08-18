import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "../src/lib/cursor.js";

const secret = "cursor-secret-with-at-least-thirty-two-bytes";

describe("signed cursors", () => {
  it("round trips a stable pagination position", () => {
    const cursor = { createdAt: "2026-01-01T00:00:00.000Z", id: "link-1" };
    expect(decodeCursor(encodeCursor(cursor, secret), secret)).toEqual(cursor);
  });
  it("rejects tampering", () => {
    const encoded = encodeCursor({ createdAt: "2026-01-01T00:00:00.000Z", id: "link-1" }, secret);
    expect(() => decodeCursor(`${encoded.slice(0, -1)}x`, secret)).toThrow("signature");
  });
});

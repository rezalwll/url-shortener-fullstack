import { createHmac, timingSafeEqual } from "node:crypto";
import { DomainError } from "../domain/errors.js";
import type { LinkCursor } from "../domain/repository.js";

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function encodeCursor(cursor: LinkCursor, secret: string): string {
  const payload = Buffer.from(JSON.stringify(cursor)).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function decodeCursor(value: string | undefined, secret: string): LinkCursor | null {
  if (!value) return null;
  const [payload, received] = value.split(".");
  if (!payload || !received) throw new DomainError("INVALID_CURSOR", "cursor is malformed", 400);
  const expected = signature(payload, secret);
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new DomainError("INVALID_CURSOR", "cursor signature is invalid", 400);
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object" || !("createdAt" in parsed) || !("id" in parsed)) throw new Error("shape");
    const cursor = parsed as Record<string, unknown>;
    if (typeof cursor.createdAt !== "string" || typeof cursor.id !== "string") throw new Error("types");
    return { createdAt: cursor.createdAt, id: cursor.id };
  } catch {
    throw new DomainError("INVALID_CURSOR", "cursor payload is invalid", 400);
  }
}

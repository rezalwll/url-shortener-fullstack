import { DomainError } from "../domain/errors.js";

const SLUG_PATTERN = /^[A-Za-z0-9_-]{4,48}$/;
const RESERVED = new Set(["api", "health", "metrics", "openapi", "v1", "admin", "r"]);

export function normalizeSlug(value: string): string {
  const slug = value.trim();
  if (!SLUG_PATTERN.test(slug)) {
    throw new DomainError("INVALID_SLUG", "slug must contain 4-48 URL-safe characters", 400);
  }
  if (RESERVED.has(slug.toLowerCase())) {
    throw new DomainError("INVALID_SLUG", "slug is reserved by the service", 400);
  }
  return slug;
}

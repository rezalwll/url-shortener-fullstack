export type ErrorCode =
  | "INVALID_URL"
  | "INVALID_SLUG"
  | "SLUG_CONFLICT"
  | "LINK_NOT_FOUND"
  | "LINK_EXPIRED"
  | "LINK_DISABLED"
  | "IDEMPOTENCY_CONFLICT"
  | "RATE_LIMITED"
  | "INVALID_CURSOR";

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Readonly<Record<string, string | number>>
  ) {
    super(message);
    this.name = "DomainError";
  }
}

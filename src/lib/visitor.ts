import { createHash } from "node:crypto";

export function anonymizeVisitor(clientKey: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${clientKey}`).digest("hex").slice(0, 24);
}

export function referrerHost(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

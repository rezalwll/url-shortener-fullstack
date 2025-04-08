import { isIP } from "node:net";
import { DomainError } from "../domain/errors.js";

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  const [a = 0, b = 0] = parts;
  return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function assertPublicHost(hostname: string): void {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new DomainError("INVALID_URL", "local destinations are not allowed", 400);
  }
  const family = isIP(host);
  if ((family === 4 && isPrivateIpv4(host)) || (family === 6 && (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")))) {
    throw new DomainError("INVALID_URL", "private network destinations are not allowed", 400);
  }
}

export function normalizeTarget(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DomainError("INVALID_URL", "target must be an absolute URL", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new DomainError("INVALID_URL", "only http and https destinations are allowed", 400);
  }
  if (url.username || url.password) {
    throw new DomainError("INVALID_URL", "credential-bearing destinations are not allowed", 400);
  }
  assertPublicHost(url.hostname);
  url.hash = "";
  return url.toString();
}

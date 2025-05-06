export interface AppConfig {
  readonly host: string;
  readonly port: number;
  readonly publicBaseUrl: string;
  readonly dataFile: string;
  readonly cursorSecret: string;
  readonly visitorSalt: string;
  readonly rateLimitMax: number;
  readonly rateLimitWindowMs: number;
  readonly trustProxy: boolean;
}

function integer(value: string | undefined, fallback: number, name: string): number {
  const parsed = value ? Number(value) : fallback;
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function absoluteUrl(value: string, name: string): string {
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const cursorSecret = env.CURSOR_SECRET ?? "development-only-cursor-secret-32-bytes";
  if (cursorSecret.length < 32) throw new Error("CURSOR_SECRET must contain at least 32 characters");
  return {
    host: env.HOST ?? "127.0.0.1",
    port: integer(env.PORT, 4000, "PORT"),
    publicBaseUrl: absoluteUrl(env.PUBLIC_BASE_URL ?? "http://localhost:4000", "PUBLIC_BASE_URL"),
    dataFile: env.DATA_FILE ?? "./data/edge-links.json",
    cursorSecret,
    visitorSalt: env.VISITOR_SALT ?? cursorSecret,
    rateLimitMax: integer(env.RATE_LIMIT_MAX, 20, "RATE_LIMIT_MAX"),
    rateLimitWindowMs: integer(env.RATE_LIMIT_WINDOW_MS, 60_000, "RATE_LIMIT_WINDOW_MS"),
    trustProxy: env.TRUST_PROXY === "true"
  };
}

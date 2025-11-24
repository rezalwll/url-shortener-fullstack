import prisma from "../prisma";
import { generateShortCode } from "../utils/shortCode";

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

export interface CreateUrlInput {
  originalUrl?: string;
  expiresAt?: string | null;
}

export interface UrlResponse {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  expiresAt: Date | null;
}

function assertValidUrl(value?: string): string {
  if (!value) {
    throw new Error("originalUrl is required");
  }
  try {
    // Throws on invalid URL
    return new URL(value).toString();
  } catch {
    throw new Error("originalUrl must be a valid URL");
  }
}

function parseExpiresAt(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("expiresAt must be a valid date string");
  }
  return date;
}

async function ensureUniqueShortCode(): Promise<string> {
  let attempt = 0;
  while (attempt < 5) {
    const code = generateShortCode();
    const existing = await prisma.url.findUnique({ where: { shortCode: code } });
    if (!existing) return code;
    attempt += 1;
  }
  throw new Error("Failed to generate unique short code");
}

export async function createShortUrl(input: CreateUrlInput): Promise<UrlResponse> {
  const originalUrl = assertValidUrl(input.originalUrl);
  const expiresAt = parseExpiresAt(input.expiresAt ?? null);
  const shortCode = await ensureUniqueShortCode();

  const created = await prisma.url.create({
    data: {
      originalUrl,
      shortCode,
      expiresAt,
    },
  });

  return {
    ...created,
    shortUrl: `${BASE_URL}/r/${created.shortCode}`,
    expiresAt: created.expiresAt ?? null,
  };
}

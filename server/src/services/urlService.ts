import prisma from "../prisma";
import { AppError } from "../middleware/errorHandler";
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
    throw new AppError("originalUrl is required", 400);
  }
  try {
    return new URL(value).toString();
  } catch {
    throw new AppError("originalUrl must be a valid URL", 400);
  }
}

function parseExpiresAt(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("expiresAt must be a valid date string", 400);
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
  throw new AppError("Failed to generate unique short code", 500);
}

function toResponse(record: {
  id: number;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
  expiresAt: Date | null;
}): UrlResponse {
  return {
    ...record,
    shortUrl: `${BASE_URL}/r/${record.shortCode}`,
    expiresAt: record.expiresAt ?? null,
  };
}

export async function createShortUrl(input: CreateUrlInput): Promise<UrlResponse> {
  const originalUrl = assertValidUrl(input.originalUrl);
  const expiresAt = parseExpiresAt(input.expiresAt ?? null);
  const shortCode = await ensureUniqueShortCode();

  const created = await prisma.url.create({
    data: { originalUrl, shortCode, expiresAt },
  });

  return toResponse(created);
}

export async function resolveAndTrack(code: string): Promise<UrlResponse> {
  if (!code) {
    throw new AppError("shortCode is required", 400);
  }

  const record = await prisma.url.findUnique({ where: { shortCode: code } });
  if (!record) {
    throw new AppError("Short URL not found", 404);
  }

  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    throw new AppError("Short URL expired", 410);
  }

  const updated = await prisma.url.update({
    where: { id: record.id },
    data: { clicks: { increment: 1 } },
  });

  return toResponse(updated);
}

export async function listUrls(): Promise<UrlResponse[]> {
  const records = await prisma.url.findMany({
    orderBy: { createdAt: "desc" },
  });
  return records.map(toResponse);
}

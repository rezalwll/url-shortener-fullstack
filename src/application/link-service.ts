import { randomUUID } from "node:crypto";
import { DomainError } from "../domain/errors.js";
import type { CreateLinkInput, LinkRecord, LinkStats, LinkView } from "../domain/link.js";
import type { LinkRepository } from "../domain/repository.js";
import type { Clock } from "../lib/clock.js";
import { decodeCursor, encodeCursor } from "../lib/cursor.js";
import { fingerprint } from "../lib/fingerprint.js";
import { createBase62Slug } from "../lib/base62.js";
import { normalizeSlug } from "../lib/slug-policy.js";
import { normalizeTarget } from "../lib/url-policy.js";
import { anonymizeVisitor, referrerHost } from "../lib/visitor.js";
import type { RateLimitDecision, RateLimiter } from "../rate-limit/types.js";

export interface ServiceOptions {
  readonly repository: LinkRepository;
  readonly clock: Clock;
  readonly rateLimiter: RateLimiter;
  readonly publicBaseUrl: string;
  readonly cursorSecret: string;
  readonly visitorSalt: string;
  readonly slugFactory?: () => string;
  readonly idFactory?: () => string;
}

export interface CreateContext {
  readonly clientKey: string;
  readonly idempotencyKey?: string;
}

export interface CreateResult {
  readonly link: LinkView;
  readonly replayed: boolean;
  readonly rateLimit: RateLimitDecision;
}

export interface ResolveContext {
  readonly clientKey: string;
  readonly referrer?: string;
}

export class LinkService {
  private readonly slugFactory: () => string;
  private readonly idFactory: () => string;

  constructor(private readonly options: ServiceOptions) {
    this.slugFactory = options.slugFactory ?? (() => createBase62Slug());
    this.idFactory = options.idFactory ?? randomUUID;
  }

  private view(link: LinkRecord): LinkView {
    return { ...link, shortUrl: `${this.options.publicBaseUrl}/r/${link.slug}` };
  }

  private expiry(value: string | null | undefined): string | null {
    if (!value) return null;
    const expiresAt = new Date(value);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= this.options.clock.now()) {
      throw new DomainError("INVALID_URL", "expiresAt must be a future ISO timestamp", 400);
    }
    return expiresAt.toISOString();
  }

  async create(input: CreateLinkInput, context: CreateContext): Promise<CreateResult> {
    const rateLimit = this.options.rateLimiter.consume(`create:${context.clientKey}`);
    if (!rateLimit.allowed) {
      throw new DomainError("RATE_LIMITED", "link creation rate limit exceeded", 429, { resetAt: rateLimit.resetAt });
    }
    const normalized = {
      target: normalizeTarget(input.target),
      customSlug: input.customSlug ? normalizeSlug(input.customSlug) : undefined,
      expiresAt: this.expiry(input.expiresAt)
    };
    const requestFingerprint = fingerprint(normalized);
    if (context.idempotencyKey) {
      const existing = await this.options.repository.findIdempotency(context.idempotencyKey);
      if (existing) {
        if (existing.fingerprint !== requestFingerprint) {
          throw new DomainError("IDEMPOTENCY_CONFLICT", "idempotency key was already used with another payload", 409);
        }
        const replay = await this.options.repository.findById(existing.linkId);
        if (replay) return { link: this.view(replay), replayed: true, rateLimit };
      }
    }

    let slug = normalized.customSlug ?? this.slugFactory();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (!(await this.options.repository.findBySlug(slug))) break;
      if (normalized.customSlug) throw new DomainError("SLUG_CONFLICT", "slug is already in use", 409);
      slug = this.slugFactory();
      if (attempt === 4) throw new DomainError("SLUG_CONFLICT", "could not allocate a unique slug", 503);
    }
    const now = this.options.clock.now().toISOString();
    const link: LinkRecord = {
      id: this.idFactory(), slug, target: normalized.target, createdAt: now, expiresAt: normalized.expiresAt,
      disabledAt: null, clicks: 0, lastVisitedAt: null, version: 1
    };
    await this.options.repository.create(link);
    if (context.idempotencyKey) {
      await this.options.repository.saveIdempotency({ key: context.idempotencyKey, fingerprint: requestFingerprint, linkId: link.id });
    }
    return { link: this.view(link), replayed: false, rateLimit };
  }

  async resolve(slugValue: string, context: ResolveContext): Promise<LinkView> {
    const slug = normalizeSlug(slugValue);
    const link = await this.options.repository.findBySlug(slug);
    if (!link) throw new DomainError("LINK_NOT_FOUND", "short link was not found", 404);
    if (link.disabledAt) throw new DomainError("LINK_DISABLED", "short link is disabled", 410);
    const now = this.options.clock.now();
    if (link.expiresAt && new Date(link.expiresAt) <= now) throw new DomainError("LINK_EXPIRED", "short link has expired", 410);
    const updated = await this.options.repository.recordClick(link.id, {
      linkId: link.id,
      occurredAt: now.toISOString(),
      visitorHash: anonymizeVisitor(context.clientKey, this.options.visitorSalt),
      referrerHost: referrerHost(context.referrer)
    });
    return this.view(updated ?? link);
  }

  async get(slugValue: string): Promise<LinkView> {
    const link = await this.options.repository.findBySlug(normalizeSlug(slugValue));
    if (!link) throw new DomainError("LINK_NOT_FOUND", "short link was not found", 404);
    return this.view(link);
  }

  async list(limitValue: number, cursorValue?: string): Promise<{ items: readonly LinkView[]; nextCursor: string | null }> {
    const limit = Math.min(100, Math.max(1, limitValue));
    const page = await this.options.repository.list(limit, decodeCursor(cursorValue, this.options.cursorSecret));
    return { items: page.items.map((link) => this.view(link)), nextCursor: page.next ? encodeCursor(page.next, this.options.cursorSecret) : null };
  }

  async disable(slugValue: string): Promise<LinkView> {
    const current = await this.options.repository.findBySlug(normalizeSlug(slugValue));
    if (!current) throw new DomainError("LINK_NOT_FOUND", "short link was not found", 404);
    const updated = await this.options.repository.disable(current.id, this.options.clock.now().toISOString());
    return this.view(updated ?? current);
  }

  async stats(slugValue: string): Promise<LinkStats> {
    const link = await this.options.repository.findBySlug(normalizeSlug(slugValue));
    if (!link) throw new DomainError("LINK_NOT_FOUND", "short link was not found", 404);
    const stats = await this.options.repository.stats(link.id);
    if (!stats) throw new DomainError("LINK_NOT_FOUND", "short link was not found", 404);
    return stats;
  }
}

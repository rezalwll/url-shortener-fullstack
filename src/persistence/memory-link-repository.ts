import { DomainError } from "../domain/errors.js";
import type { ClickEvent, LinkRecord, LinkStats } from "../domain/link.js";
import type { IdempotencyRecord, LinkCursor, LinkPage, LinkRepository } from "../domain/repository.js";

export class MemoryLinkRepository implements LinkRepository {
  protected links: LinkRecord[] = [];
  protected events: ClickEvent[] = [];
  protected idempotency = new Map<string, IdempotencyRecord>();

  async create(link: LinkRecord): Promise<LinkRecord> {
    if (this.links.some((item) => item.slug === link.slug)) throw new DomainError("SLUG_CONFLICT", "slug is already in use", 409);
    this.links.push(link);
    return link;
  }

  async findById(id: string): Promise<LinkRecord | null> {
    return this.links.find((link) => link.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<LinkRecord | null> {
    return this.links.find((link) => link.slug === slug) ?? null;
  }

  async list(limit: number, cursor: LinkCursor | null): Promise<LinkPage> {
    const sorted = [...this.links].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    const start = cursor ? sorted.findIndex((item) => item.createdAt === cursor.createdAt && item.id === cursor.id) + 1 : 0;
    const items = sorted.slice(Math.max(0, start), Math.max(0, start) + limit);
    const last = items.at(-1);
    return {
      items,
      next: start + items.length < sorted.length && last ? { createdAt: last.createdAt, id: last.id } : null
    };
  }

  async disable(id: string, disabledAt: string): Promise<LinkRecord | null> {
    const index = this.links.findIndex((link) => link.id === id);
    const current = this.links[index];
    if (!current) return null;
    const next: LinkRecord = { ...current, disabledAt, version: current.version + 1 };
    this.links[index] = next;
    return next;
  }

  async recordClick(id: string, event: ClickEvent): Promise<LinkRecord | null> {
    const index = this.links.findIndex((link) => link.id === id);
    const current = this.links[index];
    if (!current) return null;
    const next: LinkRecord = { ...current, clicks: current.clicks + 1, lastVisitedAt: event.occurredAt, version: current.version + 1 };
    this.links[index] = next;
    this.events.push(event);
    return next;
  }

  async stats(id: string): Promise<LinkStats | null> {
    const link = await this.findById(id);
    if (!link) return null;
    const events = this.events.filter((event) => event.linkId === id);
    const referrers = new Map<string, number>();
    for (const event of events) if (event.referrerHost) referrers.set(event.referrerHost, (referrers.get(event.referrerHost) ?? 0) + 1);
    return {
      linkId: id,
      clicks: link.clicks,
      uniqueVisitors: new Set(events.map((event) => event.visitorHash)).size,
      referrers: [...referrers].map(([host, clicks]) => ({ host, clicks })).sort((a, b) => b.clicks - a.clicks || a.host.localeCompare(b.host))
    };
  }

  async findIdempotency(key: string): Promise<IdempotencyRecord | null> {
    return this.idempotency.get(key) ?? null;
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<void> {
    this.idempotency.set(record.key, record);
  }

  async ready(): Promise<boolean> {
    return true;
  }
}
